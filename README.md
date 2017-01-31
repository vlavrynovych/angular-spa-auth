# angular-spa-auth
Provides ability to easily handle most of the logic related to the authentication process and page load for the AngularJS SPA

### Quick links
- [Features](#features)
- [Get Started](#get-started)
- [Documentation](#documentation)
    - [Config](#config)
    - [Run](#run)
    - [Login](#login)
    - [Logout](#logout)
- [License](#license)

## Features
- Handles for you all the work related to and route change
- Saves original/target route and redirects user to it after login/authentication check
- Very customizable and flexible
- Has ability to extend service by you own methods
- Works perfect with both: angular-route (ngRoute) and angular-route-segment

## Get Started

Install via Bower

`bower install --save angular-spa-auth`

Install via npm

//TODO

Include File
```html
<script type="text/javascript" src=".../angular-spa-auth/dist/angular-spa-auth.min.js"></script>
```


Add angular-spa-auth in your angular app to your module as a requirement.
```
angular.module('app-name', ['ngRoute', 'angular-spa-auth']);
```

## Documentation

### Config

###### Example
```js
'use strict';
(function () {
    angular
        .module('app')
        .run(['$rootScope', '$location', '$timeout', 'AuthService', '$http', 'toastr', function ($rootScope, $location, $timeout, AuthService, $http, toastr) {
            AuthService.run({
                verbose: false,
                endpoints: {
                    isAuthenticated: '/auth/is-authenticated',
                    currentUser: '/api/user/current',
                    logout: '/auth/logout',
                    login: '/auth/login'
                },
                handlers: {
                    error: function () {
                        toastr.error('Unable to authenticate.');
                    }
                },
                mixin: {
                    find: function(id) {
                        return $http.get('/auth/find?id=' + id).then(function (response) {
                            return response.data;
                        });
                    }
                }
            });
        }]);
})();
```


#### Verbose
For development perspective you can enable console.info message using `verbose` parameter

```js
AuthService.run({
    ...
    verbose: true,
    ...
})
```

#### Public Urls
#### Endpoints
#### UI Routes
#### Handlers
#### Mixin

### Run

### Login

### Logout

Simply call `AuthService#logout` method without any paramenters
```js
AuthService.logout()
```

## License

The MIT License (MIT)

Copyright (c) 2014 Tanner Linsley

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

