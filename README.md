# angular-spa-auth
Provides ability to easily handle most of the logic related to the authentication process and page load for the AngularJS SPA

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

//TODO

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

