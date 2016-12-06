'use strict';

(function () {
	'use strict';

	angular.module('discuteApp.home', []).controller('HomeController', ['$scope', '$rootScope', '$cookies', '$state', '$location', 'AuthenticationService', 'DModule', 'data', homeController]);
	function homeController($scope, $rootScope, $cookies, $state, $location, AuthenticationService, DModule, data) {
		var self = this;
		self.logout = logout;
		self.comment = comment;
		self.vote = vote;
		self.deleteComment = deleteComment;
		self.order = order;
		self.closeSearch = closeSearch;
		self.loadMore = loadMore;
		self.initDropDown = initDropDown;
		self.complementDiscutes = complementDiscutes;
		self.checkAvailability = checkAvailability;
		self.search = search;

		// Setting 
		autosize($('textarea'));
		self.discutes = data;
		// Functions
		function logout() {
			AuthenticationService.Logout();
			$state.go('login');
		}
		$(".dropdown-menu li a").click(function () {
			$(".dropdown-toggle").text($(this).text());
			$(".dropdown-toggle").append($("<span>").addClass('caret'));
		});
		if ($location.path().indexOf("search") < 0 && $rootScope.searchItem !== null) {
			$rootScope.searchItem = null;
		}
		function comment(comment, side, discute) {
			checkAvailability();
			var index = self.discutes.indexOf(discute);
			DModule.addComment(comment, side, discute, $rootScope.currentUser.username);
			if (index === -1) {
				if (side === 'right') {
					$rootScope.currentDiscute.right.comment = "";
				}
				if (side === 'left') {
					$rootScope.currentDiscute.left.comment = "";
				}
			} else {
				if (side === 'right') {
					self.discutes[index].right.comment = "";
					self.visible_right = true;
				}
				if (side === 'left') {
					self.discutes[index].left.comment = "";
					self.visible_left = true;
				}
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
		function order(sort) {
			self.isOrderedList = true;
			self.orderType = sort;
			// Case tag
			if (!angular.isUndefined($rootScope.currentTag) && $rootScope.currentTag !== null) {
				DModule.tagAndOrder($rootScope.currentTag, sort, self.discutes).then(function (discutes) {
					self.discutes = $rootScope.splitArray(discutes);
					$scope.$apply();
				});
			}
			// Case search
			else if (!angular.isUndefined(self.searchDiscutes) && self.searchDiscutes !== null) {
					DModule.searchAndOrder(self.searchTerm, sort, self.searchDiscutes).then(function (discutes) {
						self.searchDiscutes = $rootScope.splitArray(discutes);
						$scope.$apply();
					});
				}
				// Case world
				else {
						DModule.orderBy(sort, self.discutes).then(function (discutes) {
							self.discutes = $rootScope.splitArray(discutes);
							$scope.$apply();
						});
					}
		}
		function search() {
			$rootScope.prevURL = $location.path();
			DModule.search(self.searchTerm, null).then(function (discutes) {
				initDropDown();
				self.searchDiscutes = $rootScope.splitArray(discutes);
				$rootScope.searchItem = self.searchTerm;
				$scope.$apply();
			});
		}
		function closeSearch() {
			if (!angular.isUndefined($rootScope.currentTag) && $rootScope.currentTag !== null) {
				$rootScope.currentTag = null;
				$location.path($rootScope.prevURL);
			}
			self.searchDiscutes = $rootScope.searchItem = self.searchTerm = null;
			initDropDown();
		}
		function loadMore(sort, array) {
			DModule.loadMore(sort, array, self.isOrderedList, self.orderType, $rootScope.searchItem).then(function (discutes) {
				switch (sort) {
					case 'home':
						{
							discutes.forEach(function (discute, index) {
								self.discutes.push(discute);
							});
							break;
						}
					case 'tag':case 'world':
						{
							complementDiscutes(self.discutes, discutes);
							break;
						}
					case 'search':
						{
							complementDiscutes(self.searchDiscutes, discutes);
							break;
						}
				}
				$scope.$apply();
			});
		}
		function complementDiscutes(dest, array) {
			while (dest[dest.length - 1].length < 3 && array.length > 0) {
				dest[dest.length - 1].push(array.splice(0, 1)[0]);
			}
			if (array.length > 0) {
				splitArray(array).forEach(function (arr, index) {
					dest[dest.length + index] = arr;
				});
			}
		}
		function initDropDown() {
			$(".dropdown-toggle").text('Best Rated');
			$(".dropdown-toggle").append($("<span>").addClass('caret'));
		}
		function checkAvailability() {
			if (!$cookies.getObject('currentUser') || !$cookies.getObject('currentUser').username || !$rootScope.currentUser || !$rootScope.currentUser.username) {
				console.log('HomeController');
				AuthenticationService.Logout();
				$state.go('login');
			}
		}
	}
})();
