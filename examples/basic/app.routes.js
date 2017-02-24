'use strict';
(function () {
    angular
        .module('app')
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
})();