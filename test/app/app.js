angular
    .module('test-app', ['ngRoute', 'angular-spa-auth'])
    .run(['AuthService', function (AuthService) {
        AuthService.run({
            publicUrls: ['/home', '/login', '/public'],
            verbose: true,
            endpoints: {
                isAuthenticated: ENDPOINTS.IS_AUTHENTICATED_ERROR,
                login: ENDPOINTS.LOGIN_SUCCESS,
                logout: ENDPOINTS.LOGOUT_SUCCESS,
                currentUser: ENDPOINTS.CURRENT_USER_SUCCESS
            }
        });
    }])
    .config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
        $locationProvider.hashPrefix('!');

        $routeProvider.when('/home', {
            templateUrl: './home/home.html',
            controller: 'HomeController'
        }).when('/public', {
            templateUrl: './public/public.html'
        }).when('/login', {
            templateUrl: './login/login.html',
            controller: 'LoginController'
        }).when('/private', {
            templateUrl: './private/private.html'
        }).otherwise({
            redirectTo: '/home'
        });
    }]);