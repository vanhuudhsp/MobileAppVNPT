// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('MobileAppVNPT', ['ionic', 'MobileAppVNPT.controllers', 'MobileAppVNPT.factory'])

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

.run(['$rootScope', 'AuthFactory', function ($rootScope, AuthFactory) {
    AuthFactory.deleteAuth();
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
    .state('app.nhanvien', {
        url: "/nhanvien",
        views: {
            'menuContent': {
                templateUrl: "templates/nhanvien.html",
                controller: 'NhanVienCtrl'
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
    $urlRouterProvider.otherwise('/app/nhanvien');
}]);
