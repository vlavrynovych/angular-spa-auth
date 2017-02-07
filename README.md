# angular-spa-auth

[![GitHub issues](https://img.shields.io/github/issues/vlavrynovych/angular-spa-auth.svg)](https://github.com/vlavrynovych/angular-spa-auth/issues)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/vlavrynovych/angular-spa-auth/develop/LICENSE)
[![NPM Version][npm-image]][npm-url]
[![Bower](https://img.shields.io/bower/v/angular-spa-auth.svg)]()
[![NPM Downloads][downloads-image]][downloads-url]
<!--[![Build Status][travis-image]][travis-url]-->

[![NPM](https://nodei.co/npm/angular-spa-auth.png?downloads=true)](https://nodei.co/npm/angular-spa-auth/)

[npm-image]: https://img.shields.io/npm/v/angular-spa-auth.svg?style=flat
[npm-url]: https://npmjs.org/package/angular-spa-auth
[downloads-image]: https://img.shields.io/npm/dm/angular-spa-auth.svg?style=flat
[downloads-url]: https://npmjs.org/package/angular-spa-auth
<!--[travis-image]: https://travis-ci.org/UnbounDev/angular-spa-auth.svg?branch=master&style=flat-->
<!--[travis-url]: https://travis-ci.org/UnbounDev/angular-spa-auth-->

Frontend module that provides ability to easily handle most of the logic related to
the authentication process and route change for the [AngularJS](https://angularjs.org/)
[SPA](https://en.wikipedia.org/wiki/Single-page_application)

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
            - [#getHomePage(user)](#gethomepage-handler)
            - [#getUser()](#getuser-handler)
            - [#login(credentials)](#login-handler)
            - [#success(data)](#success-handler)
            - [#error(err)](#error-handler)
        - [Mixins](#mixins)
    - [AuthService](#authservice)
        - [#run(config)](#run-method)
        - [#login(credentials)](#login-method)
        - [#logout()](#logout-method)
        - [#getCurrentUser()](#getcurrentuser-method)
        - [#refreshCurrentUser()](#refreshcurrentuser-method)
        - [#isAuthenticated()](#isauthenticated-method)
        - [#isPublic(url)](#ispublic-method)
        - [#saveTarget()](#savetarget-method)
        - [#clearTarget()](#cleartarget-method)
        - [#openTarget()](#opentarget-method)
        - [#openLogin()](#openlogin-method)
        - [#openHome()](#openhome-method)
        - [Mixins Methods](#mixins-methods)
- [License](#license)

# Features
- Handles for you all the work related to authentication process and route change
- Saves original/target route and redirects user to it after login/authentication check
- Very customizable and flexible
- Has ability to extend [AuthService](#authservice) using your own methods - [mixins](#mixins)
- Works perfect with both: [**angular-route**](https://www.npmjs.com/package/angular-route)
([**ngRoute**](https://www.npmjs.com/package/angular-route)) and
[**angular-route-segment**](http://angular-route-segment.com/).
Also should work will all the modules that are based on **ngRoute**
- Authneticated user model is always available in `$rootScope.currentUser`
which means that you can use it in your views as `<div ng-show='currentUser.admin'>{{currentUser.firstName}}</div>`
And you can always get it using service method - [`AuthService.getCurrentUser()`](#getcurrentuser-method) - in any place of your project

# Installation
Include File

```html
<script type="text/javascript" src=".../angular-spa-auth/dist/angular-spa-auth.min.js"></script>
```


Add angular-spa-auth in your angular app to your module as a requirement.

```js
angular.module('app', ['ngRoute', 'angular-spa-auth']);
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

| Mandatory | Method |
|:---------:|:------:|
| false     | GET    |

This endpoint should return only `true` or `false` in a response
which means that user is already authenticated or not.

#### currentUser endpoint

| Mandatory | Method |
|:---------:|:------:|
| true     	| GET    |

Should return user information/user representation in `JSON` format
if authenticated or `404` status code

#### login endpoint

| Mandatory | Method |
|:---------:|:------:|
| true     	| POST   |

Should provide ability on the backend side to authenticated user using
his credentials passed as request payload

This endpoint will be used once you call [`AuthService#login`](#login-method) method
You can override implementation of login handler using custom [handlers](#handlers)

#### logout endpoint

| Mandatory | Method |
|:---------:|:------:|
| true     	| GET    |

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

We are providing handlers as additional possibility to customize authentication process.
Instead of using [endpoints](#endpoints) configuration you can use your own implementation

- [#getHomePage(user)](#gethomepage-handler)
- [#getUser()](#getuser-handler)
- [#login(credentials)](#login-handler)
- [#success(data)](#success-handler)
- [#error(err)](#error-handler)

#### getHomePage handler

Overriding this handler you should provide logic for getting home page route.
It can be based on the user model or on your own logic related to your project.

**Input**

| Name | Type | Description |
|:----:|:----:|:-----------:|
| user | `Object` | Object representation of `JSON` received from backend. Can be null |

**Output**

| Type | Description |
|:----:|:----:|
| `String` | Home page route |

In example you can find easiest use case.

###### Example
```js
AuthService.run({
    ...
    handlers: {
        getHomePage: function(user) {
            return user.admin ? '/dashboard' : '/profile'
        }
    },
    ...
})
```


#### getUser handler

You should provide implementation of how to get authenticated user from backed or other source.

**Output**

| Type | Description |
|:----:|:----:|
| `Promise` | Promise with user |

###### Example
```js
AuthService.run({
    ...
    handlers: {
        getUser: function(user) {
            return $http.get('/api/user/current').then(function (response) {
                var user = response.data;

                // extending user object by two new methods
                user.isAdmin = function() {
                    return this.admin;
                }

                user.getFullName = function() {
                    return this.firstName + ' ' + this.lastName;
                }

                return user;
            })
        }
    },
    ...
})
```

###### Example
```js
AuthService.run({
    ...
    handlers: {
        getUser: function(user) {
            return $q(function (resolve, reject) {

                // you can use native window.localStorage or ngStorage module
                // but the main idea is that you have to implement logic
                // to get user object using any storage type and
                // always return Promise
                var user = JSON.parse(window.localStorage.get("previouslySavedUser"))

                resolve(user)
            });
        }
    },
    ...
})
```

#### login handler

Overriding this handler you should implement your authentication logic

**Input**

| Name | Type | Description |
|:----:|:----:|:-----------:|
| credentials | `Object` | Object with username and password or token or any information that will help user to login to the system |

**Output**

| Type | Description |
|:----:|:----:|
| `Promise` | Promise where success callback means that login operation was successfully completed |

###### Example
```js
AuthService.run({
    ...
    handlers: {
        login: function(credentials) {
            return $http.post('/api/login', credentials);
        }
    },
    ...
})
```

###### Example
```js
AuthService.run({
    ...
    handlers: {
        login: function(credentials) {
            return $auth.authenticate('strava')
        }
    },
    ...
})
```

**Note:** `$auth` service is provided by [`satellizer`](https://github.com/sahat/satellizer) module

#### success handler

You can provide your reaction on login success using this handler

###### Example
```js
AuthService.run({
    ...
    handlers: {
        success: function(data) {
            toastr.success('Successfully authenticated', {timeOut: 1500});
        }
    },
    ...
})
```

#### error handler

Override this handler to provide your reaction on login error using this handler

###### Example
```js
AuthService.run({
    ...
    handlers: {
        error: function(data) {
            toastr.error('Unable to authenticate.');
        }
    },
    ...
})
```

### Mixins
//TODO

## AuthService
This `angular-spa-auth` module supplies `AuthService` which can be injected
in any place of the project allowed by AngularJS

`AuthService` has a couple of public methods that can be used to complement
your authentication process

Public methods:

- [#run(config)](#run-method)
- [#login(credentials)](#login-method)
- [#logout()](#logout-method)
- [#getCurrentUser()](#getcurrentuser-method)
- [#refreshCurrentUser()](#refreshcurrentuser-method)
- [#isAuthenticated()](#isauthenticated-method)
- [#isPublic(url)](#ispublic-method)
- [#saveTarget()](#savetarget-method)
- [#clearTarget()](#cleartarget-method)
- [#openTarget()](#opentarget-method)
- [#openLogin()](#openlogin-method)
- [#openHome()](#openhome-method)
- [Mixins Methods](#mixins-methods)


### run method
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

### login method
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

### logout method
Simply call `AuthService#logout` method without any parameters

###### Example
```js
AuthService.logout()
```

### getCurrentUser method

If user already authenticated then it returns user model from $rootScope.currentUser.
If not then tries to load user model from backend and returns promise

###### Example
```js
var user = AuthService.getCurrentUser()
```

### refreshCurrentUser method

Load fresh version of current user model from backend.
Returns promise.

###### Example
```js
var promise = AuthService.refreshCurrentUser().then(function(user) {
    // your logic here
})
```

### isAuthenticated method

Returns `true` if user already authenticated and `false` if not

###### Example
```js
if(AuthService.isAuthenticated()) {
    // do something
}
```

### isPublic method

Checks if provided url is in a [list of public urls](#public-urls)

###### Example
```js
if(AuthService.isPublic('/private')) {
    // do something
} else {
    // redirect somewhere
}
```

### saveTarget method

Saves current route as a target route. Will be used in case of successful login.
Can be cleaned using [`#clearTarget()`](#cleartarget-method)

###### Example
```js
AuthService.saveTarget()
```

### clearTarget method

Clears target route

###### Example
```js
AuthService.clearTarget()
```

### openTarget method

Redirects user to the saved target route

###### Example
```js
AuthService.openTarget()
```

### openLogin method

Redirects user to the login page

###### Example
```js
AuthService.openLogin()
```

### openHome method

Redirects user to the home page

###### Example
```js
AuthService.openHome()
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

