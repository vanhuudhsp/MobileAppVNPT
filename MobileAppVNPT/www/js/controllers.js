angular.module('MobileAppVNPT.controllers', [])
.controller('AppCtrl', ['$rootScope', '$ionicModal', 'AuthFactory', '$state', 'UserFactory', '$scope', 'Loader', function ($rootScope, $ionicModal, AuthFactory, $state, UserFactory, $scope, Loader) {
    $rootScope.$on('showLoginModal', function ($event, scope, cancelCallback, callback) {
        $scope.user = {
            username: '',
            password: '',
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
                Loader.showLoading();
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
                    console.log(err);
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
            $rootScope.$broadcast('getThongTinNV');
        });
    }

    $rootScope.logout = function () {
        UserFactory.logout();
        $rootScope.isAuthenticated = false;
        $rootScope.nhanvien = {};
        $state.go('app.trangchu');
        Loader.toggleLoadingWithMessage('Successfully Logged Out!', 2000);
    }

    $rootScope.$on('kiemTraToken', function () {
        UserFactory.KiemTraToken().success(function () {
        }).error(function (err, statusCode) {
            UserFactory.logout();
            $rootScope.isAuthenticated = false;
            //console.log(err);
            Loader.hideLoading();
        });
    })

}])

.controller('TrangChuCtrl', ['$scope', 'AuthFactory', '$rootScope', '$state', '$timeout', 'UserFactory', 'Loader', '$ionicPlatform', function ($scope, AuthFactory, $rootScope, $state, $timeout, UserFactory, Loader, $ionicPlatform) {
    $ionicPlatform.ready(function() {
        $rootScope.$on('getThongTinNV', function () {
            Loader.showLoading();
            $rootScope.$broadcast('kiemTraToken');
            if ($rootScope.isAuthenticated)
            {
                UserFactory.getTTNhanVien().success(function (dataNhanVien) {
                    console.log(dataNhanVien);
                    $rootScope.nhanvien = dataNhanVien[0];
                    Loader.hideLoading();
                }).error(function (err, statusCode) {
                    console.log(err);
                    Loader.hideLoading();
                });
            }
        });
        $rootScope.loginFromMenu();
        $rootScope.getThongTin = function () {
            $rootScope.$broadcast('getThongTinNV');
        };  
    })
}])

