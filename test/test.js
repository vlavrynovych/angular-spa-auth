describe('test angular-spa-auth module', function () {
    var AuthService;

    beforeEach(module('angular-spa-auth'));
    beforeEach(inject(function(_AuthService_){
        AuthService = _AuthService_;
    }));

    describe('angular-spa-auth: public methods', function () {
        it('isPublic', function () {
            //given:
            var privatePath = '/manage/login-sessions';
            var publicPath = '/login';

            //when:
            var result = AuthService.isPublic(publicPath);

            //then:
            expect(result).toEqual(true);

            //when:
            result = AuthService.isPublic(privatePath);

            //then:
            expect(result).toEqual(false);
        });
    });
});