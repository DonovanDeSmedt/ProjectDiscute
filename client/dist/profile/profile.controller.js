'use strict';

(function () {
	'use strict';

	angular.module('discuteApp.profile', []).controller('ProfileController', ['$scope', '$rootScope', '$state', '$stateParams', '$cookies', '$window', 'AuthenticationService', 'DModule', 'Upload', 'ProfileService', profileCtrl]);
	function profileCtrl($scope, $rootScope, $state, $stateParams, $cookies, $window, AuthenticationService, DModule, Upload, ProfileService) {
		var self = this;
		self.getUser = getUser;
		self.editProfileForm = editProfileForm;
		self.changePasswordForm = changePasswordForm;
		self.triggerUpload = triggerUpload;
		self.comment = comment;
		self.vote = vote;
		self.follow = follow;
		self.deleteComment = deleteComment;
		self.deleteDiscute = deleteDiscute;
		self.logout = logout;
		self.closeModal = closeModal;
		self.checkAvailability = checkAvailability;
		self.update_profile_picture = update_profile_picture;
		self.update_password = update_password;
		self.update_account = update_account;
		self.upload_picture = upload_picture;

		function getUser() {
			ProfileService.getUser($stateParams.username).then(function (user) {
				self.user = {};
				self.user.username = user.data.username;
				self.user.email = user.data.email;
				self.user.discutes = user.data.discutes;
				self.user.followers = user.data.followers;
				self.user.discuteArray = $rootScope.splitArray(user.data.discutes);
			}).catch(function (err) {
				if (err.status === 401) {
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
		$(document.body).click(function () {
			$('#discuteModal').modal('hide');
		});

		$('.modal-dialog').click(function (event) {
			event.stopPropagation();
		});
		$rootScope.updateCurrentUser();
		function editProfileForm(user) {
			update_account($rootScope.currentUser.email.toLowerCase(), user.email.toLowerCase());
		}
		function changePasswordForm(user) {
			update_password(user);
		}
		function triggerUpload() {
			$("#upload-profile-picture").click();
		}
		function upload_picture() {
			update_profile_picture(self.newProfilePicture);
			console.log("Succes");
			$("#profilePictureModal").modal('hide');
		}

		function follow(user) {
			if (user != $rootScope.currentUser.username) {
				var indexToFollow = $rootScope.currentUser.following.indexOf(user);
				var indexFollower = self.user.followers.indexOf($rootScope.currentUser.username);
				if (indexToFollow >= 0) {
					$rootScope.currentUser.following.splice(indexToFollow, 1);
					self.user.followers.splice(indexFollower, 1);
				} else {
					$rootScope.currentUser.following.push(user);
					self.user.followers.push($rootScope.currentUser.username);
				}
				ProfileService.follow($rootScope.currentUser.username, $rootScope.currentUser.following, user).then(function (data) {
					console.log("Following user:" + user);
				}).catch(function (err) {
					console.log(err);
				});
			}
		}
		function comment(comment, side, discute) {
			checkAvailability();
			DModule.addComment(comment, side, discute, $rootScope.currentUser.username);
			if (side === 'right' && angular.isDefined($rootScope.currentDiscute)) {
				$rootScope.currentDiscute.right.comment = "";
			}
			if (side === 'left' && angular.isDefined($rootScope.currentDiscute)) {
				$rootScope.currentDiscute.left.comment = "";
			}
		}
		function vote(side, discute) {
			checkAvailability();
			DModule.vote(side, discute, $rootScope.currentUser.username);
		}
		function deleteComment(side, comment, indexComment, discute) {
			checkAvailability();
			DModule.deleteComment(side, comment, indexComment, discute, $rootScope.currentUser.username);
		}

		function deleteDiscute() {
			bootbox.confirm("Are you sure?", function (result) {
				if (result) {
					$rootScope.currentDiscuteArray[$rootScope.parentIndex][$rootScope.index] = null;
					DModule.deleteDiscute($rootScope.currentDiscute);
					$('#discuteModal').modal('hide');
					$scope.$apply();
					$window.location.reload();
				}
			});
		}
		function logout() {
			AuthenticationService.Logout();
			$state.go('login');
		}
		function closeModal(tag) {
			$('#discuteModal').modal('hide');
			$('#profilePictureModal').modal('hide');
		}
		function checkAvailability() {
			if (!$rootScope.currentUser || !$rootScope.currentUser.username) {
				console.log('HomeController');
				AuthenticationService.Logout();
				$state.go('login');
			}
		}
		function update_profile_picture(picture) {
			var fd = new FormData();
			if (picture != null) {
				fd.append('picture', Upload.dataUrltoBlob(picture, 'profilePicture'));
				ProfileService.updateProfilePicture($rootScope.currentUser.username, fd).then(function (data) {
					console.log("Successfuly updated profile picture");
				});
			}
		}
		function update_account(oldEmail, newEmail) {
			ProfileService.updateAccount(oldEmail, newEmail).then(function (data) {
				bootbox.alert("Successfuly updated email", function (result) {
					$rootScope.currentUser.email = newEmail;
					var currentUser = $cookies.getObject('currentUser');
					currentUser.email = newEmail;
					$cookies.putObject('currentUser', currentUser);
				});
			}).catch(function (err) {
				if (err.data === "email") {
					self.emailError = true;
					self.usernameError = false;
					$('#email').addClass('invalid');
					$('#username').removeClass('invalid');
				}
				if (err.data === "username") {
					self.usernameError = true;
					self.emailError = false;
					$('#email').removeClass('invalid');
					$('#username').addClass('invalid');
				}
			});
		}
		function update_password(user) {
			ProfileService.updatePassword(user.currentPassword, user.newPassword, $rootScope.currentUser.email).then(function (data) {
				if (data.data.success) {
					console.log("Successfuly updated password");
					self.currentPasswordError = false;
					$('#current-password').removeClass('invalid');
				} else {
					self.currentPasswordError = true;
					$('#current-password').addClass('invalid');
					console.log(data.data.message);
				}
			}).catch(function (err) {
				console.log(err);
			});
		}
	}
})();
