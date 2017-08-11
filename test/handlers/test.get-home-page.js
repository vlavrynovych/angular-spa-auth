describe('Handlers:', function () {
    var AuthService, $location, $rootScope;

    beforeEach(module('angular-spa-auth'));
    beforeEach(inject(function(_AuthService_, _$location_, _$rootScope_){
        AuthService = _AuthService_;
        $location = _$location_;
        $rootScope = _$rootScope_;
    }));

    describe('getHomePage():', function () {

        it('Default handler | Call using openHome() method', function () {
            //given: '/home' is default value
            expect(AuthService.config.uiRoutes.home).toEqual('/home');
            spy();

            //when: go to login page
            $location.path('/login');

            //then: login page is open
            expect($location.path()).toEqual('/login');

            //then:
            openHomeAndCheckLocation('/home');
            checkIfCalled();

            //and: check if home route doesn't changed
            expect(AuthService.config.uiRoutes.home).toEqual('/home');
        });

        it('Custom handler: simple implementation', function () {
            //given: custom route
            var customRoute = '/custom-route';

            //when: set custom getHomePage handler
            setupAndSpy(function () {
                return customRoute;
            });

            //then:
            openHomeAndCheckLocation(customRoute);
            checkIfCalled();
        });

        it('Call using openTarget() method', function () {
            //given:
            // target route is null -> getHomePage should be used
            // simulate that we are already authenticated, default isAdmin = true
            $rootScope.currentUser = angular.copy(USER);
            var route = '/profile';

            //when: set custom getHomePage handler
            setupAndSpy(function (user) {
                return route;
            });

            //and: open target
            AuthService.openTarget();

            //then:
            expect($location.path()).toEqual(route);
            checkIfCalled(USER, 1);
        });
        
        it('$rootScope.currentUser is passed to the getHomePage() method', function () {
            //given: simulate that we are already authenticated, isAdmin = true
            $rootScope.currentUser = angular.copy(USER);
            var routes = {
                dashboard: '/admin-page',
                profile: '/profile'
            };

            //when: set custom getHomePage handler
            setupAndSpy(function (user) {
                return user.isAdmin ? routes.dashboard : routes.profile;
            });

            //then:
            openHomeAndCheckLocation(routes.dashboard);
            checkIfCalled(USER, 1);

            //when: set isAdmin = false
            $rootScope.currentUser.isAdmin = false;

            //then:
            openHomeAndCheckLocation(routes.profile);
            checkIfCalled($rootScope.currentUser, 2);
        });

        function openHomeAndCheckLocation(expectedUrl) {
            //when: open saved target
            AuthService.openHome();

            //then: we are on the login page
            expect($location.path()).toEqual(expectedUrl);
        }

        function setupAndSpy(loginHandler) {
            AuthService.run({
                handlers: {
                    getHomePage: loginHandler
                }
            });

            spy();
        }

        function spy() {
            spyOn(AuthService.config.handlers, 'getHomePage').and.callThrough();
        }

        function checkIfCalled(data, count) {
            if(data) {
                expect(AuthService.config.handlers.getHomePage).toHaveBeenCalledWith(data);
            } else {
                expect(AuthService.config.handlers.getHomePage).toHaveBeenCalled();
            }
            expect(AuthService.config.handlers.getHomePage.calls.count()).toEqual(count || 1);
        }
    });
});