angular.module('MobileAppVNPT.controllers', [])

.controller('AppCtrl', ['$rootScope', '$ionicModal', 'AuthFactory', '$state', 'UserFactory', '$scope', 'Loader', function ($rootScope, $ionicModal, AuthFactory, $state, UserFactory, $scope, Loader) {
    $rootScope.$on('showLoginModal', function ($event, scope, cancelCallback, callback) {
        $scope.user = {
            username: 'huu.tdm',
            password: 'dhtdm@123',
            MaTinh:1
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
                    
                    $rootScope.isAuthenticated = true;
                    $scope.modal.hide();
                    Loader.hideLoading();
                    if (typeof callback === 'function') {
                        callback();
                    }
                }).error(function (err, statusCode) {
                    var message = (err === null ? 'Kiểm tra kết nối internet!!!' : "Sai tên đăng nhập và mật khẩu!!!");
                    //console.log(err);
                    Loader.hideLoading();
                    Loader.toggleLoadingWithMessage(message);
                });
            }
            $scope.register = function () {
                //Code dang ky tai khoan
            }
        }
        );
    });

    $rootScope.loginFromMenu = function () {
        $rootScope.$broadcast('showLoginModal', $scope, null, function () {
            $state.go('app.trangchu');
            $rootScope.$broadcast('getAuth');
        });
    }

    $rootScope.logout = function () {
        UserFactory.logout();
        $rootScope.isAuthenticated = false;
        $rootScope.tennv = '';
        $state.go('app.trangchu');
        Loader.toggleLoadingWithMessage('Successfully Logged Out!', 2000);
    }
}])

.controller('TrangChuCtrl', ['$scope', 'AuthFactory', '$rootScope', '$state', '$timeout', 'UserFactory', 'Loader', '$ionicPlatform', function ($scope, AuthFactory, $rootScope, $state, $timeout, UserFactory, Loader, $ionicPlatform) {
    $ionicPlatform.ready(function() {
        $rootScope.$on('getAuth', function () {
            UserFactory.KiemTraToken().success(function (data) {
                UserFactory.getTTNhanVien().success(function (dataNhanVien) {
                    $rootScope.nhanvien = dataNhanVien[0];
                });
            }).error(function (err, statusCode) {
                UserFactory.logout();
                $rootScope.isAuthenticated = false;
                $rootScope.tennv = '';
                Loader.hideLoading();
                //Loader.toggleLoadingWithMessage(err.message);
            });
        });
        $rootScope.$broadcast('getAuth');
        $rootScope.getThongTin = function () {
            $rootScope.$broadcast('getAuth');
        };

        
    })
}])

.controller('DSBaoHongCtrl', ['$scope', 'UserFactory', 'LSFactory', 'Loader', '$ionicPlatform', '$rootScope', 'BaoHongFactory', '$state', function ($scope, UserFactory, LSFactory, Loader, $ionicPlatform, $rootScope, BaoHongFactory, $state) {
    $ionicPlatform.ready(function () {
        $scope.$on('DSBaoHong', function () {
            UserFactory.KiemTraToken().success(function (data) {
                BaoHongFactory.get().success(function (dataDSBaoHong) {
                    $scope.dsbaohong = dataDSBaoHong;
                    processBaoHong(dataDSBaoHong);
                });
            }).error(function (err, statusCode) {
                UserFactory.logout();
                $rootScope.isAuthenticated = false;
                $rootScope.tennv = '';
                Loader.hideLoading();
                //Loader.toggleLoadingWithMessage(err.message);
            });
        });
        $scope.$broadcast('DSBaoHong');
        $rootScope.getDSBaoHong = function () {
            $scope.$broadcast('DSBaoHong');
        };
        function processBaoHong(dsbaohong) {
            LSFactory.deleteAll();
            // we want to save each book individually
            // this way we can access each book info. by it's _id
            for (var i = 0; i < dsbaohong.length; i++) {
                LSFactory.set(dsbaohong[i].baohongid, dsbaohong[i]);
            };
        };
        $scope.selectBaoHong = function (baohongid) {
            $rootScope.baohongid = baohongid;
            $state.go('tab.baohong');
        }
    })
}])


.controller('BaoHongCtrl', ['$scope', '$rootScope', 'LSFactory', 'AuthFactory', 'UserFactory', 'Loader', '$ionicPlatform', '$state', 'BaoHongFactory', function ($scope, $rootScope, LSFactory, AuthFactory, UserFactory, Loader, $ionicPlatform, $state, BaoHongFactory) {
        $scope.baohong = LSFactory.get($rootScope.baohongid);
}])



