'use strict';
(function () {

    var MESSAGES = {
        UNAUTHORIZED_REDIRECT_TO_LOGIN: 'Unauthorized: redirecting to the login page',
        MISSING_CURRENT_USER_ENDPOINT: 'Endpoint for current user is not specified',
        MISSING_LOGIN_ENDPOINT: 'Login endpoint is not specified',
        MISSING_LOGOUT_ENDPOINT: 'Logout endpoint is not specified',
        SUCCESS_AUTH: 'Successfully authenticated'
    };

    angular.module('angular-spa-auth', ['ngRoute'])
        .run(['$rootScope', '$location', 'AuthService', function ($rootScope, $location, AuthService) {
            AuthService.saveTarget();
            $rootScope.$on('$routeChangeStart', function (event, next) {
                AuthService._info('Start loading: ' + $location.path());

                if(isKnownStatus()) {
                    if (AuthService.isAuthenticated()) {
                        if($location.path() == AuthService.config.uiRoutes.login) {
                            stop();
                            AuthService.openHome();
                        }
                    } else if (isPrivate()) {
                        stop();
                        AuthService._info(MESSAGES.UNAUTHORIZED_REDIRECT_TO_LOGIN);
                        AuthService.openLogin();
                    }
                } else if (isPrivate()) {
                    AuthService._info('Unknown user status');
                    stop();
                }

                function isPrivate() {
                    return next.$$route && !AuthService.isPublic(next.$$route.originalPath)
                }

                function stop() {
                    AuthService._info('Stop loading: ' + $location.path());
                    event.preventDefault();
                }
            });

            $rootScope.$on('$routeChangeSuccess', function (event, next) {
                AuthService._info('Loaded: ' + $location.path());
            });

            function isKnownStatus() {
                return $rootScope.currentUser !== undefined;
            }
        }])
        .service('AuthService', ['$rootScope', '$q', '$http', '$location', function ($rootScope, $q, $http, $location) {

            // ------------------------------------------------------------------------/// Config
            var config = {
                verbose: false,
                publicUrls: ['/login', '/home'],
                endpoints: {
                    isAuthenticated: null,
                    currentUser: null,
                    logout: '/logout',
                    login: '/login'
                },
                uiRoutes: {
                    login: '/login',
                    home: '/home',
                    target: null
                },
                handlers: {
                    /**
                     * Returns url of home page as a string
                     * @param {Object} user authenticated user
                     * @returns {string} url to the default/home page
                     */
                    getHomePage: function(user) {
                        return config.uiRoutes.home;
                    },

                    /**
                     * Returns promise of GET request which should get current user from backend
                     * @returns {Promise}
                     */
                    getUser: function () {
                        if(!config.endpoints.currentUser) {
                            throw new Error(MESSAGES.MISSING_CURRENT_USER_ENDPOINT)
                        }

                        return $http.get(config.endpoints.currentUser).then(function (response) {
                            info('Current user: ' + JSON.stringify(response.data));
                            return response.data
                        })
                    },

                    /**
                     * Tries to login user using provided credentials.
                     * Sends GET request
                     *
                     * @param {Object} credentials object with user credentials
                     * @param {String} [credentials.login]
                     * @param {String} [credentials.password]
                     * @returns {Promise}
                     */
                    login: function (credentials) {
                        if(!config.endpoints.login) {
                            throw new Error(MESSAGES.MISSING_LOGIN_ENDPOINT)
                        }

                        return $http.post(config.endpoints.login, credentials);
                    },

                    logout: function () {
                        if(!config.endpoints.logout) {
                            throw new Error(MESSAGES.MISSING_LOGOUT_ENDPOINT)
                        }

                        return $http.get(config.endpoints.logout).then(function () {
                            $rootScope.currentUser = null;
                            openLogin();
                        });
                    },

                    /**
                     * Success handler
                     * @param {*} data received from backend
                     */
                    success: function (data) {
                        info(MESSAGES.SUCCESS_AUTH)
                    },

                    /**
                     * Error handler
                     * @param {*} err backend error object
                     */
                    error: error
                }
            };

            // ------------------------------------------------------------------------/// Private
            function info(message) {
                _log(console.info, message)
            }

            function error(err) {
                _log(console.error, err);
            }
            
            function _log(fn, msg) {
                if(config.verbose) {
                    fn && fn(msg)
                }
            }

            function goTo(route) {
                if(route == config.uiRoutes.login && service.isAuthenticated()) {
                    $location.path(getHome());
                } else {
                    $location.path(route);
                    info('Redirected to the ' + route);
                }
            }

            function isAuthenticated() {
                if (!config.endpoints.isAuthenticated) {
                    return $q.resolve(true);
                }

                return $http.get(config.endpoints.isAuthenticated).then(function (response) {
                    var isAuth = JSON.parse(response.data);
                    info('isAuthenticated: ' + isAuth);
                    $rootScope.currentUser = response.data;
                    return isAuth || $q.reject(response.data);
                });
            }

            function init() {
                isAuthenticated()
                    .then(service.refreshCurrentUser)
                    .then(function (user) {
                        config.handlers.success(user);
                    })
                    .catch(function (err) {
                        openLogin();
                        return onError(err);
                    });
            }

            function openLogin() {
                goTo(config.uiRoutes.login);
            }

            function onError(err) {
                error(err);
                config.handlers.error(err);
                return $q.reject(err);
            }

            function getHome() {
                return config.handlers.getHomePage($rootScope.currentUser);
            }

            // ------------------------------------------------------------------------/// Public
            var service = {
                config: config,
                _info: info,

                /**
                 * Returns true if provide route url is in the list of public urls
                 * @param {String} path route path that should be checked
                 * @returns {boolean} true if url is in the list of public urls
                 */
                isPublic: function (path) {
                    if(!path) {
                        return false;
                    }

                    return config.publicUrls.some(function (pattern) {
                        if(pattern instanceof RegExp) {
                            return path.match(pattern);
                        } else if(typeof pattern == "string") {
                            return path && pattern.startsWith(path);
                        } else {
                            return false;
                        }
                    });
                },
                /**
                 * Saves current route as a target route
                 */
                saveTarget: function () {
                    config.uiRoutes.target = $location.path() || null;
                    info('Target route is saved: ' + config.uiRoutes.target);
                },
                /**
                 * Redirects user to the saved target route if exists or to the home page
                 */
                openTarget: function () {
                    var target = config.uiRoutes.target || getHome();
                    goTo(target);
                    service.clearTarget()
                },
                /**
                 * Clears saved target route
                 */
                clearTarget: function () {
                    config.uiRoutes.target = null;
                },
                /**
                 * Redirects user to the login page
                 */
                openLogin: openLogin,
                /**
                 * Redirects user to the home page
                 */
                openHome: function () {
                    goTo(getHome());
                },
                /**
                 * Returns saved current user or load it from backed
                 * Always returns {Promise}
                 * @returns {Promise}
                 */
                getCurrentUser: function () {
                    return $rootScope.currentUser ? $q.resolve($rootScope.currentUser) : service.refreshCurrentUser();
                },
                /**
                 * Loads user from backed using currentUser endpoint or getUser handler
                 * Always returns {Promise}
                 * @returns {Promise}
                 */
                refreshCurrentUser: function() {
                    return config.handlers.getUser().then(function (user) {
                        $rootScope.currentUser = user;
                        service.openTarget();
                        return $rootScope.currentUser;
                    })
                },
                /**
                 * Returns true if user is authenticated
                 * Warning! It does not check backend.
                 * @returns {boolean} true if user is authenticated
                 */
                isAuthenticated: function () {
                    return !!$rootScope.currentUser;
                },
                /**
                 * Logs user out from the system and redirects it to the login page
                 */
                logout: function () {
                    return config.handlers.logout();
                },
                /**
                 * Allows you to configure angular-spa-auth module and start the init process.
                 * Should be called in the #run method of you module
                 * @param {Object} configuration contains all the configs
                 * @param {String=} configuration.verbose activates console.info output if true
                 * @param {String[]=} configuration.publicUrls list url that are available for unauthorized users
                 * @param {Object=} configuration.endpoints gives you ability to setup all the backed endpoints that will own roles in the authentication process
                 * @param {Object=} configuration.uiRoutes helps you automatically redirect user to the specified UI routes such as home and login
                 * @param {String=} configuration.uiRoutes.home home route
                 * @param {String=} configuration.uiRoutes.login login route
                 * @param {Object=} configuration.handlers allows you to provide you implementation for key methods of authentication process
                 */
                run: function (configuration) {
                    if (configuration) {
                        if(configuration.publicUrls) {
                            //publicUrls should be completely replaced by new value if provided
                            //to provide ability to set new array with only one route
                            config.publicUrls = configuration.publicUrls;
                        }

                        config = angular.merge(config, configuration);
                    }
                    init()
                },
                /**
                 * Login user using provided credentials
                 * @param {Object} credentials object with any type of information that is needed to compelete authentication process
                 */
                login: function (credentials) {
                    return config.handlers.login(credentials)
                        .then(service.refreshCurrentUser)
                        .then(config.handlers.success)
                        .catch(onError);
                }
            };

            return service
        }]);
})();
/*! http://mths.be/startswith v0.2.0 by @mathias */
if (!String.prototype.startsWith) {
	(function() {
		'use strict'; // needed to support `apply`/`call` with `undefined`/`null`
		var defineProperty = (function() {
			// IE 8 only supports `Object.defineProperty` on DOM elements
			try {
				var object = {};
				var $defineProperty = Object.defineProperty;
				var result = $defineProperty(object, object, object) && $defineProperty;
			} catch(error) {}
			return result;
		}());
		var toString = {}.toString;
		var startsWith = function(search) {
			if (this == null) {
				throw TypeError();
			}
			var string = String(this);
			if (search && toString.call(search) == '[object RegExp]') {
				throw TypeError();
			}
			var stringLength = string.length;
			var searchString = String(search);
			var searchLength = searchString.length;
			var position = arguments.length > 1 ? arguments[1] : undefined;
			// `ToInteger`
			var pos = position ? Number(position) : 0;
			if (pos != pos) { // better `isNaN`
				pos = 0;
			}
			var start = Math.min(Math.max(pos, 0), stringLength);
			// Avoid the `indexOf` call if no match is possible
			if (searchLength + start > stringLength) {
				return false;
			}
			var index = -1;
			while (++index < searchLength) {
				if (string.charCodeAt(start + index) != searchString.charCodeAt(index)) {
					return false;
				}
			}
			return true;
		};
		if (defineProperty) {
			defineProperty(String.prototype, 'startsWith', {
				'value': startsWith,
				'configurable': true,
				'writable': true
			});
		} else {
			String.prototype.startsWith = startsWith;
		}
	}());
}
