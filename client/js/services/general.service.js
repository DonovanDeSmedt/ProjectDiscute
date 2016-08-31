angular.module('discuteApp.services').factory('_', function($window){ 
  if(!$window._){
  		// For testing purposes
  }
  return $window._;
});