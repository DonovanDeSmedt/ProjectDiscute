(function(){
	'use strict';
angular.module('discuteApp.create', []).controller('CreateController',createCtrl);
 	function createCtrl($scope,$rootScope,$cookies, $state, $http, AuthenticationService, Upload, DModule){
	let self = this;
	self.app = "iDiscute";
	self.discute= {};
	self.discute.tags = [];
	self.triggerUpload= triggerUpload;
	self.customSearch= customSearch;
	self.upload= upload;
	self.removeWhiteSpace= removeWhiteSpace;

	// Setting the current user;
	$rootScope.updateCurrentUser();
	autosize($('textarea'));
	function triggerUpload(side){
		if(side === 'left'){
			$("#upload-image-left").click();
		}
		if(side === 'right'){
			$("#upload-image-right").click();
		}
	}
	$scope.$watch('discute.description', function (newValue, oldValue) {
		if (newValue) {
			if (newValue.length > 150) {
				$scope.discute.description = oldValue;
			}
		}
	});
	$("#delete-right").click(function(){
		self.discute.picture.right = "";
	});
	$("#delete-left").click(function(){
		self.discute.picture.left = "";
	});
	function customSearch(name, side){
		$http.get('pictures/search/custom/'+name).then(function(img){
			if(angular.isUndefined(self.discute.picture)){
				self.discute.picture = {};
			}
			switch(side){
				case 'left': self.discute.picture.left = "uploads/"+img.data; break;
				case 'right': self.discute.picture.right = "uploads/"+img.data; break;
			}
		}).catch(function(err){
			console.log(err);
		});
	}
	function upload(leftPicture, rightPicture){
		leftPicture === null ? $("#discute-side-left").addClass('upload-invalid') : $("#discute-side-left").removeClass('upload-invalid');
		rightPicture === null ? $("#discute-side-right").addClass('upload-invalid') : $("#discute-side-right").removeClass('upload-invalid');
		if(rightPicture !== null && leftPicture !== null){
			var discute = self.discute;		
			var fd = new FormData();

			discute.tags = $.map(discute.tags, function(value, index){
				if(value[0] != '#'){
					value = '#'+removeWhiteSpace(value);
				}
				return value;
			})
			for(var key in discute){
				fd.append(key, discute[key]);
			}
			fd.append('author', $rootScope.currentUser.username);
			fd.append('leftPicture', Upload.dataUrltoBlob(leftPicture, 'blobleft'));
			fd.append('rightPicture', Upload.dataUrltoBlob(rightPicture, 'blobright'));
			$http.post('/api/new', fd, {
				transformRequest: angular.indentity,
				headers: { 'Content-Type': undefined }
			}).then(function(response){
				$rootScope.initScrollPos();
				$state.go('home');
			});
		}
	};
	function removeWhiteSpace(word) {
		word.trim();
		var index = word.indexOf(' ');
		if(index >= 0){
			word = word.replace(/ /g, '');
		}
		return  word;
	}
}
})();