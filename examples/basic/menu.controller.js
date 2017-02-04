'use strict';
(function () {
    angular
        .module('app')
        .controller('MenuController', ['$scope', 'AuthService', function($scope, AuthService) {
            $scope.logout = AuthService.logout;
        }]);
})();