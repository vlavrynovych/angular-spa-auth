describe('angular-spa-auth', function () {

    var AuthService, $rootScope, $location, $httpBackend;

    beforeEach(module('test-app'));
    beforeEach(inject(function(_AuthService_, _$rootScope_, _$location_, _$httpBackend_){
        console.info('---------------------------- APP TEST');
        AuthService = _AuthService_;
        $rootScope = _$rootScope_;
        $location = _$location_;
        $httpBackend = _$httpBackend_;

        //setup backend
        $httpBackend.whenGET(ENDPOINTS.IS_AUTHENTICATED_SUCCESS).respond(200, true);
        $httpBackend.whenGET(ENDPOINTS.IS_AUTHENTICATED_ERROR).respond(200, false);

        $httpBackend.whenPOST(ENDPOINTS.LOGIN_SUCCESS).respond(200);
        $httpBackend.whenPOST(ENDPOINTS.LOGIN_ERROR).respond(400);

        $httpBackend.whenGET(ENDPOINTS.LOGOUT_SUCCESS).respond(200);
        $httpBackend.whenGET(ENDPOINTS.LOGOUT_ERROR).respond(400);

        $httpBackend.whenGET(ENDPOINTS.CURRENT_USER_SUCCESS).respond(200, USER);
        $httpBackend.whenGET(ENDPOINTS.CURRENT_USER_ERROR).respond(500);
    }));

    describe('test', function () {

        var events = [];

        it('User is not logged in on start', function () {
            //given:
            expect($rootScope.currentUser).toBeUndefined();
            events = [];

            $rootScope.$on("$routeChangeStart", function(e) {
                e.path = $location.path();
                e.i = events.length;
                events.push(e);
            });

            //when: isAuthenticated method is triggered but we still do not know status of user
            changeRoute('/public');

            //then: public page is always available
            expect($location.path()).toEqual('/public');
            expect($rootScope.currentUser).toBeUndefined();
            checkEvent(false);

            //when: isAuthenticated method is triggered but we still do not know status of user
            changeRoute('/private');

            //then: private page is rejected
            checkEvent(true);
            expect($rootScope.currentUser).toBeUndefined();

            //when: trigger after init
            $httpBackend.flush();

            //then: we are on login page and user is set to false, because we checked his authentication status
            expect($location.path()).toEqual(AuthService.config.uiRoutes.login);
            expect($rootScope.currentUser).toEqual(false);

            //when: try to go to the public page
            changeRoute('/public');

            //then: successfully opened public page, user is still not authenticated
            expect($location.path()).toEqual('/public');
            expect($rootScope.currentUser).toEqual(false);
            checkEvent(false);

            //when: try to go to the private page
            changeRoute('/private');


            //then: rejected and redirected back to the login page, not authenticated
            expect($location.path()).toEqual(AuthService.config.uiRoutes.login);
            expect($rootScope.currentUser).toEqual(false);
            checkEvent(true);

            //when: try to login using some credentials
            AuthService.login(credentials);
            $httpBackend.flush();

            //then: successfully authenticated and redirected to the home page
            expect($location.path()).toEqual(AuthService.config.uiRoutes.home);
            expect($rootScope.currentUser).toEqual(USER);

            //when: try to go to the private page again
            changeRoute('/private');

            //then: successfully loaded private page
            expect($location.path()).toEqual('/private');
            expect($rootScope.currentUser).toEqual(USER);
            checkEvent(false);

            //when: try to go to the login page after login
            changeRoute(AuthService.config.uiRoutes.login);

            //then: should be rejected and redirected to the home page
            expect($location.path()).toEqual(AuthService.config.uiRoutes.home);
            expect($rootScope.currentUser).toEqual(USER);
            checkEvent(true);

            //when: logout
            AuthService.logout();
            $httpBackend.flush();

            //then:
            expect($location.path()).toEqual('/login');
            expect($rootScope.currentUser).toBeNull();

            //when: try to go to the private page again
            changeRoute('/private');

            //then: should be rejected
            expect($location.path()).toEqual(AuthService.config.uiRoutes.login);
            expect($rootScope.currentUser).toBeNull();
            checkEvent(true);
        });


        it('Refresh when you are on the login page and login', function () {
            //given:
            expect($rootScope.currentUser).toBeUndefined();
            events = [];
            AuthService.config.uiRoutes.target = AuthService.config.uiRoutes.login;

            $rootScope.$on("$routeChangeStart", function(e) {
                e.path = $location.path();
                e.i = events.length;
                events.push(e);
            });

            //when: isAuthenticated method is triggered but we still do not know status of user
            changeRoute(AuthService.config.uiRoutes.login);

            //then: login page is available
            expect($location.path()).toEqual(AuthService.config.uiRoutes.login);
            expect($rootScope.currentUser).toBeUndefined();
            checkEvent(false);

            //when: trigger after init
            $httpBackend.flush();

            //then: we are on login page and user is set to false, because we checked his authentication status
            expect($location.path()).toEqual(AuthService.config.uiRoutes.login);
            expect($rootScope.currentUser).toEqual(false);

            //when: try to login using some credentials
            AuthService.login(credentials);
            $httpBackend.flush();

            //then: successfully authenticated and redirected to the home page EVEN if the target is login
            expect($location.path()).toEqual(AuthService.config.uiRoutes.home);

            //when: try again to go to the login page
            changeRoute(AuthService.config.uiRoutes.login);

            //then: successfully authenticated and redirected to the home page EVEN if the target is login
            expect($location.path()).toEqual(AuthService.config.uiRoutes.home);
        });

        function changeRoute(path) {
            $location.path(path);
            $rootScope.$broadcast("$routeChangeStart", {
                $$route: {
                    originalPath: path
                }
            });
            $rootScope.$broadcast("$routeChangeSuccess");
        }

        /**
         * Should be called only when $routeChangeStart is triggered
         * @param prevented
         */
        function checkEvent(prevented) {
            var event = events[events.length -1];
            console.info('checkEvent', 'index = ' + event.i, 'event.path = ' + event.path);
            expect(event).not.toBeNull();
            expect(event.defaultPrevented).toEqual(prevented);
        }
    })

});