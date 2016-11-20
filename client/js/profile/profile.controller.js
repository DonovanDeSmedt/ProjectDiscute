(function () {
  'use strict';
angular.module('discuteApp.profile', []).controller('ProfileController', profileCtrl);
 function profileCtrl($scope,$rootScope, $state,$stateParams,$cookies,$window, $http, AuthenticationService,DModule, Upload){
	let self = this;
	self.getUser = getUser;
	self.editProfileForm = editProfileForm;
	self.changePasswordForm = changePasswordForm;
	self.triggerUpload = triggerUpload;
	self.comment = comment;
	self.vote = vote;
	self.follow = follow;
	self.deleteComment = deleteComment;
	self.deleteDiscute  = deleteDiscute;
	self.logout = logout;
	self.closeModal = closeModal;
	self.checkAvailability = checkAvailability;
	self.update_profile_picture =update_profile_picture;
	self.update_password = update_password;
	self.update_account = update_account;
	self.upload_picture = upload_picture;

	function getUser(){
		$http.get('/user/'+$stateParams.username).then(function(user){
			self.user = {};
			self.user.username = user.data.username;
			self.user.email = user.data.email;
			self.user.discutes = user.data.discutes;
			self.user.followers = user.data.followers;
			self.user.discuteArray = $rootScope.splitArray(user.data.discutes);
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
	function editProfileForm(user){
		const oldUser = {
			email: $rootScope.currentUser.email.toLowerCase(),
			username: $rootScope.currentUser.username.toLowerCase()
		};
		const newUser = {
			email: user.email.toLowerCase(),
			username: user.username.toLowerCase()
		}
		update_account(oldUser, newUser);
	}
	function changePasswordForm(user){
		update_password(user);
	}
	function triggerUpload(){
		$("#upload-profile-picture").click();
	}
	function upload_picture(){
		update_profile_picture(self.newProfilePicture);
		console.log("Succes");
		$("#profilePictureModal").modal('hide');
	}
	
	function follow(user){
		if(user != $rootScope.currentUser.username){
			const indexToFollow = $rootScope.currentUser.following.indexOf(user);
			const indexFollower = self.user.followers.indexOf($rootScope.currentUser.username);
			if(indexToFollow >= 0){
				$rootScope.currentUser.following.splice(indexToFollow, 1);
				self.user.followers.splice(indexFollower, 1);
			}
			else{
				$rootScope.currentUser.following.push(user);
				self.user.followers.push($rootScope.currentUser.username);
			}
			$http.put('/user/follow/'+$rootScope.currentUser.username, {following: $rootScope.currentUser.following, userToFollow: user, follower: $rootScope.currentUser.username}).then(function(data){

			}).catch(function(err){
				console.log(err);
			});
		}
	}
	function comment(comment, side, discute){
		checkAvailability();
		DModule.addComment(comment, side, discute, $rootScope.currentUser.username);
		if(side === 'right' && angular.isDefined($rootScope.currentDiscute)){
			$rootScope.currentDiscute.right.comment = "";
		}
		if(side === 'left' && angular.isDefined($rootScope.currentDiscute)){
			$rootScope.currentDiscute.left.comment = "";
		}
	}
	function vote(side, discute){
		checkAvailability();
		DModule.vote(side, discute, $rootScope.currentUser.username);
	}
	function deleteComment(side, comment, indexComment, discute){
		checkAvailability();
		DModule.deleteComment(side, comment, indexComment, discute, $rootScope.currentUser.username);
	}
	
	function deleteDiscute(){
		bootbox.confirm("Are you sure?", function(result) {
			if(result){
				$rootScope.currentDiscuteArray[$rootScope.parentIndex][$rootScope.index] = null;
				DModule.deleteDiscute($rootScope.currentDiscute);
				$('#discuteModal').modal('hide');
				$rootScope.$apply();
				 $window.location.reload();
			}
		}); 
	}
	function logout(){
		AuthenticationService.Logout();
		$state.go('login');
	}
	function closeModal(tag){
		$('#discuteModal').modal('hide');
		$('#profilePictureModal').modal('hide');
	}
	function checkAvailability(){
		if(!$rootScope.currentUser || !$rootScope.currentUser.username){
			console.log('HomeController');
			AuthenticationService.Logout();
			$state.go('login');
		}
	}
	function update_profile_picture(picture){
		let fd = new FormData();
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
	function update_account(oldUser, newUser){
		$http.put('/user/account/'+$rootScope.currentUser.username, {old: oldUser, new: newUser}).then(function(data){
			console.log("Successfuly updated useraccount")
			$rootScope.currentUser.username = newUser.username;
			$rootScope.currentUser.email = newUser.email;
			let currentUser = $cookies.getObject('currentUser');
			currentUser.email = newUser.email;
			currentUser.username = newUser.username;
			$cookies.putObject('currentUser', currentUser);
		}).catch(function(err){
			if(err.data === "email"){
				self.emailError = true;
				self.usernameError = false;
				$('#email').addClass('invalid');
				$('#username').removeClass('invalid');
			}
			if(err.data === "username"){
				self.usernameError = true;
				self.emailError = false;
				$('#email').removeClass('invalid');
				$('#username').addClass('invalid');
			}
		})
	}
	function update_password(user){
		$http.put('/user/changePassword/', {currentPassword: user.currentPassword, password: user.newPassword, email: $rootScope.currentUser.email}).then(function(data){
			if(data.data.success){
				console.log("Successfuly updated password")
				self.currentPasswordError = false;
				$('#current-password').removeClass('invalid');
			}
			else{
				self.currentPasswordError = true;
				$('#current-password').addClass('invalid');
				console.log(data.data.message);
			}
			
		}).catch(function(err){
			console.log(err);
		})
	}
	
}
})();