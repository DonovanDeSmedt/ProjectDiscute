(function(){
	'use strict';
	angular.module('discuteApp.service')
	.factory('DiscuteService', ['$http', discuteService]);
	function discuteService($http){
		let service = {};
		service.uploadDiscute = uploadDiscute;
		service.customSearch = customSearch

		return service;

		function uploadDiscute(fd){
			return $http.post('/discute/new', fd, {
					transformRequest: angular.indentity,
					headers: { 'Content-Type': undefined }
				});
		}
		function customSearch(name){
			return $http.get('pictures/search/custom/'+name);
		}
	};
})();