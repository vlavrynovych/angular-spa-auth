'use strict';
(function () {

    var MESSAGES = {
        UNAUTHORIZED_REDIRECT_TO_LOGIN: 'Unauthorized: redirecting to the login page',
        MISSING_CURRENT_USER_ENDPOINT: 'Endpoint for current user is not specified',
        MISSING_LOGIN_ENDPOINT: 'Login endpoint is not specified',
        MISSING_LOGOUT_ENDPOINT: 'Logout endpoint is not specified',
        SUCCESS_AUTH: 'Successfully authenticated',
        ERROR_OCCURS: 'Error occurs',
        CANNOT_OVERRIDE_CORE: 'You cannot override core service methods. Please use handlers to customize your auth process: '
    };

    angular.module('angular-spa-auth', ['ngRoute'])
        .run(['$rootScope', '$location', '$timeout', 'AuthService', function ($rootScope, $location, $timeout, AuthService) {
            AuthService.saveTarget();
            $rootScope.$on('$routeChangeStart', function (event, next) {
                // if not logged yet then save target route
                if ((!AuthService.isAuthenticated())) {
                    if (next.$$route && !AuthService.isPublic(next.$$route.originalPath)) {
                        event.preventDefault();
                        $timeout(function () {
                            console.info(MESSAGES.UNAUTHORIZED_REDIRECT_TO_LOGIN);
                            AuthService.openLogin();
                        });
                    }
                } else {
                    console.info('Loading ' + $location.path());
                }
            });
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
                            info('current user: ' + JSON.stringify(response.data));
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

                        return $http.post(config.endpoints.login, credentials)
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
                    error: function (err) {
                        if(config.verbose) {
                            console.error(MESSAGES.ERROR_OCCURS, err)
                        }
                    }
                },
                mixins: {}
            };

            // ------------------------------------------------------------------------/// Private
            function info(message) {
                if(config.verbose) {
                    console.info(message)
                }
            }

            function goTo(route) {
                $location.path(route);
            }

            function isAuthenticated() {
                if (!config.endpoints.isAuthenticated) {
                    return $q(function (resolve, reject) {
                        resolve(true)
                    });
                }

                return $http.get(config.endpoints.isAuthenticated).then(function (response) {
                    var isAuth = JSON.parse(response.data);
                    info('isAuthenticated: ' + isAuth);
                    return isAuth || $q.reject(response.data);
                });
            }

            function init() {
                isAuthenticated().then(function () {
                    service.refreshCurrentUser()
                        .then(config.handlers.success, config.handlers.error)
                        .catch(openLogin);
                })
            }

            function openLogin() {
                goTo(config.uiRoutes.login);
            }

            // ------------------------------------------------------------------------/// Public
            var service = {
                config: config,

                /**
                 * Returns true if provide route url is in the list of public urls
                 * @param {String} url route path that should be checked
                 * @returns {boolean} true if url is in the list of public urls
                 */
                isPublic: function (url) {
                    return config.publicUrls.some(function (publicUrl) {
                        return url && publicUrl.startsWith(url);
                    });
                },
                /**
                 * Saves current route as a target route
                 */
                saveTarget: function () {
                    config.uiRoutes.target = $location.path();
                    info('Target route is saved: ' + config.uiRoutes.target);
                },
                /**
                 * Redirects user to the saved target route if exists or to the home page
                 */
                openTarget: function () {
                    config.uiRoutes.target = config.uiRoutes.target || config.handlers.getHomePage($rootScope.currentUser);
                    goTo(config.uiRoutes.target);
                    info('Redirected to the target route: ' + config.uiRoutes.target);
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
                    goTo(config.handlers.getHomePage($rootScope.currentUser));
                },
                /**
                 * Returns saved current user or load it from backed
                 * Always returns {Promise}
                 * @returns {Promise}
                 */
                getCurrentUser: function () {
                    return $rootScope.currentUser ? $rootScope.currentUser : service.refreshCurrentUser();
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
                        return user;
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
                 * @param {Object=} configuration.mixins allows you to extend AuthService
                 */
                run: function (configuration) {
                    if (configuration) {
                        config = angular.merge(config, configuration);

                        if (configuration.mixins) {
                            for(var prop in configuration.mixins) {
                                if(service.hasOwnProperty(prop)){
                                    throw new Error(MESSAGES.CANNOT_OVERRIDE_CORE + prop)
                                }
                            }

                            angular.merge(service, configuration.mixins);
                        }
                    }
                    init()
                },
                /**
                 * Login user using provided credentials
                 * @param {Object} credentials object with any type of information that is needed to compelete authentication process
                 */
                login: function (credentials) {
                    config.handlers.login(credentials)
                        .then(service.refreshCurrentUser)
                        .then(config.handlers.success)
                        .catch(config.handlers.error);
                }
            };

            return service
        }]);
})();