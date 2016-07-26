var base = 'http://binhduongpt.com.vn:81';
angular.module('MobileAppVNPT.factory', [])

.factory('Loader', ['$ionicLoading', '$timeout', function ($ionicLoading, $timeout) {
    var LOADERAPI = {
        showLoading: function (text) {
            text = text || 'Loading...';
            $ionicLoading.show({
                template: text
            });
        },
        hideLoading: function () {
            $ionicLoading.hide();
        },
        toggleLoadingWithMessage: function (text, timeout) {
            var that = this;
            that.showLoading(text);
            $timeout(function () {
                that.hideLoading();
            }, timeout || 3000);
        }
    };
    return LOADERAPI;
}])

.factory('LSFactory', [function () {
    var LSAPI = {
        clear: function () {
            return localStorage.clear();
        },
        get: function (key) {
            return JSON.parse(localStorage.getItem(key));
        },
        set: function (key, data) {
            return localStorage.setItem(key,
            JSON.stringify(data));
        },
        delete: function (key) {
            return localStorage.removeItem(key);
        }
    };
    return LSAPI;
}])

.factory('AuthFactory', ['LSFactory', function (LSFactory) {
    var userKey = 'user';
    var tokenKey = 'token';
    var AuthAPI = {
        isLoggedIn: function () {
            return this.getUser() === null ? false : true;
        },
        getUser: function () {
            return LSFactory.get(userKey);
        },
        setUser: function (user) {
            return LSFactory.set(userKey, user);
        },
        getToken: function () {
            return LSFactory.get(tokenKey);
        },
        setToken: function (token) {
            return LSFactory.set(tokenKey, token);
        },
        deleteAuth: function () {
            LSFactory.delete(userKey);
            LSFactory.delete(tokenKey);
        }
    };
    return AuthAPI;
}])

.factory('TokenInterceptor', ['$q', 'AuthFactory', function ($q, AuthFactory) {
    return {
        request: function (config) {
            config.headers = config.headers || {};
            var token = AuthFactory.getToken();
            if (token) {
                config.headers['Authorization'] = token.token_type + ' ' + token.access_token;
                config.headers['Content-Type'] = "application/json;charset=UTF-8";
            }
            return config || $q.when(config);
        },
        response: function (response) {
            return response || $q.when(response);
        }
    };
}])

.factory('UserFactory', ['$http', 'AuthFactory', function ($http, AuthFactory) {
    var UserAPI = {
        login: function (user) {
            var data = 'grant_type=password&username='+user.username+'&password='+ user.password +'&MaTinh='+user.MaTinh;
            console.log(data);
            return $http.post(base + '/oauthtoken', data, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
        },
        register: function (user) {
        },
        logout: function () {
            AuthFactory.deleteAuth();
        },
        KiemTraToken: function () {
            return $http.get(base + 'api/Account/KiemTraToken');
        }
    };
    return UserAPI;
}
])