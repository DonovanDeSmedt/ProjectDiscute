'use strict';

(function () {
    'use strict';

    angular.module('discuteApp.service', ['ngCookies']).factory('AuthenticationService', ['$http', '$cookies', '$rootScope', AuthenticationFactory]);

    function AuthenticationFactory($http, $cookies, $rootScope) {
        var service = {};
        service.Login = login;
        service.Logout = logout;
        service.Register = register;
        return service;

        function login(email, password, callback) {
            $http.post('/login', { username: email, password: password }).then(function (response) {
                // login successful if there's a token in the response
                if (response.data.token) {
                    // store username and token in local storage to keep user logged in between page refreshes
                    $rootScope.currentUser = { email: email, token: response.data.token, username: response.data.username, following: response.data.following };
                    $cookies.putObject('currentUser', { email: email, token: response.data.token, username: response.data.username, test: "Zever" });
                    // add jwt token to auth header for all requests made by the $http service
                    // $http.defaults.headers.common.Authorization = response.data.token;
                    // execute callback with true to indicate successful login
                    callback(true);
                } else {
                    // execute callback with false to indicate failed login
                    callback(false);
                }
            }).catch(function (err) {
                callback(false);
            });
        }
        function register(user, callback) {
            $http.post('/register', user).then(function () {
                callback(true);
            }).catch(function (data, status, headers, config) {
                console.log("Fail");
                callback(false, data.data);
            });
        }
        function logout() {
            $cookies.remove('currentUser');
            $rootScope.currentUser = null;
            $http.defaults.headers.common.Authorization = '';
        }
    }
})();
