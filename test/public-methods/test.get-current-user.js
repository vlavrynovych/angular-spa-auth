describe('Public methods:', function () {
    var AuthService, $rootScope, $httpBackend;

    beforeEach(module('angular-spa-auth'));
    beforeEach(inject(function(_AuthService_, _$rootScope_, _$httpBackend_){
        AuthService = _AuthService_;
        $rootScope = _$rootScope_;
        $httpBackend = _$httpBackend_;

        //setup
        AuthService.config.endpoints.currentUser = ENDPOINTS.CURRENT_USER_SUCCESS;

        //setup backend
        $httpBackend.whenGET(ENDPOINTS.CURRENT_USER_SUCCESS).respond(200, USER);
    }));

    describe('getCurrentUser():', function () {

        it('If user is authenticated', function () {
            //given: simulate authenticated status
            $rootScope.currentUser = USER;

            //when: call method
            var result = null;
            AuthService.getCurrentUser().then(function (res) {
                result = res;
            });
            $rootScope.$apply();

            //then:
            expect(result).toEqual(USER);
        });

        it('If user is NOT authenticated', function () {
            //given:
            $rootScope.currentUser = null;

            //when: call method
            var result = null;
            var promise = AuthService.getCurrentUser().then(function (res) {
                result = res;
            });

            //then: no result and it returns promise
            expect(result).toBeNull();
            expect(promise.$$state).toBeTruthy();

            //and: promise is pending
            expect(promise.$$state.status).toBe(0);
            /*
             promise.$$state.status === 0 // pending
             promise.$$state.status === 1 // resolved
             promise.$$state.status === 2 // rejected
             */

            //when:
            $httpBackend.flush();

            //then:
            expect(promise.$$state.status).toBe(1);
            expect(result).toEqual(USER);
        })
    });
});