'use strict';

(function () {
	'use strict';

	angular.module('discuteApp.service').factory('ProfileService', ['$http', '$cookies', '$rootScope', profileService]);
	function profileService($http, $cookies, $rootScope) {
		var service = {};
		service.getUser = getUser;
		service.updateAccount = updateAccount;
		service.updatePassword = updatePassword;
		service.updateProfilePicture = updateProfilePicture;
		service.follow = follow;
		return service;

		function getUser(username) {
			return $http.get('/user/' + username);
		}
		function updateAccount(oldEmail, newEmail) {
			return $http.put('/user/account/' + oldEmail, { new: newEmail });
		}
		function updatePassword(currentPassword, newPassword, email) {
			return $http.put('/user/changePassword/', { currentPassword: currentPassword, password: newPassword, email: email });
		}
		function updateProfilePicture(username, fd) {
			return $http.put('/user/profile_picture/' + username, fd, {
				transformRequest: angular.indentity,
				headers: { 'Content-Type': undefined }
			});
		}
		function follow(username, following, user) {
			return $http.put('/user/follow/' + username, { following: following, userToFollow: user, follower: username });
		}
	};
})();
