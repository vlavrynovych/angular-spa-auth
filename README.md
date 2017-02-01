# angular-spa-auth
Provides ability to easily handle most of the logic related to the authentication process and page load for the AngularJS SPA

## Table of Contents
- [Features](#features)
- [Get Started](#get-started)
- [Documentation](#documentation)
    - [Config](#config)
        - [Verbose](#verbose)
        - [Public Urls](#public-urls)
        - [Endpoints](#endpoints)
        - [UI Routes](#ui-routes)
        - [Handlers](#handlers)
        - [Mixin](#mixin)
    - [Run](#run)
    - [Login](#login)
    - [Logout](#logout)
- [License](#license)

## Features
- Handles for you all the work related to authentication process and route change
- Saves original/target route and redirects user to it after login/authentication check
- Very customizable and flexible
- Has ability to extend service using your own methods
- Works perfect with both: **angular-route** (**ngRoute**) and **angular-route-segment**

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
                    mixin: {
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


#### Verbose
For development perspective you can enable console.info message using `verbose` parameter

**Default value:** `false`

###### Example
```js
AuthService.run({
    ...
    verbose: true,
    ...
})
```

#### Public Urls
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

#### Endpoints
`endpoints` property is a minimal required configuration for this module.
It's backend endpoints that should be implemented.
Three of them are mandatory and only `isAuthenticated` is optional
in case if you do not use your custom [handlers](#handlers)

These endpoints are needed for basic authentication flow of SPA

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

##### isAuthenticated `[optional]`, `GET`
This endpoint should return only `true` of `false` in a response
which means that user is already authenticated or not.

##### currentUser `[required]`, `GET`
Should return user information/user representation in `JSON` format
if authenticated or `404` status code

##### logout `[required]`, `GET`
Should provide ability to invalidate user session

##### login `[required]`, `POST`
Should provide ability to authenticated user using his credentials
passed as payload

This endpoint will be used once you call [`AuthService#login`](#login) method
You can override implementation of login handler using custom [handlers](#handlers)

#### UI Routes

In some cases these ui routes will be used for user redirection

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

#### login
`login` route is a page with login form.
It is used if unauthorized user tries to go the restricted page or
after logout operation the user will be automatically redirected to this route

#### home
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
After the success login he will be redirected to the `target` route

#### Handlers


#### Mixin

### Run

### Login
To login using user credentials you need to pass them to the [`AuthService#login`](#login) method

###### Example
```js
var credentials = {
    username: 'admin',
    password: 'GOD'
}
AuthService.login(credentials)
```

Also you can override logic of [`AuthService#login`](#login) method using [handlers](#handlers)

### Logout

Simply call `AuthService#logout` method without any paramenters
```js
AuthService.logout()
```

## License

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

