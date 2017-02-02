# angular-spa-auth

[![GitHub issues](https://img.shields.io/github/issues/vlavrynovych/angular-spa-auth.svg)](https://github.com/vlavrynovych/angular-spa-auth/issues)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/vlavrynovych/angular-spa-auth/develop/LICENSE)
[![NPM Version][npm-image]][npm-url]
[![Bower](https://img.shields.io/bower/v/angular-spa-auth.svg)]()
[![NPM Downloads][downloads-image]][downloads-url]
<!--[![Build Status][travis-image]][travis-url]-->

[npm-image]: https://img.shields.io/npm/v/angular-spa-auth.svg?style=flat
[npm-url]: https://npmjs.org/package/angular-spa-auth
[downloads-image]: https://img.shields.io/npm/dm/angular-spa-auth.svg?style=flat
[downloads-url]: https://npmjs.org/package/angular-spa-auth
<!--[travis-image]: https://travis-ci.org/UnbounDev/angular-spa-auth.svg?branch=master&style=flat-->
<!--[travis-url]: https://travis-ci.org/UnbounDev/angular-spa-auth-->

Provides ability to easily handle most of the logic related to
the authentication process and page load for the [AngularJS](https://angularjs.org/) [SPA](https://en.wikipedia.org/wiki/Single-page_application)

# Table of Contents
- [Features](#features)
- [Installation](#installation)
    - [Bower](#bower)
    - [npm](#npm)
    - [Dependencies](#dependencies)
- [Documentation](#documentation)
    - [Config](#config)
        - [Verbose](#verbose)
        - [Public Urls](#public-urls)
        - [Endpoints](#endpoints)
            - [isAuthenticated](#isauthenticated-endpoint)
            - [currentUser](#currentuser-endpoint)
            - [login](#login-endpoint)
            - [logout](#logout-endpoint)
        - [UI Routes](#ui-routes)
            - [login](#login-route)
            - [home](#home-route)
            - [target](#target-route)
        - [Handlers](#handlers)
            - ...
        - [Mixins](#mixins)
    - [AuthService](#authservice)
        - [Run](#run-method)
        - [Login](#login-method)
        - [Logout](#logout-method)
        - [Mixins Methods](#mixins-methods)
- [License](#license)

# Features
- Handles for you all the work related to authentication process and route change
- Saves original/target route and redirects user to it after login/authentication check
- Very customizable and flexible
- Has ability to extend [AuthService](#authservice) using your own methods - [mixins](#mixins)
- Works perfect with both: [**angular-route**](https://www.npmjs.com/package/angular-route)
([**ngRoute**](https://www.npmjs.com/package/angular-route)) and
[**angular-route-segment**](http://angular-route-segment.com/)

# Installation
Include File

```html
<script type="text/javascript" src=".../angular-spa-auth/dist/angular-spa-auth.min.js"></script>
```


Add angular-spa-auth in your angular app to your module as a requirement.

```js
angular.module('app-name', ['ngRoute', 'angular-spa-auth']);
```

## Bower
Install via [Bower](https://bower.io/)

`bower install --save angular-spa-auth`

## npm
Install via [npm](https://www.npmjs.com/)

`npm install --save angular-spa-auth`

## Dependencies
- [AngularJS](https://angularjs.org/) v1.5.x
- [ngRoute](https://www.npmjs.com/package/angular-route) compatible with `AngularJS`

# Documentation

## Config

###### Example
```js
'use strict';
(function () {
    angular
        .module('app')
        .run(['AuthService', '$http', 'toastr',
            function (AuthService, $http, toastr) {
                AuthService.run({
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
                    mixins: {
                        find: function (id) {
                            return $http.get('/auth/find?id=' + id).then(function (response) {
                                return response.data;
                            });
                        }
                    }
                });
            }]);
})();
```


### Verbose
For development perspective you can enable **console.info** message using `verbose` parameter

**Default value:** `false`

###### Example
```js
AuthService.run({
    ...
    verbose: true,
    ...
})
```

### Public Urls
Public urls is a list of urls that available for all unauthorized users.

**Default value:** `['/login', '/home']`

###### Example
```js
AuthService.run({
    ...
    publicUrls: ['/login', '/home', '/registration', '/confirmation', '/forgotPassword'],
    ...
})
```

Please do not add routes that should be visible only for authenticated user to this list

### Endpoints
`endpoints` property is a minimal required configuration for this module.
It's backend endpoints that should be implemented.
Three of them are mandatory and only `isAuthenticated` is optional
in case if you do not use your custom [handlers](#handlers)

These endpoints are needed for basic authentication flow of [SPA](https://en.wikipedia.org/wiki/Single-page_application)

Endpoints:

- [isAuthenticated](#isauthenticated-endpoint)
- [currentUser](#currentuser-endpoint)
- [login](#login-endpoint)
- [logout](#logout-endpoint)

**Default value:**

```js
{
    isAuthenticated: null,
    currentUser: null,
    logout: '/logout',
    login: '/login'
}
```

###### Example

```js
AuthService.run({
    ...
    endpoints: {
        isAuthenticated: '/api/is-authenticated',
        currentUser: '/api/user/current',
        logout: '/auth/logout',
        login: '/auth/login'
    },
    ...
})
```

#### isAuthenticated endpoint

| Mandatory 	| Method 	|
|:---------:|:------:|
| false     	| GET    	|

This endpoint should return only `true` or `false` in a response
which means that user is already authenticated or not.

#### currentUser endpoint

| Mandatory 	| Method 	|
|:---------:|:------:|
| true     	    | GET    	|

Should return user information/user representation in `JSON` format
if authenticated or `404` status code

#### login endpoint

| Mandatory 	| Method 	|
|:---------:|:------:|
| true     	    | POST    	|

Should provide ability on the backend side to authenticated user using
his credentials passed as request payload

This endpoint will be used once you call [`AuthService#login`](#login-method) method
You can override implementation of login handler using custom [handlers](#handlers)

#### logout endpoint

| Mandatory 	| Method 	|
|:---------:|:------:|
| true     	    | GET    	|

Should provide ability on the backend side to invalidate user session

### UI Routes

In some cases these ui routes will be used for user redirection

Routes:

- [login](#login-route)
- [home](#home-route)
- [target](#target-route)

**Default value:**

```js
{
    login: '/login',
    home: '/home'
}
```

###### Example
```js
AuthService.run({
    ...
    uiRoutes: {
        login: '/login',
        home: '/dashboard'
    },
    ...
})
```

#### login route
`login` route is a page with login form.
It is used if unauthorized user tries to go the restricted page or
after logout operation the user will be automatically redirected to this route

#### home route
After the success login user will be automatically redirected to `home` route
if `target` route was not caught

**For example:**
If user loads your website in a new tab/reloads page

- user loads root path (e.g. [www.domain.com](www.domain.com) - `target` route).
After the success login he will be redirected to the `home` route
([www.domain.com/#!/home](www.domain.com/#!/home) in case of default config)
- user loads restricted/private route (e.g. [www.domain.com/#!/reports](www.domain.com/#!/reports) - `target` route).
After the success login he will be redirected to the `target` route ([www.domain.com/#!/reports](www.domain.com/#!/reports))
- user loads public path (e.g. [www.domain.com/#!/registration](www.domain.com/#!/registration) or [www.domain.com/#!/forgotPassword](www.domain.com/#!/forgotPassword) - `target` route).
After the success login he will be redirected to the `home` route
([www.domain.com/#!/home](www.domain.com/#!/home) in case of default config)

#### target route
You do not need to specify `target` route because it will be saved once user will
try to load private page.
Please see the examples from the [previous](#home-route) section

### Handlers
//TODO

### Mixins
//TODO

## AuthService
This `angular-spa-auth` module supplies `AuthService` which can be injected
in any place of the project allowed by AngularJS

`AuthService` has a couple of public methods that can be used to complement
your authentication process

Public methods:

- [#run](#run-method)
- [#login](#login-method)
- [#logout](#logout-method)
- [Mixins Methods](#mixins-methods)

### Run method
This method is a start point of the `angular-spa-auth` module.
It should be used inside the `.run` method of your app

###### Example
**app.run.js**

```js
angular
    .module('app')
    .run(['AuthService', function (AuthService) {
        var config = {...}
        AuthService.run(config);
    }]);
```

It has only one mandatory input parameter `config`. Please see
the [configuration](#config) section for more details

### Login method
To login using user credentials you need to pass them to the [`AuthService#login`](#login-method) method

###### Example
```js
var credentials = {
    username: 'admin',
    password: 'GOD'
}

AuthService.login(credentials)
```
By default it sends `POST` request to the [login endpoint](#login-required-post)

Also you can override logic of [`AuthService#login`](#login-method) method using [handlers](#handlers)

### Logout method
Simply call `AuthService#logout` method without any parameters

```js
AuthService.logout()
```

### Mixins Methods
All the methods that were added using `mixins` property of `config` object
will be available in the `AuthService` as its own methods.

###### Example

**app.run.js**

```js
angular
    .module('app')
    .run(['AuthService', function (AuthService) {
        var config = {...}
        AuthService.run({
            mixins: {
                customMethod: function() {
                    ...
                    // your logic here
                    ...
                }
            }
        });
    }]);
```

**main.controller.js**

```js
angular
    .module('app')
    .controller('MainController', ['$scope', 'AuthService', function ($scope, AuthService) {
        AuthService.customMethod();
    }]);
```

**Note:** you cannot override native methods of the `AuthService`
(e.g. [`AuthService#login`](#login-method))

# License

The MIT License (MIT)

Copyright (c) 2017 Volodymyr Lavrynovych

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

