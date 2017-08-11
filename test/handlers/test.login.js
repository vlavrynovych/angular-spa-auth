describe('Handlers:', function () {
    var AuthService, $location, $http, $httpBackend;

    beforeEach(module('angular-spa-auth'));
    beforeEach(inject(function(_AuthService_, _$location_, _$httpBackend_, _$http_){
        AuthService = _AuthService_;
        $location = _$location_;
        $http = _$http_;
        $httpBackend = _$httpBackend_;

        //setup backend
        $httpBackend.whenPOST(AuthService.config.endpoints.login).respond(200);
        $httpBackend.whenPOST(ENDPOINTS.LOGIN_SUCCESS).respond(200);
        $httpBackend.whenPOST(ENDPOINTS.LOGIN_ERROR).respond(500);
        $httpBackend.whenGET(ENDPOINTS.LOGIN_SUCCESS).respond(500);

        AuthService.config.endpoints.currentUser = ENDPOINTS.CURRENT_USER_SUCCESS;
        $httpBackend.whenGET(ENDPOINTS.CURRENT_USER_SUCCESS).respond(200, USER);
    }));

    describe('login(credentials):', function () {
        it('basic check', function () {
            //given: '' is default state
            expect($location.path()).toEqual('');

            //when: default login
            AuthService.login(credentials);
            $httpBackend.flush();

            //then: should redirect to login page
            expect($location.path()).toEqual('/home');

            //when: setup custom login handler with a POST method
            setupAndSpy(function () {
                return $http.post(ENDPOINTS.LOGIN_SUCCESS);
            });

            //and: call custom login
            AuthService.login(credentials);
            $httpBackend.flush();

            //then: check if called
            checkIfCalled(credentials);
        });

        it('custom login handler fails', function () {
            //given:
            var failed = false;

            //when: setup custom login handler with a GET method that should fail
            setupAndSpy(function (credentials) {
                return $http.get(ENDPOINTS.LOGIN_SUCCESS);
            });

            //and: call custom login
            AuthService.login(credentials).catch(function () {
                failed = true;
            });
            $httpBackend.flush();

            //then: check if called
            checkIfCalled(credentials);
            expect(failed).toBeTruthy('custom login does not fail');
        });

        it('no login endpoint', function () {
            //given: login endpoint is not specified
            AuthService.config.endpoints.login = null;

            //then: validation error
            expect(function() {
                AuthService.login();
            }).toThrowError("Login endpoint is not specified");
        });

        it('default login handler fails', function () {
            //given: login endpoint returns 500
            AuthService.run({
                endpoints: {
                    login: ENDPOINTS.LOGIN_ERROR
                }
            });

            //when:
            var failed = false;
            AuthService.login().catch(function () {
                failed = true;
            });
            $httpBackend.flush();
            
            //then: validation error
            expect(failed).toBeTruthy('custom login does not fail');
        });
        
        function setupAndSpy(loginHandler) {
            AuthService.run({
                handlers: {
                    login: loginHandler
                }
            });

            spyOn(AuthService.config.handlers, 'login').and.callThrough();
        }

        function checkIfCalled(credentials) {
            expect(AuthService.config.handlers.login).toHaveBeenCalledWith(credentials);
            expect(AuthService.config.handlers.login.calls.count()).toEqual(1);
        }
    });
});