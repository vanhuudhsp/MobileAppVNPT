// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('MobileAppVNPT', ['ionic', 'MobileAppVNPT.controllers', 'MobileAppVNPT.factory', 'MobileAppVNPT.directives', 'ngCordova', 'ngCordovaOauth', 'chart.js', 'ionic-zoom-view', 'firebase'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (cordova.platformId === 'ios' && window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.run(['$rootScope', 'LSFactory','AuthFactory', function ($rootScope, LSFactory, AuthFactory) {
    LSFactory.clear();
    $rootScope.isAuthenticated = AuthFactory.isLoggedIn();
    // utility method to convert number to an array of elements
    $rootScope.getNumber = function (num) {
        return new Array(num);
    }
}
])

.config(['$stateProvider', '$urlRouterProvider', '$httpProvider', function ($stateProvider, $urlRouterProvider, $httpProvider) {
    $httpProvider.interceptors.push('TokenInterceptor');
    $stateProvider
    .state('app', {
        url: "/app",
        abstract: true,
        templateUrl: "templates/menu.html",
        controller: 'AppCtrl'
    })
    .state('app.trangchu', {
        url: "/trangchu",
        views: {
            'menuContent': {
                templateUrl: "templates/trangchu.html",
                controller: 'TrangChuCtrl'
            }
        }
    })
    .state('app.dsbaohong', {
        url: "/dsbaohong",
        views: {
            'menuContent': {
                templateUrl: "templates/dsbaohong.html",
                controller: 'DSBaoHongCtrl'
            }
        }
    })
    .state('app.chucnang', {
        url: "/chucnang",
        views: {
            'menuContent': {
                templateUrl: "templates/chucnang.html",
                controller: 'ChucNangCtrl'
            }
        }
    })

   .state('app.thongke', {
       url: "/thongke",
         views: {
             'menuContent': {
                 templateUrl: "templates/thongke.html",
                 controller: 'ThongKeCtrl'
             }
         }
    })
    .state('app.ctthongke', {
        url: "/ctthongke",
        views: {
            'menuContent': {
                templateUrl: "templates/ctthongke.html",
                controller: 'CTThongKeCtrl'
            }
        }
    })
    .state('app.bieudo', {
        url: "/bieudo",
        views: {
            'menuContent': {
                templateUrl: "templates/bieudo.html",
                controller: 'BieuDoCtrl'
            }
        }
    })
    

    .state('tab', {
      url: '/tab',
      abstract: true,
      templateUrl: 'templates/tabs.html'
    })

    .state('tab.baohong', {
        url: "/baohong",
         views: {
             'tab-baohong': {
                 templateUrl: "templates/baohong.html",
                 controller: 'BaoHongCtrl'
             }
         }
    })

    .state('tab.dstientrinh', {
        url: "/dstientrinh",
        cache: false,
        views: {
            'tab-dstientrinh': {
                    templateUrl: "templates/dstientrinh.html",
                    controller: 'DSTienTrinhCtrl'
                }
        }
    })
    $urlRouterProvider.otherwise('/app/trangchu');
}]);