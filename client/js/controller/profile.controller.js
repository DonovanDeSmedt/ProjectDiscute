angular.module('discuteApp').controller('ProfileController', function($scope,$rootScope, $state,$stateParams,$cookies, $http, AuthenticationService, Discute,DModule, Upload){
	$scope.getUser = function(){
		$http.get('/user/'+$stateParams.username).then(function(user){
			$scope.user = {};
			$scope.user.username = user.data.username;
			$scope.user.email = user.data.email;
			$scope.user.discutes = user.data.discutes;
			$scope.user.followers = user.data.followers;
			$scope.user.discuteArray = $rootScope.splitArray(user.data.discutes);
		}).catch(function(err){
			if(err.status === 401){
				console.log('ProfileController');
				AuthenticationService.Logout();
				$state.go('login');
			}
			console.log("Error while fetching user");
			$rootScope.errorMessage = "User not found";
			$state.go('404');
		//Go to 404;
	});
	}
	$(document.body).click( function() {
		$('#discuteModal').modal('hide');
	});

	$('.modal-dialog').click(function(event){
		event.stopPropagation();
	});
	$rootScope.updateCurrentUser();
	$scope.editProfileForm = function(user){
		var oldUser = {
			email: $rootScope.currentUser.email.toLowerCase(),
			username: $rootScope.currentUser.username.toLowerCase()
		};
		var newUser = {
			email: user.email.toLowerCase(),
			username: user.username.toLowerCase()
		}
		update_account(oldUser, newUser);
	}
	$scope.changePasswordForm = function(user){
		update_password(user);
	}
	$scope.triggerUpload = function(){
		$("#upload-profile-picture").click();
	}
	$scope.upload_picture = function(){
		update_profile_picture($scope.newProfilePicture);
		console.log("Succes");
		$("#profilePictureModal").modal('hide');
	}
	$rootScope.setCurrentDiscute = function(index, parentIndex, array){
		$rootScope.currentDiscuteArray = array;
		$scope.parentIndex = parentIndex;
		$scope.index = index;
		$rootScope.currentDiscute = array[parentIndex][index];//$scope.user.discuteArray[parentIndex][index];
	}
	$scope.follow = function(user){
		if(user != $rootScope.currentUser.username){
			var indexToFollow = $rootScope.currentUser.following.indexOf(user);
			var indexFollower = $scope.user.followers.indexOf($rootScope.currentUser.username);
			if(indexToFollow >= 0){
				$rootScope.currentUser.following.splice(indexToFollow, 1);
				$scope.user.followers.splice(indexFollower, 1);
			}
			else{
				$rootScope.currentUser.following.push(user);
				$scope.user.followers.push($rootScope.currentUser.username);
			}
			$http.put('/user/follow/'+$rootScope.currentUser.username, {following: $rootScope.currentUser.following, userToFollow: user, follower: $rootScope.currentUser.username}).then(function(data){

			}).catch(function(err){
				console.log(err);
			});
		}
	}
	$scope.comment = function(comment, side, discute){
		checkAvailability();
		DModule.add_comment(comment, side, discute, $rootScope.currentUser.username);
		if(side === 'right'){
			$rootScope.currentDiscute.right.comment = "";
		}
		if(side === 'left'){
			$rootScope.currentDiscute.left.comment = "";
		}
	}
	$scope.vote = function(side, discute){
		checkAvailability();
		DModule.vote(side, discute, $rootScope.currentUser.username);
	}
	$scope.delete_comment = function(side, comment, indexComment, discute){
		checkAvailability();
		DModule.delete_comment(side, comment, indexComment, discute, $rootScope.currentUser.username);
	}
	$rootScope.goLeft = function(){
		if($scope.index > 0){
			$scope.index--;
		}
		else{
			if($scope.parentIndex > 0){
				$scope.parentIndex--;
				$scope.index = $rootScope.currentDiscuteArray[$scope.parentIndex].length - 1;
			}
		}
		$rootScope.currentDiscute = $rootScope.currentDiscuteArray[$scope.parentIndex][$scope.index];
	}
	$rootScope.goRight = function(){
		if($scope.index < $rootScope.currentDiscuteArray[$scope.parentIndex].length - 1){
			$scope.index++;
		}
		else{
			if($scope.parentIndex < $rootScope.currentDiscuteArray.length - 1){
				$scope.parentIndex++;
				$scope.index = 0;
			}
		}
		$rootScope.currentDiscute = $rootScope.currentDiscuteArray[$scope.parentIndex][$scope.index];
	}
	$scope.deleteDiscute = function(){
		bootbox.confirm("Are you sure?", function(result) {
			if(result){
				$rootScope.currentDiscuteArray[$scope.parentIndex][$scope.index] = null;
				DModule.deleteDiscute($rootScope.currentDiscute);
				$('#discuteModal').modal('hide');
				$rootScope.$apply();
			}
		}); 
	}
	$scope.logout = function(){
		AuthenticationService.Logout();
		$state.go('login');
	}
	$scope.closeModal = function(tag){
		$('#discuteModal').modal('hide');
		$('#profilePictureModal').modal('hide');
	}
	checkAvailability = function(){
		if(!$rootScope.currentUser || !$rootScope.currentUser.username){
			console.log('HomeController');
			AuthenticationService.Logout();
			$state.go('login');
		}
	}
	update_profile_picture = function(picture){
		var fd = new FormData();
		if(picture != null){
			fd.append('picture', Upload.dataUrltoBlob(picture, 'profilePicture'));
			$http.put('/user/profile_picture/'+$rootScope.currentUser.username, fd, {
				transformRequest: angular.indentity,
				headers: { 'Content-Type': undefined }
			}).then(function(data){
				console.log("Successfuly updated profile picture")
			});
		}
	}
	update_account = function(oldUser, newUser){
		$http.put('/user/account/'+$rootScope.currentUser.username, {old: oldUser, new: newUser}).then(function(data){
			console.log("Successfuly updated useraccount")
			$rootScope.currentUser.username = newUser.username;
			$rootScope.currentUser.email = newUser.email;
			var currentUser = $cookies.getObject('currentUser');
			currentUser.email = newUser.email;
			currentUser.username = newUser.username;
			$cookies.putObject('currentUser', currentUser);
		}).catch(function(err){
			if(err.data === "email"){
				$scope.emailError = true;
				$scope.usernameError = false;
				$('#email').addClass('invalid');
				$('#username').removeClass('invalid');
			}
			if(err.data === "username"){
				$scope.usernameError = true;
				$scope.emailError = false;
				$('#email').removeClass('invalid');
				$('#username').addClass('invalid');
			}
		})
	}
	update_password = function(user){
		$http.put('/user/changePassword/', {currentPassword: user.currentPassword, password: user.newPassword, email: $rootScope.currentUser.email}).then(function(data){
			if(data.data.success){
				console.log("Successfuly updated password")
				$scope.currentPasswordError = false;
				$('#current-password').removeClass('invalid');
			}
			else{
				$scope.currentPasswordError = true;
				$('#current-password').addClass('invalid');
				console.log(data.data.message);
			}
			
		}).catch(function(err){
			console.log(err);
		})
	}
	$rootScope.splitArray = function(discutes){
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
	

});