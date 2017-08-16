describe('angular-spa-auth', function () {

    var AuthService, $rootScope, $location, $httpBackend, isAuthenticatedResponse;

    beforeEach(module('test-app'));
    beforeEach(inject(function(_AuthService_, _$rootScope_, _$location_, _$httpBackend_){
        console.info('---------------------------- APP TEST');
        AuthService = _AuthService_;
        $rootScope = _$rootScope_;
        $location = _$location_;
        $httpBackend = _$httpBackend_;

        //setup backend:
        // html templates
        $httpBackend.whenGET('./private/private.html').respond(200, '<div>hello</div>');
        $httpBackend.whenGET('./login/login.html').respond(200, '<div>hello</div>');
        $httpBackend.whenGET('./home/home.html').respond(200, '<div>hello</div>');
        $httpBackend.whenGET('./public/public.html').respond(200, '<div>hello</div>');

        // rest api
        isAuthenticatedResponse = $httpBackend.whenGET(ENDPOINTS.IS_AUTHENTICATED_ERROR).respond(200, false);

        $httpBackend.whenPOST(ENDPOINTS.LOGIN_SUCCESS).respond(200);
        $httpBackend.whenPOST(ENDPOINTS.LOGIN_ERROR).respond(400);

        $httpBackend.whenGET(ENDPOINTS.LOGOUT_SUCCESS).respond(200);
        $httpBackend.whenGET(ENDPOINTS.LOGOUT_ERROR).respond(400);

        $httpBackend.whenGET(ENDPOINTS.CURRENT_USER_SUCCESS).respond(200, USER);
        $httpBackend.whenGET(ENDPOINTS.CURRENT_USER_ERROR).respond(500);
    }));

    afterEach(inject(function(){
        $location._path && ($location.path = $location._path);
    }));

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    describe('test', function () {

        var events = [];

        it('User is not logged in on start', function () {
            //given:
            expect($rootScope.currentUser).toBeUndefined();
            watch($location);

            //when: isAuthenticated method is triggered but we still do not know status of user
            $location.path('/public');

            //then: public page is always available
            expect($location.path()).toEqual('/public');
            expect($rootScope.currentUser).toBeUndefined();
            checkEvent(false, '/public');

            //when: isAuthenticated method is triggered but we still do not know status of user
            $location.path('/private');

            //then: private page is rejected
            checkEvent(true, '/private');
            expect($rootScope.currentUser).toBeUndefined();

            //when: trigger after init
            $httpBackend.flush();

            //then: we are on login page and user is set to false, because we checked his authentication status
            expect($location.path()).toEqual(AuthService.config.uiRoutes.login);
            expect($rootScope.currentUser).toEqual(false);

            //when: try to go to the public page
            $location.path('/public');

            //then: successfully opened public page, user is still not authenticated
            expect($location.path()).toEqual('/public');
            expect($rootScope.currentUser).toEqual(false);
            checkEvent(false);

            //when: try to go to the private page
            $location.path('/private');

            //then: rejected and redirected back to the login page, not authenticated
            expect($location.path()).toEqual(AuthService.config.uiRoutes.login);
            expect($rootScope.currentUser).toEqual(false);
            checkEvent(true, '/private');

            //when: try to login using some credentials
            AuthService.login(credentials);
            $httpBackend.flush();

            //then: successfully authenticated and redirected to the home page
            expect($location.path()).toEqual(AuthService.config.uiRoutes.home);
            expect($rootScope.currentUser).toEqual(USER);

            //when: try to go to the private page again
            $location.path('/private');

            //then: successfully loaded private page
            expect($location.path()).toEqual('/private');
            expect($rootScope.currentUser).toEqual(USER);
            checkEvent(false, '/private');

            //when: try to go to the login page after login
            $location.path(AuthService.config.uiRoutes.login);

            //then: should be rejected and redirected to the home page
            expect($location.path()).toEqual(AuthService.config.uiRoutes.home);
            expect($rootScope.currentUser).toEqual(USER);
            checkEvent(true, AuthService.config.uiRoutes.login);

            //when: logout
            AuthService.logout();
            $httpBackend.flush();

            //then:
            expect($location.path()).toEqual('/login');
            expect($rootScope.currentUser).toBeNull();

            //when: try to go to the private page again
            $location.path('/private');

            //then: should be rejected
            expect($location.path()).toEqual(AuthService.config.uiRoutes.login);
            expect($rootScope.currentUser).toBeNull();
            checkEvent(true, '/private');
        });

        it('Refresh when you are on the login page and login', function () {
            //given:
            expect($rootScope.currentUser).toBeUndefined();

            AuthService.config.uiRoutes.target = AuthService.config.uiRoutes.login;
            watch($location);

            //when: isAuthenticated method is triggered but we still do not know status of user
            $location.path(AuthService.config.uiRoutes.login);

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
            $location.path(AuthService.config.uiRoutes.login);

            //then: successfully authenticated and redirected to the home page EVEN if the target is login
            expect($location.path()).toEqual(AuthService.config.uiRoutes.home);
        });

        it('Refresh when you are authenticated and on the private page', function () {
            //setup backend
            isAuthenticatedResponse.respond(200, true);

            //given:
            // we can only test the second part of refresh when app start after reload
            // isAuthenticated returns true, getCurrentUser returns user, the target page is set to the /private path
            AuthService.config.uiRoutes.target = '/private';
            $location.path('/private');
            watch($location);

            //and:
            expect($location.path()).toEqual('/private');
            expect($rootScope.currentUser).toBeUndefined();

            //and: trigger after init
            $httpBackend.flush(1);
            $location._path('/private'); // we still on the private page
            $httpBackend.flush();

            //then: we are on login page and user is set to false, because we checked his authentication status
            expect($location.path()).toEqual('/private');
            expect($rootScope.currentUser).toEqual(USER);
        });

        function watch($location) {
            events = [];
            $rootScope.$on("$routeChangeStart", function(e, next) {
                e.path = next.$$route.originalPath;
                e.i = events.length;
                console.info('<-[ Event ] << Add: ', 'index = ' + e.i, 'event.path = ' + e.path, 'prevented = ' + e.defaultPrevented);
                events.push(e);
            });

            $location._path = $location.path;
            var inProgress = false;
            var queue = [];

            $location.path = function (path) {
                if(!path) {
                    return $location._path()
                }

                $location._path(path);

                if(inProgress) {
                    //add to queue
                    console.info('[[[ Queue ]]] << Add: ' + path);
                    queue.push(path);
                } else {
                    inProgress = true;
                    process(path);

                    if(queue.length) {
                        var next = queue[0];
                        process(next);
                        queue.splice(0, 1);
                    }
                    inProgress = false;
                }

                function process(path) {
                    console.info('[[[ Queue ]]] >> Process: ' + path);
                    console.info('Attempt to go to the: ' + path);
                    $rootScope.$broadcast("$routeChangeStart", {
                        $$route: {
                            originalPath: path
                        }
                    });

                    $rootScope.$on("$routeChangeSuccess", function(e) {
                        inProgress = false;
                    });

                    if(!getLastEvent().defaultPrevented) {
                        $rootScope.$broadcast("$routeChangeSuccess");
                    }
                }
            }
        }

        /**
         * Should be called only when $routeChangeStart is triggered
         * @param prevented
         * @param [path]
         */
        function checkEvent(prevented, path) {
            var event;
            if(path) {
                var index = events.length - 1;
                for ( ; index >= 0; index--) {
                    if (events[index].path == path) {
                        event = events[index];
                        break;
                    }
                }
            } else {
                event = getLastEvent();
            }

            console.info('<-[ Event ] >> Check: ', 'index = ' + event.i, 'event.path = ' + event.path, 'prevented = ' + event.defaultPrevented);
            expect(event).not.toBeNull();
            expect(event.defaultPrevented).toEqual(prevented);
        }

        function getLastEvent() {
            return events[events.length -1];
        }
    })

});