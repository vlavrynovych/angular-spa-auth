describe('Public methods: ', function () {
    var AuthService, $location;

    beforeEach(module('angular-spa-auth'));
    beforeEach(inject(function(_AuthService_, _$location_){
        AuthService = _AuthService_;
        $location = _$location_
    }));

    describe('clearTarget(): ', function () {
        it('basic check', function () {
            //given: '' is default state
            expect(AuthService.config.uiRoutes.target).toEqual('');

            //when: go to login page and save
            $location.path('/login-test');
            AuthService.saveTarget();

            //then: check if applied
            expect(AuthService.config.uiRoutes.target).toEqual('/login-test');

            //when: clear target route and call openTarget() method
            AuthService.clearTarget();
            AuthService.openTarget();

            //then: should go to the result of the getHomePage() method
            expect($location.path()).toEqual('/home');
            // -> by default getHomePage() returns /home
        });
    });
});