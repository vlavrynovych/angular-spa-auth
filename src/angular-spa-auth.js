'use strict';
(function () {

    var MESSAGES = {
        UNAUTHORIZED_REDIRECT_TO_LOGIN: 'Unauthorized: redirecting to the login page',
        MISSING_CURRENT_USER_ENDPOINT: 'Endpoint for current user is not specified',
        MISSING_LOGIN_ENDPOINT: 'Login endpoint is not specified',
        SUCCESS_AUTH: 'Successfully authenticated',
        ERROR_OCCURS: 'Error occurs',
        CANNOT_OVERRIDE_CORE: 'You cannot override core service methods. Please use handlers to customize your auth process'
    };

    angular.module('angular-spa-auth', ['ngRoute'])
        .run(['$rootScope', '$location', '$timeout', 'AuthService', function ($rootScope, $location, $timeout, AuthService) {
            $rootScope.$on('$routeChangeStart', function (event, next) {
                // if not logged yet then save target route
                if ((!$rootScope.currentUser || !$rootScope.currentUser.id)) {
                    if (next.$$route && !AuthService.isPublic(next.$$route.originalPath)) {
                        AuthService.saveTargetRoute();
                        event.preventDefault();
                        $timeout(function () {
                            console.info(MESSAGES.UNAUTHORIZED_REDIRECT_TO_LOGIN);
                            AuthService.goToLogin();
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
                     * Returns url of default page as a string
                     * @param {Object} user authenticated user
                     * @returns {string} url to the default/home page
                     */
                    getDefaultPage: function(user) {
                        return config.uiRoutes.home;
                    },

                    /**
                     * Returns promise of get request which should get current user from backend
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

            function getUser() {
                return config.handlers.getUser().then(function (user) {
                    $rootScope.currentUser = user;
                    service.goToTargetRoute(user);
                    return user;
                })
            }

            function isAuthenticated() {
                if (!config.endpoints.isAuthenticated) {
                    return $q(function (resolve, reject) {
                        resolve(true)
                    });
                }

                return $http.get(config.endpoints.isAuthenticated).then(function (response) {
                    info('isAuthenticated: ' + response.data);
                    return response.data ? response.data : $q.reject(response.data);
                });
            }

            function init() {
                isAuthenticated().then(function () {
                    getUser()
                        .then(config.handlers.success, config.handlers.error)
                        .catch(goToLogin);
                })
            }

            function goToLogin() {
                goTo(config.uiRoutes.login);
            }

            // ------------------------------------------------------------------------/// Public
            var service = {
                isPublic: function (url) {
                    return config.publicUrls.some(function (publicUrl) {
                        return url.indexOf(publicUrl) > -1;
                    });
                },
                saveTargetRoute: function () {
                    config.uiRoutes.target = $location.path();
                    info('Target route is saved:  ' + config.uiRoutes.target);
                },
                goToLogin: goToLogin,
                goToTargetRoute: function (user) {
                    config.uiRoutes.target = config.uiRoutes.target || config.handlers.getDefaultPage(user);
                    goTo(config.uiRoutes.target);
                    info('Redirected to the target route: ' + config.uiRoutes.target);
                    service.clearTargetRoute()
                },
                clearTargetRoute: function () {
                    config.uiRoutes.target = null;
                },
                logout: function () {
                    $http.get(config.endpoints.logout).then(function () {
                        $rootScope.currentUser = null;
                        goToLogin();
                    });
                },
                run: function (options) {
                    if (options) {
                        config = angular.merge(config, options);

                        if (options.mixins) {
                            //TODO: check dynamically
                            if(options.mixins.login
                                || options.mixins.logout
                                || options.mixins.saveTargetRoute
                                || options.mixins.goToTargetRoute
                                || options.mixins.clearTargetRoute
                                || options.mixins.goToLogin
                                || options.mixins.isPublic) {
                                throw new Error(MESSAGES.CANNOT_OVERRIDE_CORE)
                            }

                            angular.merge(service, options.mixins);
                        }
                    }
                    init()
                },
                login: function (credentials) {
                    config.handlers.login(credentials)
                        .then(getUser)
                        .then(config.handlers.success)
                        .catch(config.handlers.error);
                }
            };

            return service
        }]);
})();