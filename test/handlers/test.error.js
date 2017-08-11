describe('Handlers:', function () {
    var AuthService, $httpBackend;

    beforeEach(module('angular-spa-auth'));
    beforeEach(inject(function(_AuthService_, _$httpBackend_){
        AuthService = _AuthService_;
        $httpBackend = _$httpBackend_;

        //setup
        AuthService.config.verbose = true;
        AuthService.config.endpoints.isAuthenticated = ENDPOINTS.IS_AUTHENTICATED_SUCCESS;
        AuthService.config.endpoints.login = ENDPOINTS.LOGIN_SUCCESS;

        //setup backend
        $httpBackend.whenGET(ENDPOINTS.IS_AUTHENTICATED_SUCCESS).respond(200, false);
        $httpBackend.whenPOST(ENDPOINTS.LOGIN_SUCCESS).respond(500);
    }));

    describe('error():', function () {

        it('Call default handler using .login() method', function () {
            //given:
            spy();

            //when: call login method
            AuthService.login();
            $httpBackend.flush();

            //then:
            checkIfCalled(1, false);
        });
        
        it('Call custom handler using .run() method', function () {
            //given: set error handler
            var testValue = false;
            setupAndSpy(function (err) {
                testValue = err;
            });
            // -> calls .run method which uses error handler inside
            $httpBackend.flush();

            //then:
            checkIfCalled(1, false);
            expect(testValue).toEqual(false);
        });

        it('Call custom handler using .login() method', function () {
            //given: set custom error handler
            var errorResponse = false;
            setupAndSpy(function (err) {
                errorResponse = err;
            });
            // -> calls .run method which uses error handler inside
            $httpBackend.flush();

            //then:
            expect(AuthService.config.handlers.error.calls.count()).toEqual(1);

            //when: call login method
            AuthService.login();
            $httpBackend.flush();

            //then:
            checkIfCalled(2);
            expect(errorResponse.status).toEqual(500);
        });

        function setupAndSpy(logoutHandler) {
            AuthService.run({
                handlers: {
                    error: logoutHandler
                }
            });

            spy();
        }

        function spy() {
            spyOn(AuthService.config.handlers, 'error').and.callThrough();
        }

        function checkIfCalled(count, data) {
            if(data) {
                expect(AuthService.config.handlers.error).toHaveBeenCalledWith(data);
            } else {
                expect(AuthService.config.handlers.error).toHaveBeenCalled();
            }
            expect(AuthService.config.handlers.error.calls.count()).toEqual(count);
        }

    });
});