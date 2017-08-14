describe('angular-spa-auth', function () {

    var AuthService, $rootScope, $location, $httpBackend, $timeout;

    beforeEach(module('test-app'));
    beforeEach(inject(function(_AuthService_, _$rootScope_, _$location_, _$httpBackend_, _$timeout_){
        console.info('---------------------------- APP TEST');
        AuthService = _AuthService_;
        $rootScope = _$rootScope_;
        $location = _$location_;
        $httpBackend = _$httpBackend_;
        $timeout = _$timeout_;

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


        it('User is not logged in on start', function () {
            //given:
            expect($rootScope.currentUser).toBeUndefined();

            //when: trigger after init
            $httpBackend.flush();

            //then:
            expect($location.path()).toEqual(AuthService.config.uiRoutes.login);
            expect($rootScope.currentUser).toBeUndefined();

            //when: try to go to the public page
            changeRoute('/public');

            //then:
            expect($location.path()).toEqual('/public');
            expect($rootScope.currentUser).toBeUndefined();

            //when: try to go to the private page
            changeRoute('/private');

            //then:
            expect($location.path()).toEqual(AuthService.config.uiRoutes.login);
            expect($rootScope.currentUser).toBeUndefined();

            //when: try to login
            AuthService.login(credentials);
            $httpBackend.flush();

            //then:
            expect($location.path()).toEqual(AuthService.config.uiRoutes.home);
            expect($rootScope.currentUser).toEqual(USER);

            //when: try to go to the private page again
            changeRoute('/private');

            //then:
            expect($location.path()).toEqual('/private');
            expect($rootScope.currentUser).toEqual(USER);

            //when: logout
            AuthService.logout();
            $httpBackend.flush();

            //then:
            expect($location.path()).toEqual('/login');
            expect($rootScope.currentUser).toBeNull();

            //when: try to go to the private page again
            changeRoute('/private');

            //then:
            expect($location.path()).toEqual(AuthService.config.uiRoutes.login);
            expect($rootScope.currentUser).toBeNull();
        });

        function changeRoute(path) {
            $location.path(path);
            $rootScope.$broadcast("$routeChangeStart", {
                $$route: {
                    originalPath: path
                }
            });
            $timeout.flush();
        }
    })

});