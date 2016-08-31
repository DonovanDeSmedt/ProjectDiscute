angular.module('discuteApp').controller('CreateController', function($scope,$rootScope,$cookies, $state, $http, AuthenticationService, Upload, DModule){
	$scope.app = "iDiscute";
	$scope.discute= {};
	$scope.discute.tags = [];
	// Setting the current user;
	$rootScope.updateCurrentUser();
	autosize($('textarea'));
	$scope.triggerUpload = function(side){
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
		$scope.discute.picture.right = "";
	});
	$("#delete-left").click(function(){
		$scope.discute.picture.left = "";
	});
	$scope.upload = function(leftPicture, rightPicture){
		leftPicture === null ? $("#discute-side-left").addClass('upload-invalid') : $("#discute-side-left").removeClass('upload-invalid');
		rightPicture === null ? $("#discute-side-right").addClass('upload-invalid') : $("#discute-side-right").removeClass('upload-invalid');
		if(rightPicture !== null && leftPicture !== null){
			var discute = $scope.discute;		
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
				$state.go('home');
			});
		}
	};
	var removeWhiteSpace = function(word) {
		word.trim();
		var index = word.indexOf(' ');
		if(index >= 0){
			word = word.replace(/ /g, '');
		}
  		return  word;
	}
});