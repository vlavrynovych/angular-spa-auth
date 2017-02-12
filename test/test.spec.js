'use strict';

var module = angular.mock.module;

describe('angular-spa-auth', function() {
    beforeEach(module('angular-spa-auth'));

    it('test configuration', inject(function() {
        var asd = 'asd';
        expect(asd).toEqual('asd');
    }));
});