'use strict';
(function () {
    angular
        .module('app')
        .controller('LoginController', ['$scope', '$location', 'AuthService', function($scope, $location, AuthService) {
            if(AuthService.isAuthenticated()) {
                AuthService.openHome();
                return;
            }

            $scope.credentials = {
                username: 'admin',
                password: 'GOD'
            };

            $scope.login = function () {
                AuthService.login($scope.credentials);
            }
        }]);
})();