'use strict';
(function () {
    angular
        .module('app')
        .run(['AuthService', '$http', function (AuthService, $http) {
            var authenticatedOnStart = window.location.href.indexOf('authenticated') > 0;

            AuthService.run({
                publicUrls: ['/home', '/login', '/public'],
                verbose: true,
                endpoints: {
                    isAuthenticated: authenticatedOnStart ? './endpoints/isAuthenticatedTrue.json' : './endpoints/isAuthenticatedFalse.json',
                    currentUser: './endpoints/currentUser.json',
                    logout: './endpoints/logout.json',
                    login: './endpoints/login.json'
                },
                handlers: {
                    login: function(credentials) {
                        return $http.get(AuthService.config.endpoints.login, credentials);
                    }
                }
            });
        }]);
})();