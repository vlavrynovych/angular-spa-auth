'use strict';
(function () {
    angular
        .module('app')
        .controller('HomeController', ['$scope', 'AuthService', function($scope, AuthService) {
            $scope.openLogin = AuthService.openLogin;
        }]);
})();