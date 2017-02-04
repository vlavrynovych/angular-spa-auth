'use strict';
(function () {
    angular
        .module('app')
        .run(['AuthService', function (AuthService) {
            var authenticatedOnStart = window.location.href.indexOf('authenticated') > 0;

            AuthService.run({
                verbose: true,
                endpoints: {
                    isAuthenticated: authenticatedOnStart ? './endpoints/isAuthenticatedTrue.json' : './endpoints/isAuthenticatedFalse.json',
                    currentUser: './endpoints/currentUser.json',
                    logout: './endpoints/logout.json',
                    login: './endpoints/login.json'
                }
            });
        }]);
})();