.controller('DSBaoHongCtrl', ['$scope', 'UserFactory', 'LSFactory', 'Loader', '$ionicPlatform', '$rootScope', 'BaoHongFactory', '$state', function ($scope, UserFactory, LSFactory, Loader, $ionicPlatform, $rootScope, BaoHongFactory, $state) {
    $ionicPlatform.ready(function () {
        $scope.$on('getDSBaoHong', function () {
            Loader.showLoading();
            $rootScope.$broadcast('kiemTraToken');
            if ($rootScope.isAuthenticated) {
                BaoHongFactory.getDSBaoHong().success(function (dataDSBaoHong) {
                    $scope.dsbaohong = dataDSBaoHong;
                    processBaoHong(dataDSBaoHong);
                    Loader.hideLoading();
                }).error(function (err, statusCode) {
                    console.log(err);
                    Loader.hideLoading();
                });
            }
        });
        $scope.$broadcast('getDSBaoHong');
        $rootScope.getDSBaoHong = function () {
            $scope.$broadcast('getDSBaoHong');
        };
        function processBaoHong(dsbaohong) {
            LSFactory.deleteAll();
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
        $scope.dstientrinh = {};
        var baohongid = $rootScope.baohongid;
        $scope.$on('getDSTienTrinh', function () {
            Loader.showLoading();
            $rootScope.$broadcast('kiemTraToken');
            if ($rootScope.isAuthenticated) {
                BaoHongFactory.getTienTrinh(baohongid).success(function (data) {
                    $scope.dstientrinh = data;
                    Loader.hideLoading();
                }).error(function (err, statusCode) {
                    console.log(err);
                    Loader.hideLoading();
                });
            }
        });
        $scope.$broadcast('getDSTienTrinh');
        $scope.getDSTienTrinh = function () {
            $scope.$broadcast('getDSTienTrinh');
        };
        $scope.setTienTrinh = function () {
            Loader.showLoading();
            $rootScope.$broadcast('kiemTraToken');
            if ($rootScope.isAuthenticated) {
                BaoHongFactory.setTienTrinh(baohongid, $rootScope.nhanvien.nhanvienid, $rootScope.nhanvien.donviid, $scope.tientrinh.noidung).success(function (data) {
                    $scope.$broadcast('getDSTienTrinh');
                }).error(function (err, statusCode) {
                    console.log(err);
                    Loader.hideLoading();
                });
            };
        };
        
    });
}])
.controller('ChucNangCtrl', ['$scope', '$rootScope', 'LSFactory', 'AuthFactory', 'UserFactory', 'Loader', '$ionicPlatform', '$state', 'BaoHongFactory', '$ionicActionSheet', '$cordovaCapture', '$cordovaGeolocation', '$ionicModal', 'Utils', '$timeout', function ($scope, $rootScope, LSFactory, AuthFactory, UserFactory, Loader, $ionicPlatform, $state, BaoHongFactory, $ionicActionSheet, $cordovaCapture, $cordovaGeolocation, $ionicModal, Utils, $timeout) {
    $ionicPlatform.ready(function () {
        $scope.hinh = {
            title : "",
            url : "http://binhduongpt.com.vn:81",
            base64code : "",
            MaTinh : "1"
        };
        $scope.file = {
            filename: "",
            MaTinh: "1"
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
                    Loader.hide();
                },
                buttonClicked: function (index) {
                    if (index === 0) {
                        Loader.showLoading('Processing...');
                        var options = { limit: 1 };
                        $cordovaCapture.captureImage(options).then(function (imageData) {
                            Utils.getBase64ImageFromInput(imageData[0].fullPath, function (err, base64Img) {     
                                $scope.hinh.base64code = base64Img.split(',')[1];
                                Loader.showLoading();
                                $rootScope.$broadcast('kiemTraToken');
                                if ($rootScope.isAuthenticated) {
                                    BaoHongFactory.uploadHinh($scope.hinh).success(function (filename) {
                                        $scope.file.filename = filename;
                                        Loader.hideLoading();
                                    }).error(function (err, statusCode) {
                                        console.log(err);
                                        Loader.hideLoading();
                                    });
                                }
                               
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
        $scope.getHinh = function () {
            Loader.showLoading();
            $rootScope.$broadcast('kiemTraToken');
            if ($rootScope.isAuthenticated) {
                BaoHongFactory.getHinh($scope.file).success(function (base64) {
                    $scope.img = "data:image/jpeg;base64," + base64;
                    Loader.hideLoading();
                }).error(function (err, statusCode) {
                    console.log(err);
                    Loader.hideLoading();
                });
            };
        };

        $scope.mapCreated = function (map) {
            $scope.map = map;
        };
        $scope.closeModal = function () {
            $scope.modal.hide();
        };
        $scope.centerOnMe = function () {
            if (!$scope.map) { return; }
            Loader.showLoading();
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
    })
}])
.controller('ThongKeCtrl', ['$scope', 'UserFactory', 'LSFactory', 'Loader', '$ionicPlatform', '$rootScope', 'BaoHongFactory', '$state', '$cordovaDatePicker', '$filter', '$ionicHistory', function ($scope, UserFactory, LSFactory, Loader, $ionicPlatform, $rootScope, BaoHongFactory, $state, $cordovaDatePicker, $filter, $ionicHistory) {
    $ionicPlatform.ready(function () {
        $scope.dsLoaiDonVi = [
           {
               key: "1",
               value: "Xem toàn tỉnh"
           },
           {
               key: "2",
               value: "Xem toàn TTVT"
           },
           {
               key: "3",
               value: "Xem cấp tổ"
           },
           {
               key: "4",
               value: "Xem cấp đội"
           }
        ];
        $scope.myLoaiTK = {
            action: "",
            nhanVienId: $rootScope.nhanvien.nhanvienid
        }
        $rootScope.myThongKe = {
            name: "",
            p_loaithongke: "",
            //p_dichvu: "",
            p_TuNgay: "",
            p_DenNgay: "",
            p_madv: $rootScope.nhanvien.donviid +"",
            p_loaidonvi: "",
            p_username: $rootScope.nhanvien.nhanvienid +"",
            p_madv_sub:"0"
        };
        
        $scope.$on('TKBaoCao', function () {
            Loader.showLoading();
            $rootScope.$broadcast('kiemTraToken');
            if ($rootScope.isAuthenticated) {
                BaoHongFactory.getDanhSachTK("1", $rootScope.nhanvien.nhanvienid).success(function (data) {
                    $scope.dsLoaiTK = data;
                    BaoHongFactory.getDanhSachTK("2", $rootScope.nhanvien.nhanvienid).success(function (data) {
                        $rootScope.dsDichVu = data;
                        for (index in $rootScope.dsDichVu) {
                            $rootScope.dsDichVu[index].chon = false
                        }
                        Loader.hideLoading();
                    }).error(function (err, statusCode) {
                        console.log(err);
                        Loader.hideLoading();
                    });
                }).error(function (err, statusCode) {
                    console.log(err);
                    Loader.hideLoading();
                });
            }
        });
        $scope.$broadcast('TKBaoCao');
        $scope.getTKBaoCao = function () {
            $scope.$broadcast('TKBaoCao');
        };
        var options = {
            date: new Date(),
            mode: 'date',
            minDate: new Date(),
            allowOldDates: false,
            allowFutureDates: true,
            doneButtonLabel: 'DONE',
            cancelButtonLabel: 'CANCEL',
        };
        $scope.selectTuNgay = function () {
            $cordovaDatePicker.show(options).then(function (_date) {
                $rootScope.myThongKe.p_TuNgay = $filter('date')(_date, 'dd/MM/yyyy');
            });
        };
        $scope.selectDenNgay = function () {
            $cordovaDatePicker.show(options).then(function (_date) {
                $rootScope.myThongKe.p_DenNgay = $filter('date')(_date, 'dd/MM/yyyy');
            });
        };
        $scope.thongKe = function()
        {
            $rootScope.donViHienHanh = {
                id: "0",
                name: "Toàn tỉnh Bình Dương"
            };
            $state.go('app.ctthongke');
        }
       
    })
}])
.controller('CTThongKeCtrl', ['$scope', 'UserFactory', 'LSFactory', 'Loader', '$ionicPlatform', '$rootScope', 'BaoHongFactory', '$state',"$q", function ($scope, UserFactory, LSFactory, Loader, $ionicPlatform, $rootScope, BaoHongFactory, $state,$q) {
    $ionicPlatform.ready(function () {
        $scope.$on('CTThongKe', function () {
            $rootScope.dsDichVuChon = [];
            $rootScope.dsChiTietTK = [];
            var arr = [];
            Loader.showLoading();
            $rootScope.$broadcast('kiemTraToken');
            if ($rootScope.isAuthenticated) {
                $rootScope.myThongKe.p_madv_sub = $rootScope.donViHienHanh.id;
                $rootScope.myThongKe.name = $rootScope.donViHienHanh.name;
                for (index in $rootScope.dsDichVu) {
                    if ($rootScope.dsDichVu[index].chon == true) {
                        $rootScope.dsDichVuChon.push($rootScope.dsDichVu[index]);
                        arr.push(BaoHongFactory.getCTThongKe($rootScope.dsDichVu[index], $rootScope.myThongKe));
                    }
                }
                $q.all(arr).then(function (arrayOfResults) {
                    $rootScope.dsChiTietTK = arrayOfResults;
                    Loader.hideLoading();
                });
            }
        });
        $scope.$broadcast('CTThongKe');
        $scope.getTKBaoCao = function () {
            $scope.$broadcast('CTThongKe');
        };
        $scope.xuatBieuDo = function () {
            $state.go('app.bieudo');
        };
        $scope.chonThongKe = function (donVi) {
            $rootScope.donViHienHanh.id = donVi.id;
            $rootScope.donViHienHanh.name = donVi.ten;
            $scope.$broadcast('CTThongKe');
        }
        $scope.backThongKe = function () {
            $rootScope.donViHienHanh.id = "0";
            $rootScope.donViHienHanh.name = "Toàn tỉnh Bình Dương";
            $scope.$broadcast('CTThongKe');
        }
    })
}])

.controller('BieuDoCtrl', ['$scope', 'UserFactory', 'LSFactory', 'Loader', '$ionicPlatform', '$rootScope', 'BaoHongFactory', '$state', function ($scope, UserFactory, LSFactory, Loader, $ionicPlatform, $rootScope, BaoHongFactory, $state) {
    $scope.labels = [];
    $scope.data = [];
    $scope.series = [];
    var ds = [];
    for (i in $rootScope.dsDichVuChon)
    {
        $scope.series.push($rootScope.dsDichVuChon[i].name);
        for(j in $rootScope.dsChiTietTK[i].data)
        {
            if ($scope.labels.indexOf($rootScope.dsChiTietTK[i].data[j].ten) == -1)
            {
                $scope.labels.push($rootScope.dsChiTietTK[i].data[j].ten);
                ds.push(null);
            }
        }
    }
    for (i in $rootScope.dsDichVuChon) {
        var dsTemp = ds.concat();
        for (j in $scope.labels) {
            for (k in $rootScope.dsChiTietTK[i].data)
            {
                if($rootScope.dsChiTietTK[i].data[k].ten==$scope.labels[j])
                    dsTemp[j] = $rootScope.dsChiTietTK[i].data[k].tongcong;
            }
        }
        $scope.data.push(dsTemp);
    }
    $scope.onClick = function (points, evt) {
    };
    $scope.datasetOverride = [{ yAxisID: 'y-axis-1' }];
    $scope.options = {
        scales: {
            zoomEnabled: true,
            yAxes: [
              {
                  id: 'y-axis-1',
                  type: 'linear',
                  display: true,
                  position: 'left'
              }
            ]
        }
    };
}])


