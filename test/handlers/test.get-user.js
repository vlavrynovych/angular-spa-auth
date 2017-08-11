describe('Handlers:', function () {
    var AuthService, $rootScope, $http, $httpBackend;
    var customUser = { id: 44 };
    var customEndpoint = '/api/profile/current';

    beforeEach(module('angular-spa-auth'));
    beforeEach(inject(function(_AuthService_, _$rootScope_, _$httpBackend_, _$http_){
        AuthService = _AuthService_;
        $rootScope = _$rootScope_;
        $http = _$http_;
        $httpBackend = _$httpBackend_;

        //setup backend
        $httpBackend.whenGET(ENDPOINTS.CURRENT_USER_SUCCESS).respond(200, USER);
        $httpBackend.whenGET(ENDPOINTS.CURRENT_USER_ERROR).respond(500);
        $httpBackend.whenGET(customEndpoint).respond(200, customUser);
    }));

    describe('getUser():', function () {

        it('Default handler', function () {
            //given: by default currentUser is null

            //then: so let's check that
            expect(AuthService.config.endpoints.currentUser).toBeNull();
            
            //when: set some route and start spying
            AuthService.config.endpoints.currentUser = ENDPOINTS.CURRENT_USER_SUCCESS;
            spy();

            //and: trigger handler via refreshCurrentUser() method
            AuthService.refreshCurrentUser();
            $httpBackend.flush();

            //then:
            checkIfCalled(1);
        });

        it('No currentUser endpoint provided', function () {
            //given: by default currentUser is null

            //then: check exception
            expect(function() {
                AuthService.refreshCurrentUser();
            }).toThrowError("Endpoint for current user is not specified");
        });

        it('Custom handler', function () {
            //when:
            var receivedUser = null;
            setupAndSpy(function () {
                return $http.get(customEndpoint).then(function (response) {
                    receivedUser = response.data;
                });
            });
            // -> getUser automatically called on .run
            $httpBackend.flush();

            //then:
            checkIfCalled(1);
            expect(AuthService.config.endpoints.currentUser).toBeNull();
            expect(receivedUser).toEqual(customUser);
        });

        it('Custom handler: fail', function () {
            //when:
            var receivedUser = null;
            var failed = false;
            AuthService.run({
                handlers: {
                    getUser: function () {
                        return $http.get(ENDPOINTS.CURRENT_USER_ERROR).then(function (response) {
                            receivedUser = response.data;
                        }).catch(function () {
                            failed = true;
                        });
                    }
                }
            });
            // -> getUser automatically called on .run

            //and: spy and flush backend response
            spy();
            $httpBackend.flush();

            //then:
            checkIfCalled(1);
            expect(AuthService.config.endpoints.currentUser).toBeNull(); // no need to specify
            expect(receivedUser).toBeNull();
            expect(failed).toBeTruthy();
        });

        function setupAndSpy(logoutHandler) {
            AuthService.run({
                handlers: {
                    getUser: logoutHandler
                }
            });

            spy();
        }

        function spy() {
            spyOn(AuthService.config.handlers, 'getUser').and.callThrough();
        }

        function checkIfCalled(count) {
            expect(AuthService.config.handlers.getUser).toHaveBeenCalled();
            expect(AuthService.config.handlers.getUser.calls.count()).toEqual(count);
        }

    });
});