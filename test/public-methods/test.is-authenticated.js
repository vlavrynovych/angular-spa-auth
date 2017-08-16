describe('Public methods:', function () {
    var AuthService, $rootScope;

    beforeEach(module('angular-spa-auth'));
    beforeEach(inject(function(_AuthService_, _$rootScope_){
        AuthService = _AuthService_;
        $rootScope = _$rootScope_;
    }));

    describe('isAuthenticated():', function () {
        it('Authenticated = true', function () {
            //given:
            $rootScope.currentUser = USER;

            //when:
            var res = AuthService.isAuthenticated();

            //then:
            expect(res).toBeTruthy();
        });

        it('Authenticated = false', function () {
            //given:
            $rootScope.currentUser = null;

            //when:
            var res = AuthService.isAuthenticated();

            //then:
            expect(res).toBeFalsy();
        });
    });
});