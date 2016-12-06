(function(){
	'use strict'; 

	angular.module('discuteApp.service')
	.factory('authInterceptor', ['$cookies', authInterceptor]);

	function authInterceptor($cookies){
		return {
			request: function(config){
				if( $cookies.getObject('currentUser')){
					config.headers.Authorization =  $cookies.getObject('currentUser').token;
				}
				return config;
			}

		}
	}
})();
