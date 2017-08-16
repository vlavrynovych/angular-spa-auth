describe('Public methods:', function () {
    var AuthService, $rootScope, $location, $httpBackend;

    beforeEach(module('angular-spa-auth'));
    beforeEach(inject(function(_AuthService_, _$rootScope_, _$location_, _$httpBackend_){
        AuthService = _AuthService_;
        $rootScope = _$rootScope_;
        $location = _$location_;
        $httpBackend = _$httpBackend_;

        //setup backend
        $httpBackend.whenGET(ENDPOINTS.IS_AUTHENTICATED_SUCCESS).respond(200, true);
        $httpBackend.whenGET(ENDPOINTS.IS_AUTHENTICATED_ERROR).respond(500);
        $httpBackend.whenGET(ENDPOINTS.CURRENT_USER_SUCCESS).respond(200, USER);
        $httpBackend.whenGET(ENDPOINTS.CURRENT_USER_ERROR).respond(500);
    }));

    describe('run():', function () {
        it('Config parameters set properly', function () {
            //given:
            var config = {
                verbose: true,
                publicUrls: ['/new-url'],
                endpoints: {
                    isAuthenticated: ENDPOINTS.IS_AUTHENTICATED_SUCCESS
                },
                uiRoutes: {
                    login: '/login-custom',
                    target: '/default'
                },
                handlers: {
                    getHomePage: function () {
                        return '/dashboard'
                    }
                }
            };

            //when: call method
            AuthService.run(config);

            //then:
            expect(AuthService.config.verbose).toEqual(config.verbose);
            expect(AuthService.config.publicUrls).toEqual(config.publicUrls);
            expect(AuthService.config.endpoints.isAuthenticated).toEqual(config.endpoints.isAuthenticated);
            expect(AuthService.config.uiRoutes.login).toEqual(config.uiRoutes.login);
            expect(AuthService.config.uiRoutes.target).toEqual(config.uiRoutes.target);
            expect(AuthService.config.handlers.getHomePage).toEqual(config.handlers.getHomePage);
        });

        it('Check init method which is inside of .run', function () {
            //given:
            var loginPage = '/login-page';
            var homePage = '/home-page';
            var success = null;
            $rootScope.currentUser = null;
            var config = {
                uiRoutes: {
                    login: loginPage,
                    home: homePage
                },
                endpoints: {
                    isAuthenticated: ENDPOINTS.IS_AUTHENTICATED_SUCCESS,
                    currentUser: ENDPOINTS.CURRENT_USER_SUCCESS
                },
                handlers: {
                    success: function () {
                        success = true;
                    },
                    error: function () {
                        success = false;
                    }
                }
            };

            //and:
            expect($location.path()).toEqual('');
            expect(success).toBeNull();
            expect($rootScope.currentUser).toBeNull();

            //when:
            AuthService.run(config);
            $httpBackend.flush();

            //then:
            expect(success).not.toBeNull();
            expect(success).toEqual(true);
            expect($location.path()).toEqual(homePage);
            expect($rootScope.currentUser).toEqual(USER);


            //when: refresh state
            $rootScope.currentUser = null;
            success = null;
            $location.path('/some-page');

            //and:
            expect($location.path()).toEqual('/some-page');
            expect(success).toBeNull();
            expect($rootScope.currentUser).toBeNull();

            //and: update config
            config.endpoints.isAuthenticated = ENDPOINTS.IS_AUTHENTICATED_ERROR;
            config.endpoints.currentUser = ENDPOINTS.CURRENT_USER_ERROR;

            //and: run again
            AuthService.run(config);
            $httpBackend.flush();

            //then:
            expect(success).not.toBeNull();
            expect(success).toEqual(false);
            expect($location.path()).toEqual(loginPage);
        });

        it('No config provided', function () {
            expect(function() {
                AuthService.run();
                $httpBackend.flush();
            }).toThrowError("Endpoint for current user is not specified");
        })
    });
});