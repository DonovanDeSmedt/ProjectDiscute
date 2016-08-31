angular.module('discuteApp',['ui.router','ngResource','ngTouch','ngFileUpload','ngCookies','ngImgCrop','discuteApp.directives','discuteApp.controllers','discuteApp.services']);

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
    templateUrl:'views/home.html',
    controller:'HomeController',
    resolve: {
     logincheck: checkLoggedIn,
     background: function($rootScope){
      $(".login-background").hide();
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
  templateUrl:'views/world.html',
  controller:'HomeController',
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
  templateUrl:'views/search.html',
  controller:'HomeController',
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
  templateUrl:'views/profile.html',
  controller:'ProfileController',
  resolve: {
   logincheck: checkLoggedIn
 }
}).state('add-discute',{
  cache: false,
  url:'/add-discute',
  templateUrl:'views/new.html',
  controller:'CreateController',
  resolve: {
   logincheck: checkLoggedIn
 }
}).state('mobile-discute-view',{
  cache: false,
  url:'/discute/:id',
  templateUrl:'views/partials/discute_modal_mobile.html',
  controller:'HomeController',
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
  templateUrl:'views/profile.html',
  controller:'ProfileController',
  resolve: {
   logincheck: checkLoggedIn
 }
}).state('edit',{
  cache: false,
  url:'/account/:username',
  templateUrl:'views/edit_profile.html',
  controller:'ProfileController',
  resolve: {
   logincheck: checkLoggedIn,
   usercheck: checkUser
 }
}).state('login',{
  cache: false,
  url:'/login',
  templateUrl:'views/auth/login.html',
  controller:'LoginController'
}).state('register',{
  cache: false,
  url:'/register',
  templateUrl:'views/auth/register.html',
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
  
})
.provider('myCSRF',[function(){
  var headerName = 'X-CSRFToken';
  var cookieName = 'csrftoken';
  var allowedMethods = ['GET'];

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

var checkLoggedIn = function($q, $timeout, $cookies,$http, $location, $rootScope, $state){
  var deferred = $q.defer();
  var obj = $cookies.getObject('currentUser');
  $rootScope.prevURL = $location.path();
  if($cookies.getObject('currentUser')!= null || !angular.isUndefined($rootScope.currentUser)){
    deferred.resolve();
  }
  else{
    // $rootScope.errorMessage = 'You need to log in';
    deferred.reject();
    $state.go('login');
    window.location.href = '/#/login';
    return false;
  }

  return deferred.promise;
};
var checkUser = function($q, $stateParams, $rootScope){
  var deferred = $q.defer();
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
var splitArray = function(discutes){
    var prevIndex = 0;
    var nextIndex = 3;
    var newArray = [];
    for(var i=0; i< discutes.length/3; i++){
      newArray.push(discutes.slice(prevIndex, nextIndex));
      prevIndex = nextIndex;
      nextIndex+=3;
    }
    var rest = discutes % 3;
    if(rest){
      newArray.push(discutes.slice(discutes.length-rest, discutes.length-1));
    }
    return newArray;
  }

