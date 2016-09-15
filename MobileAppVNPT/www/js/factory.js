var base = 'http://binhduongpt.com.vn:81';
angular.module('MobileAppVNPT.factory', [])
.factory('Loader', ['$ionicLoading', '$timeout', function ($ionicLoading, $timeout) {
    var LOADERAPI = {
        showLoading: function (text) {

            $ionicLoading.show({
                template: (text||"<ion-spinner icon='android'></ion-spinner>"),
                noBackdrop: false
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
            return localStorage.setItem(key,JSON.stringify(data));
        },
        delete: function (key) {
            return localStorage.removeItem(key);
        },
        getAll: function () {
            var dsbaohong = [];
            var items = Object.keys(localStorage);
            for (var i = 0; i < items.length; i++) {
                if (items[i] !== 'user' || items[i] != 'token') {
                    dsbaohong.push(JSON.parse(localStorage[items[i]]));
                }
            }
            return dsbaohong;
        },
        deleteAll: function () {
            var items = Object.keys(localStorage);
            for (var i = 0; i < items.length; i++) {
                if (items[i] !== 'user' && items[i] != 'token') {
                    localStorage.removeItem(items[i]);
                }
            }
        }
    };
    return LSAPI;
}])
.factory('AuthFactory', ['LSFactory', function (LSFactory) {
    var userKey = 'user', tokenKey = 'token';
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
                config.headers['Authorization'] = token.token_type + '  ' + token.access_token;
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
            var data = 'grant_type=password&username='+user.username+'&password='+ user.password +'&MaTinh="'+user.MaTinh +'"';
            return $http.post(base + '/oauthtoken', data, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
        },
        register: function (user) {
        },
        logout: function () {
            AuthFactory.deleteAuth();
        },
        KiemTraToken: function () {
            return $http.post(base + '/api/Account/KiemTraToken');
        },
        getTTNhanVien: function () {
            return $http.post(base + '/api/Account/PostThongTinNhanVien', AuthFactory.getUser());
        }
    };
    return UserAPI;
}
])

.factory('BaoHongFactory', ['$http', 'AuthFactory', function ($http, AuthFactory) {
    var API = {
        getDSBaoHong: function () {
            return $http.post(base + '/api/BaoHong/PostDSBaoHongTheoNV', AuthFactory.getUser());
        },
        getTienTrinh: function (baohongid) {
            var data = { 'baohongid': parseInt(baohongid) };
            return $http.post(base + '/api/BaoHong/PostDsTienTrinh', data);
        },
        setTienTrinh: function (baohongid, nhanvienid, donviid, noidung) {
            var data = { 'baohongid': parseInt(baohongid), 'nhanvienid': nhanvienid, 'donviid': donviid, 'noidung': noidung };
            return $http.post(base + '/api/BaoHong/PostCapNhatTienTrinh', data);
        },
        uploadHinh: function (hinh) {

            return $http.post(base + '/api/BaoHong/PostUploadHinhAnhh', hinh);
        },
        getHinh: function (file) {
            return $http.post(base + '/api/BaoHong/PostLayBase64FromImage', file);
        },
        getDanhSachTK: function (action, nhanVienId) {
            return $http.post(base + '/api/BaoHong/PostDuLieuCombobox', {
                action: action,
                nhanVienId: nhanVienId 
            });
        },
        getCTThongKe: function (dichVu, myThongKe) {
            var data = angular.extend({ name: dichVu.name, p_dichvu: dichVu.id+"" }, myThongKe);
            return $http.post(base + '/api/BaoHong/PostBdgTkBaoHong', data);
        }
    };
    return API;
}])

.factory('Utils', [function () {
    return {
        getBase64ImageFromInput: function (input, callback) {
            window.resolveLocalFileSystemURL(input, function (fileEntry) {
                fileEntry.file(function (file) {
                    var reader = new FileReader();
                    reader.onloadend = function (evt) {
                        callback(null, evt.target.result);
                    };
                    reader.readAsDataURL(file);
                },
                function () {
                    callback('failed', null);
                });
            },
            function () {
                callback('failed', null);
            });
        }
    };
}])