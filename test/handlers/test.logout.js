describe('Handlers: ', function () {
    var AuthService, $location, $http, $httpBackend;
    var customLogoutPath = '/custom-logout';
    var currentUserPath = '/current-user';

    beforeEach(module('angular-spa-auth'));
    beforeEach(inject(function(_AuthService_, _$location_, _$httpBackend_, _$http_){
        AuthService = _AuthService_;
        $location = _$location_;
        $http = _$http_;
        $httpBackend = _$httpBackend_;

        //setup
        $httpBackend.whenGET(AuthService.config.endpoints.logout).respond(200);
        $httpBackend.whenGET(customLogoutPath).respond(500);
        $httpBackend.whenPOST(customLogoutPath).respond(200);

        $httpBackend.whenGET(currentUserPath).respond(200, {username: 'jdoe'});
    }));

    describe('logout: ', function () {
        it('basic check', function () {
            //given: '' is default state
            expect($location.path()).toEqual('');

            //when: default logout
            AuthService.logout();
            $httpBackend.flush();

            //then: should redirect to login page
            expect($location.path()).toEqual('/login');

            //when: setup custom logout handler with a POST method
            var logoutCalled = false;
            setup(function () {
                return $http.post(customLogoutPath).then(function () {
                    logoutCalled = true;
                })
            });

            //and: call custom logout
            AuthService.logout();
            $httpBackend.flush();

            //then: check if called
            expect(logoutCalled).toEqual(true, 'custom logout not called');
        });

        it('on fail', function () {
            //when: setup custom logout handler with a GET method that should fail
            var logoutCalledOnFail = false;
            setup(function () {
                return $http.get(customLogoutPath);
            });

            //and: call custom logout
            AuthService.logout().catch(function () {
                logoutCalledOnFail = true;
            });
            $httpBackend.flush();

            //then: check if called
            expect(logoutCalledOnFail).toEqual(true, 'custom logout does not failed');
        });
        
        function setup(logoutHandler) {
            AuthService.run({
                endpoints: {
                    currentUser: currentUserPath
                },
                handlers: {
                    logout: logoutHandler
                }
            });
        }
    });
});