describe('Public methods: ', function () {
    var AuthService, $location;

    beforeEach(module('angular-spa-auth'));
    beforeEach(inject(function(_AuthService_, _$location_){
        AuthService = _AuthService_;
        $location = _$location_
    }));

    describe('openTarget(): ', function () {
        it('basic check', function () {
            //given: null is default state
            expect(AuthService.config.uiRoutes.target).toBeNull();

            //when: go to login page and save
            $location.path('/login-test');
            AuthService.saveTarget();

            //then: check if applied
            expect(AuthService.config.uiRoutes.target).toEqual('/login-test');

            //when: go to login2 page
            $location.path('/login2');

            //then: check current page
            expect($location.path()).toEqual('/login2');

            checkTarget('/login-test');
        });

        it('set target via config', function () {
            //when: setup target url via config
            AuthService.run({
                uiRoutes: {
                    target: '/predefined-page'
                }
            });

            //then: applied to config
            expect(AuthService.config.uiRoutes.target).toEqual('/predefined-page');

            //then: '' is default state
            expect($location.path()).toEqual('');

            checkTarget('/predefined-page');
        });

        function checkTarget(expectedUrl) {
            //when: open saved target
            AuthService.openTarget();

            //then: we are on the login page
            expect($location.path()).toEqual(expectedUrl);
            // -> should automatically clean saved target
            expect(AuthService.config.uiRoutes.target).toBeNull();

            //when: open saved target again
            AuthService.openTarget();
            // -> should use getHomePage() method to get destination route
            // -> by default getHomePage() returns /home

            //then: we are at home
            expect($location.path()).toEqual('/home');
        }
    });
});