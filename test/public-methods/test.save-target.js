describe('Public methods: ', function () {
    var AuthService, $location;

    beforeEach(module('angular-spa-auth'));
    beforeEach(inject(function(_AuthService_, _$location_){
        AuthService = _AuthService_;
        $location = _$location_
    }));

    describe('saveTarget(): ', function () {
        it('basic check', function () {
            //given: null is a default state
            expect(AuthService.config.uiRoutes.target).toBeNull();

            //when:
            $location.path('/test');
            AuthService.saveTarget();

            //then:
            expect(AuthService.config.uiRoutes.target).toEqual('/test');

            //when:
            $location.path('/login');
            AuthService.saveTarget();

            //then:
            expect(AuthService.config.uiRoutes.target).toEqual('/login');
        });
    });
});