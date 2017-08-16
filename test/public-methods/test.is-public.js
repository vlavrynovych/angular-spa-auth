describe('Public methods:', function () {
    var AuthService;

    beforeEach(module('angular-spa-auth'));
    beforeEach(inject(function(_AuthService_){
        AuthService = _AuthService_;
    }));

    describe('isPublic():', function () {
        it('basic check', function () {
            check('/login', true);
            check('/manage/login-sessions', false);
        });

        it('apply new config', function () {
            check('/home', true);
            check('/login', true);

            //when:
            AuthService.run({
                publicUrls: ['/registration', '/confirmation', '/forgotPassword']
            });

            //then:
            check('/registration', true);
            check('/home', false);
            check('/somethingElse', false);
        });

        it('default list', function () {
            check('/home', true);
            check('/login', true);
            check('/somethingElse', false);
        });

        it('custom list', function () {
            //given:
            AuthService.run({
                publicUrls: ['/registration', '/confirmation', '/forgotPassword']
            });

            check('/registration', true);
            check('/confirmation', true);
            check('/forgotPassword', true);
            check('/home', false);
            check('/login', false);
            check('/somethingElse', false);
        });

        it('custom list with RegExp', function () {
            //given:
            AuthService.run({
                publicUrls: ['/registration', /^\/manage\/.*$/ , '/forgotPassword']
            });

            check('/registration', true);
            check('/manage/users', true);
            check('/manage/', true);
            check('manage/jobs', false);
            check('/forgotPassword', true);
            check('/home', false);
            check('/login', false);
            check('/somethingElse', false);
        });

        it('Call with incorrect public urls', function () {
            //given:
            AuthService.run({
                publicUrls: [53, -8, false, undefined, null, NaN]
            });

            //when:
            check('/registration', false);
            check('/manage/users', false);
        });

        it('Mix incorrect and correct public urls', function () {
            //when:
            AuthService.run({
                publicUrls: [53, -8, false, undefined, null, NaN, '/home', /mypage/]
            });

            //then:
            check('/registration', false);
            check('/manage/users', false);
            check('/home', true);
            check('/test/mypage/', true);
        });

        it('Call without parameter', function () {
            //when:
            var result = AuthService.isPublic();

            //then:
            expect(result).toEqual(false);
        });

        it('edge cases', function () {
            //when:
            var values = [null, undefined, NaN, false, true, 0, 20, 0.4, 0, -1, '', '/test'];

            //then:
            values.forEach(function (value) {
                check(value, false);
            });
        });

        function check(value, expected) {
            //when:
            var result = AuthService.isPublic(value);

            //then:
            expect(result).toEqual(expected, 'Checking value = "' + value + '"');
        }
    });
});