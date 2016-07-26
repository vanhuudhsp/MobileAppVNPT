angular.module('MobileAppVNPT.controllers', [])

.controller('AppCtrl', ['$rootScope', '$ionicModal', 'AuthFactory', '$location', 'UserFactory', '$scope', 'Loader', function ($rootScope, $ionicModal, AuthFactory, $location, UserFactory, $scope, Loader) {
    $rootScope.$on('showLoginModal', function ($event, scope, cancelCallback, callback) {
        $scope.user = {
            username: '',
            password: '',
            MaTinh:''
        };
        $scope = scope || $scope;
        $scope.viewLogin = true;
        $ionicModal.fromTemplateUrl('templates/login.html', {
            scope: $scope
        }).then(function (modal) {
            $scope.modal = modal;
            $scope.modal.show();
            $scope.switchTab = function (tab) {
                if (tab === 'login') {
                    $scope.viewLogin = true;
                } else {
                    $scope.viewLogin = false;
                }
            }
            $scope.hide = function () {
                $scope.modal.hide();
                if (typeof cancelCallback === 'function') {
                    cancelCallback();
                }
            }
            $scope.login = function () {
                Loader.showLoading('Authenticating...');
                UserFactory.login($scope.user).success(function (data) {
                    AuthFactory.setUser({
                        NhanVienId: data.NhanVienId,
                        MaTinh: data.MaTinh
                    });
                    AuthFactory.setToken({
                        access_token: data.access_token,
                        expires_in: data.expires_in,
                        token_type: data.token_type
                    });
                    //console.log(data);
                    $rootScope.isAuthenticated = true;
                    $scope.modal.hide();
                    Loader.hideLoading();
                    if (typeof callback === 'function') {
                        callback();
                    }
                }).error(function (err, statusCode) {
                    console.log(err);
                    Loader.hideLoading();
                    Loader.toggleLoadingWithMessage(err.message);
                });
            }
            $scope.register = function () {
                //Code dang ky tai khoan
            }
        });
    });

    $rootScope.loginFromMenu = function () {
        $rootScope.$broadcast('showLoginModal', $scope, null, null);
    }

    $rootScope.logout = function () {
        UserFactory.logout();
        $rootScope.isAuthenticated = false;
        $location.path('/app/nhanvien');
        Loader.toggleLoadingWithMessage('Successfully Logged Out!', 2000);
    }
}])

.controller('NhanVienCtrl', ['$scope', 'AuthFactory', '$rootScope', '$location', '$timeout', 'UserFactory', 'Loader', function ($scope, AuthFactory, $rootScope, $location, $timeout, UserFactory, Loader) {
    $scope.$on('getAuth', function () {
        $scope.user = AuthFactory.getUser();
        $scope.token = AuthFactory.getToken();
        console.log($scope.user);
        console.log($scope.token);
    });
    if (!AuthFactory.isLoggedIn()) {
        $rootScope.$broadcast('showLoginModal', $scope, function () {
            // cancel auth callback
            $timeout(function () {
                $location.path('/app/nhanvien');
            }, 200);
        }, function () {
            // user is now logged in
            $scope.$broadcast('getAuth');
        });
        return;
    }
    $scope.$broadcast('getAuth');
    $scope.convertToDate = function (dt) {
        return new Date(dt * 1000);
    };
}])

.controller('DSBaoHongCtrl', ['$scope', 'UserFactory', 'LSFactory', 'Loader', function ($scope, UserFactory, LSFactory, Loader) {

}])
