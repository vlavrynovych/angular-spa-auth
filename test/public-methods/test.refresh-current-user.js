describe('Public methods:', function () {
    var AuthService, $rootScope, $httpBackend, $location;

    beforeEach(module('angular-spa-auth'));
    beforeEach(inject(function(_AuthService_, _$rootScope_, _$httpBackend_, _$location_){
        AuthService = _AuthService_;
        $rootScope = _$rootScope_;
        $httpBackend = _$httpBackend_;
        $location = _$location_;

        //setup
        AuthService.config.endpoints.currentUser = ENDPOINTS.CURRENT_USER_SUCCESS;

        //setup backend
        $httpBackend.whenGET(ENDPOINTS.CURRENT_USER_SUCCESS).respond(200, USER);
        $httpBackend.whenGET(ENDPOINTS.CURRENT_USER_ERROR).respond(500);
    }));

    describe('refreshCurrentUser():', function () {
        it('Returns user if Ok and redirects to the home page', function () {
            //given: getUser handler should successfully returns user
            expect($location.path()).toEqual('');

            //when:
            var receivedUser = null;
            AuthService.refreshCurrentUser().then(function (user) {
                receivedUser = user;
            });

            //then:
            expect(receivedUser).toBeNull();

            //when: resolve request
            $httpBackend.flush();

            //then:
            expect($location.path()).toEqual(AuthService.config.uiRoutes.home);
            expect(receivedUser).toEqual(USER);
        });
        
        it('Do nothing if failed', function () {
            //given: getUser handler should fail
            AuthService.config.endpoints.currentUser = ENDPOINTS.CURRENT_USER_ERROR;
            expect($location.path()).toEqual('');

            //when:
            var receivedUser = null;
            AuthService.refreshCurrentUser().then(function (user) {
                receivedUser = user;
            });

            //then:
            expect(receivedUser).toBeNull();

            //when: resolve request
            $httpBackend.flush();

            //then:
            expect($location.path()).toEqual('');
            expect(receivedUser).toBeNull();

        });

        it('Call using getCurrentUser() method', function () {
            //setup
            AuthService.config.endpoints.currentUser = ENDPOINTS.CURRENT_USER_SUCCESS;

            //setup backend
            $httpBackend.whenGET(ENDPOINTS.CURRENT_USER_SUCCESS).respond(200, USER);

            //given: unauthorized
            $rootScope.currentUser = null;

            //and: start spying
            spy();

            //when:
            AuthService.getCurrentUser();

            //then:
            checkIfCalled(1);

        });
        it('Call using login() method', function () {
            //setup
            AuthService.config.endpoints.login = ENDPOINTS.LOGIN_SUCCESS;

            //setup backend
            $httpBackend.whenPOST(ENDPOINTS.LOGIN_SUCCESS).respond(200);

            //given: start spying
            spy();

            //when:
            AuthService.login(credentials);
            $httpBackend.flush();

            //then:
            checkIfCalled(1)
        });

        it('Call using run() method', function () {
            //setup
            AuthService.config.endpoints.login = ENDPOINTS.IS_AUTHENTICATED_SUCCESS;

            //setup backend
            $httpBackend.whenPOST(ENDPOINTS.IS_AUTHENTICATED_SUCCESS).respond(200);

            //given: start spying
            spy();

            //when:
            AuthService.run({});
            $httpBackend.flush();

            //then:
            checkIfCalled(1)
        });

        function spy() {
            spyOn(AuthService, 'refreshCurrentUser').and.callThrough();
        }

        function checkIfCalled(count) {
            expect(AuthService.refreshCurrentUser).toHaveBeenCalled();
            expect(AuthService.refreshCurrentUser.calls.count()).toEqual(count);
        }
    });
});