.controller('DSTienTrinhCtrl', ['$scope', '$rootScope', 'LSFactory', 'AuthFactory', 'UserFactory', 'Loader', '$ionicPlatform', '$state', 'BaoHongFactory', '$ionicActionSheet', '$cordovaCapture', '$cordovaGeolocation', '$ionicModal', 'Utils', '$timeout', function ($scope, $rootScope, LSFactory, AuthFactory, UserFactory, Loader, $ionicPlatform, $state, BaoHongFactory, $ionicActionSheet, $cordovaCapture, $cordovaGeolocation, $ionicModal, Utils, $timeout) {
    $ionicPlatform.ready(function () {
        $scope.img = '';
        $scope.map = {};
        $scope.user = AuthFactory.getUser();
        $scope.tientrinh = {};
        var baohongid = $rootScope.baohongid;
        $scope.$on('DSTienTrinh', function () {
             UserFactory.KiemTraToken().success(function (data) {
                 BaoHongFactory.getTienTrinh(baohongid).success(function (dataDSTienTrinh) {
                     $scope.dstientrinh = dataDSTienTrinh;
                 });
            }).error(function (err, statusCode) {
                UserFactory.logout();
                $rootScope.isAuthenticated = false;
                $rootScope.tennv = '';
                Loader.hideLoading();
                //Loader.toggleLoadingWithMessage(err.message);
            });
        });
        $scope.$broadcast('DSTienTrinh');
        $scope.getDSTienTrinh = function () {
            $scope.$broadcast('DSTienTrinh');
        };
        $scope.setTienTrinh = function () {
            BaoHongFactory.setTienTrinh(baohongid, $rootScope.nhanvien.nhanvienid, $rootScope.nhanvien.donviid, $scope.tientrinh.noidung).success(function (data) {
                $scope.$broadcast('DSTienTrinh');
            }).error(function (err, statusCode) {
                console.log(err);
                Loader.hideLoading();
                //Loader.toggleLoadingWithMessage(err.message);
            });
        };
        $scope.showActionSheet = function () {
            var hideSheet = $ionicActionSheet.show({
                buttons: [{
                    text: 'Take Picture'
                }, {
                    text: 'Share My Location'
                }],
                cancelText: 'Cancel',
                cancel: function () {
                    // add cancel code..
                    Loader.hide();
                },
                buttonClicked: function (index) {
                    // Clicked on Take Picture
                    if (index === 0) {
                        Loader.showLoading('Processing...');
                        var options = { limit: 1 };
                        $cordovaCapture.captureImage(options).then(function (imageData) {
                            Utils.getBase64ImageFromInput(imageData[0].fullPath, function (err, base64Img) {
                                $scope.img = base64Img;
                                //attachNoiDung('<br/> Hình ảnh:  <img class="chat-img" src="' + base64Img + '">');
                                Loader.hideLoading();
                            });
                        }, function (err) {
                            console.log(err);
                            Loader.hideLoading();
                        });
                    }
                    // clicked on Share my location
                    else if (index === 1) {
                        $ionicModal.fromTemplateUrl('templates/map-modal.html', {
                            scope: $scope,
                            animation: 'slide-in-up'
                        }).then(function (modal) {
                            $scope.modal = modal;
                            $scope.modal.show();
                            $timeout(function () {
                                $scope.centerOnMe();
                            }, 2000);
                        });
                    }
                    return true;
                }
            });
        };
        $scope.mapCreated = function (map) {
            $scope.map = map;
        };
        $scope.closeModal = function () {
            $scope.modal.hide();
        };
        $scope.centerOnMe = function () {
            if (!$scope.map) { return; }
            Loader.showLoading('Getting current location...');
            var posOptions = {
                timeout: 10000,
                enableHighAccuracy: false
            };
            $cordovaGeolocation.getCurrentPosition(posOptions).then(function (pos) {
                $scope.user.pos = {
                    lat: pos.coords.latitude,
                    lon: pos.coords.longitude
                };
                $scope.map.setCenter(new google.maps.LatLng($scope.user.pos.lat, $scope.user.pos.lon));
                $scope.map.__setMarker($scope.map, $scope.user.pos.lat, $scope.user.pos.lon);
                Loader.hideLoading();
            }, function (error) {
                alert('Unable to get location, please enable GPS to continue');
                Loader.hideLoading();
                $scope.modal.hide();
            });
        };
        $scope.selectLocation = function () {
            var pos = $scope.user.pos;
            $scope.map = {
                lat: pos.lat,
                lon: pos.lon
            };       
            $scope.modal.hide();
        }
    });
}])
