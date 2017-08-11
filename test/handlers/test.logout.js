describe('Handlers: ', function () {
    var AuthService, $location, $http, $httpBackend;

    beforeEach(module('angular-spa-auth'));
    beforeEach(inject(function(_AuthService_, _$location_, _$httpBackend_, _$http_){
        AuthService = _AuthService_;
        $location = _$location_;
        $http = _$http_;
        $httpBackend = _$httpBackend_;

        //setup
        $httpBackend.whenGET(AuthService.config.endpoints.logout).respond(200);
        $httpBackend.whenGET(ENDPOINTS.LOGOUT_SUCCESS).respond(200);
        $httpBackend.whenGET(ENDPOINTS.LOGOUT_ERROR).respond(500);

        AuthService.config.endpoints.currentUser = ENDPOINTS.CURRENT_USER;
        $httpBackend.whenGET(ENDPOINTS.CURRENT_USER).respond(200, USER);
    }));

    describe('logout: ', function () {
        it('basic check', function () {
            //given: '' is default state
            expect($location.path()).toEqual('');

            //when: default logout
            AuthService.logout();
            $httpBackend.flush();

            //then: should redirect to login page
            expect($location.path()).toEqual('/login');

            //when: setup custom logout handler with a GET method
            setupAndSpy(function () {
                return $http.get(ENDPOINTS.LOGOUT_SUCCESS);
            });

            //and: call custom logout
            AuthService.logout();
            $httpBackend.flush();

            //then: check if called
            checkIfCalled();
        });

        it('custom logout handler fails', function () {
            //given:
            var failed = false;

            //when: setup custom logout handler with a GET method that should fail
            setupAndSpy(function () {
                return $http.get(ENDPOINTS.LOGOUT_ERROR);
            });

            //and: call custom logout
            AuthService.logout().catch(function () {
                failed = true;
            });
            $httpBackend.flush();

            //then: check if called
            checkIfCalled();
            expect(failed).toEqual(true, 'custom logout does not fail');
        });

        it('no logout endpoint', function () {
            //given: logout endpoint is not specified
            AuthService.config.endpoints.logout = null;

            //then: validation error
            expect(function() {
                AuthService.logout();
            }).toThrowError("Logout endpoint is not specified");
        });

        it('default logout handler fails', function () {
            //given: logout endpoint returns 500
            AuthService.run({
                endpoints: {
                    logout: ENDPOINTS.LOGOUT_ERROR
                }
            });

            //when:
            var failed = false;
            AuthService.logout().catch(function () {
                failed = true;
            });
            $httpBackend.flush();
            
            //then: validation error
            expect(failed).toEqual(true, 'custom logout does not fail');
        });
        
        function setupAndSpy(logoutHandler) {
            AuthService.run({
                handlers: {
                    logout: logoutHandler
                }
            });

            spyOn(AuthService.config.handlers, 'logout').and.callThrough();
        }

        function checkIfCalled() {
            expect(AuthService.config.handlers.logout).toHaveBeenCalled();
            expect(AuthService.config.handlers.logout.calls.count()).toEqual(1);
        }
    });
});