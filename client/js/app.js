const requires = [
  'ui.router',
  'ngResource',
  'ngTouch',
  'ngFileUpload',
  'ngCookies',
  'ngImgCrop',
  'discuteApp.home',
  'discuteApp.profile',
  'discuteApp.create',
  'discuteApp.global',
  'discuteApp.service',
  'discuteApp.auth',
  'discuteApp.directive'
];

angular.module('discuteApp', requires);

angular.module('discuteApp').config(function($stateProvider,$httpProvider, $urlRouterProvider){
    $httpProvider.interceptors.push('authInterceptor');
    $httpProvider.defaults.withCredentials = true;
    $httpProvider.defaults.xsrfCookieName = 'csrftoken';
    $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
    $httpProvider.interceptors.push('myCSRF');
    $urlRouterProvider.otherwise("/home");
    $stateProvider.state('home',{
      cache: false,
      url:'/home',
      templateUrl:'js/home/home.html',
      controller:'HomeController',
      controllerAs: 'homeCtrl',
      resolve: {
        logincheck: checkLoggedIn,
          background: function($rootScope){
            // $(".login-background").hide();
            $rootScope.currentTag = null;
          },
          data: function(DModule){
            return DModule.getDiscutes().then(function(discutes){
              return discutes;
            });
          }
      }
}).state('world',{
  cache: false,
  url:'/world',
  templateUrl:'js/home/world.html',
  controller:'HomeController',
  controllerAs: 'homeCtrl',
  resolve: {
   logincheck: checkLoggedIn,
   background: function($rootScope){
    $rootScope.currentTag = null;
  },
  data: function(DModule){
    return DModule.getGeneralDiscutes().then(function(discutes){
      return splitArray(discutes);
    });
  } 
}
}).state('search',{
  cache: false,
  url:'/search/:name',
  templateUrl:'js/home/search.html',
  controller:'HomeController',
  controllerAs: 'homeCtrl',
  resolve: {
   logincheck: checkLoggedIn,
   data: function(DModule, $stateParams){
    return DModule.searchTag($stateParams.name, null).then(function(discutes){
      return splitArray(discutes);
    });
  } 
}
}).state('profile',{
  cache: false,
  url:'/profile',
  templateUrl:'js/profile/profile.html',
  controller:'ProfileController',
  controllerAs: 'profileCtrl',
  resolve: {
   logincheck: checkLoggedIn
 }
}).state('add-discute',{
  cache: false,
  url:'/add-discute',
  templateUrl:'js/create/create.html',
  controller:'CreateController',
  controllerAs: 'createCtrl',
  resolve: {
   logincheck: checkLoggedIn
 }
}).state('mobile-discute-view',{
  cache: false,
  url:'/discute/:id',
  templateUrl:'js/partials/discute_modal_mobile.html',
  controller:'HomeController',
  controllerAs: 'homeCtrl',
  resolve: {
   logincheck: checkLoggedIn,
   data: function(DModule,$stateParams){
    return DModule.getDiscuteById($stateParams.id).then(function(discute){
      return discute;
    });
  }
}
}).state('user',{
  cache: false,
  url:'/profile/:username',
  templateUrl:'js/profile/profile.html',
  controller:'ProfileController',
    controllerAs: 'profileCtrl',
  resolve: {
   logincheck: checkLoggedIn
 }
}).state('edit',{
  cache: false,
  url:'/account/:username',
  templateUrl:'js/profile/edit_profile.html',
  controller:'ProfileController',
  controllerAs: 'profileCtrl',
  resolve: {
   logincheck: checkLoggedIn,
   usercheck: checkUser
 }
}).state('login',{
  cache: false,
  url:'/login',
  templateUrl:'js/auth/login.html',
  controller:'LoginController'
}).state('register',{
  cache: false,
  url:'/register',
  templateUrl:'js/auth/register.html',
  controller:'RegisterController'
}).state('404',{
  cache: false,
  url:'/404',
  templateUrl:'views/404.html',
  controller:'GlobalController'
});
}).constant('_', window._).run(function($state, $http, $cookies){
  $state.go('home');
  // $http.defaults.headers.post['X-CSRFToken'] = $cookies.csrftoken;
}).provider('myCSRF',[function(){
  let headerName = 'X-CSRFToken';
  let cookieName = 'csrftoken';
  let allowedMethods = ['GET'];

  this.setHeaderName = function(n) {
    headerName = n;
  }
  this.setCookieName = function(n) {
    cookieName = n;
  }
  this.setAllowedMethods = function(n) {
    allowedMethods = n;
  }
  this.$get = ['$cookies', function($cookies){
    return {
      'request': function(config) {
        if(allowedMethods.indexOf(config.method) === -1) {
          // do something on success
          config.headers[headerName] = $cookies.get(cookieName);
        }
        return config;
      }
    }
  }];
}]);

const checkLoggedIn = function($q, $timeout, $cookies,$http, $location, $rootScope, $state, AuthenticationService){
  const deferred = $q.defer();
  const obj = $cookies.getObject('currentUser');
  $rootScope.prevURL = $location.path();
  if($cookies.getObject('currentUser')!= null){
    deferred.resolve();
  }
  else{
    // $rootScope.errorMessage = 'You need to log in';
    AuthenticationService.Logout();
    deferred.reject();
    $state.go('login');
    window.location.href = '/#/login';
    return false;
  }

  return deferred.promise;
};
const checkUser = function($q, $stateParams, $rootScope){
  const deferred = $q.defer();
  console.log($stateParams.username);
  if(!angular.isUndefined($rootScope.currentUser) && $stateParams.username !== $rootScope.currentUser.username){
    deferred.reject();
    $state.go('profile');
  }
  else{
    deferred.resolve();
  }
  return deferred.promise;
}
const splitArray = function(discutes){
  let prevIndex = 0;
  let nextIndex = 3;
  let newArray = [];
  for(var i=0; i< discutes.length/3; i++){
    newArray.push(discutes.slice(prevIndex, nextIndex));
    prevIndex = nextIndex;
    nextIndex+=3;
  }
  let rest = discutes % 3;
  if(rest){
    newArray.push(discutes.slice(discutes.length-rest, discutes.length-1));
  }
  return newArray;
}

