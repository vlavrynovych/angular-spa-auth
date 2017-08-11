describe('Handlers:', function () {
    var AuthService, $httpBackend;

    beforeEach(module('angular-spa-auth'));
    beforeEach(inject(function(_AuthService_, _$httpBackend_){
        AuthService = _AuthService_;
        $httpBackend = _$httpBackend_;

        //setup
        AuthService.config.verbose = true;
        AuthService.config.endpoints.isAuthenticated = ENDPOINTS.IS_AUTHENTICATED_SUCCESS;
        AuthService.config.endpoints.currentUser = ENDPOINTS.CURRENT_USER_SUCCESS;
        AuthService.config.endpoints.login = ENDPOINTS.LOGIN_SUCCESS;
    }));

    function setupBackend() {
        //setup backend
        $httpBackend.whenGET(ENDPOINTS.CURRENT_USER_SUCCESS).respond(200, USER);
        $httpBackend.whenGET(ENDPOINTS.IS_AUTHENTICATED_SUCCESS).respond(200, true);
        $httpBackend.whenPOST(ENDPOINTS.LOGIN_SUCCESS).respond(200);
    }

    describe('success():', function () {

        it('Call default handler using .login() method', function () {
            //given:
            setupBackend();
            spy();

            //when: call login method
            AuthService.login();
            $httpBackend.flush();

            //then:
            checkIfCalled(1, USER);
        });
        
        it('Call custom handler using .run() method', function () {
            //given: set success handler
            var testValue = false;
            setupBackend();
            setupAndSpy(function (user) {
                testValue = user;
            });
            // -> calls .run method which uses success handler inside
            $httpBackend.flush();

            //then:
            checkIfCalled(1, USER);
            expect(testValue).toEqual(USER);
        });

        it('Call custom handler using .login() method', function () {
            //setup backend
            var currentUserRequestHandlers = $httpBackend.whenGET(ENDPOINTS.CURRENT_USER_SUCCESS).respond(500);
            $httpBackend.whenGET(ENDPOINTS.IS_AUTHENTICATED_SUCCESS).respond(200, false);

            //given: set custom success handler
            var testValue = false;
            setupAndSpy(function (user) {
                testValue = user;
            });
            // -> calls .run method which uses success handler inside
            $httpBackend.flush();

            //then:
            expect(AuthService.config.handlers.success.calls.count()).toEqual(0);

            //setup backend
            currentUserRequestHandlers.respond(200, USER);
            $httpBackend.whenPOST(ENDPOINTS.LOGIN_SUCCESS).respond(200);

            //when: call login method
            AuthService.login();
            $httpBackend.flush();

            //then:
            checkIfCalled(1, USER);
            expect(testValue).toEqual(USER);
        });

        function setupAndSpy(logoutHandler) {
            AuthService.run({
                handlers: {
                    success: logoutHandler
                }
            });

            spy();
        }

        function spy() {
            spyOn(AuthService.config.handlers, 'success').and.callThrough();
        }

        function checkIfCalled(count, data) {
            if(data) {
                expect(AuthService.config.handlers.success).toHaveBeenCalledWith(data);
            } else {
                expect(AuthService.config.handlers.success).toHaveBeenCalled();
            }
            expect(AuthService.config.handlers.success.calls.count()).toEqual(count);
        }

    });
});