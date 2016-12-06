'use strict';

(function () {
	'use strict';

	angular.module('discuteApp.global', []).controller('GlobalController', ['$scope', '$rootScope', '$cookies', '$http', '$state', '$location', '$timeout', 'AuthenticationService', globalCtrl]);
	function globalCtrl($scope, $rootScope, $cookies, $http, $state, $location, $timeout, AuthenticationService) {
		if (window.innerWidth > 769) {
			$(".login-background img").width(window.innerWidth);
			$(".login-background img").height(window.innerWidth / 1.5);
		} else {
			$(".login-background img").width(window.innerHeight * 1.5);
			$(".login-background img").height(window.innerHeight);
		}
		$rootScope.rootImgUrl = 'http://res.cloudinary.com/dvf32xjxh/image/upload/v1480612233/';
		$scope.logout = function () {
			AuthenticationService.Logout();
			$state.go('login');
		};
		$rootScope.setCurrentTag = function (tag) {
			$rootScope.currentTag = $rootScope.searchItem = tag;
		};
		$rootScope.splitArray = function (discutes) {
			var prevIndex = 0;
			var nextIndex = 3;
			var newArray = [];
			for (var i = 0; i < discutes.length / 3; i++) {
				newArray.push(discutes.slice(prevIndex, nextIndex));
				prevIndex = nextIndex;
				nextIndex += 3;
			}
			var rest = discutes % 3;
			if (rest) {
				newArray.push(discutes.slice(discutes.length - rest, discutes.length - 1));
			}
			return newArray;
		};
		$rootScope.goLeft = function () {
			if ($rootScope.index > 0) {
				$rootScope.index--;
			} else {
				if ($rootScope.parentIndex > 0) {
					$rootScope.parentIndex--;
					$rootScope.index = $rootScope.currentDiscuteArray[$rootScope.parentIndex].length - 1;
				}
			}
			$rootScope.currentDiscute = $rootScope.currentDiscuteArray[$rootScope.parentIndex][$rootScope.index];
		};
		$rootScope.goRight = function () {
			if ($rootScope.index < $rootScope.currentDiscuteArray[$rootScope.parentIndex].length - 1) {
				$rootScope.index++;
			} else {
				if ($rootScope.parentIndex < $rootScope.currentDiscuteArray.length - 1) {
					$rootScope.parentIndex++;
					$rootScope.index = 0;
				}
			}
			$rootScope.currentDiscute = $rootScope.currentDiscuteArray[$rootScope.parentIndex][$rootScope.index];
		};
		$rootScope.setCurrentDiscute = function (index, parentIndex, array) {
			$rootScope.currentDiscuteArray = array;
			$rootScope.parentIndex = parentIndex;
			$rootScope.index = index;
			$rootScope.currentDiscute = array[parentIndex][index]; //$scope.user.discuteArray[parentIndex][index];
		};
		$rootScope.updateCurrentUser = function () {
			if (!$cookies.getObject('currentUser') || !$cookies.getObject('currentUser').username) {
				AuthenticationService.Logout();
				$state.go('login');
				return false;
			}
			var username = $cookies.getObject('currentUser').username;
			return new Promise(function (resolve, reject) {
				$http.get('/user/' + username).then(function (user) {
					$rootScope.currentUser = user.data;
					resolve();
				}).catch(function (err) {
					if (err) {
						console.log(err);
						if (err.data = "Unauthorized") {
							$state.go('login');
						}
					}
				});
			});
		};
		$rootScope.prevPage = function () {
			$location.path($rootScope.prevURL);
		};

		$scope.scrollPos = {}; // scroll position of each view

		$(window).on('scroll', function () {
			if ($scope.okSaveScroll) {
				// false between $routeChangeStart and $routeChangeSuccess
				$scope.scrollPos[$location.path()] = $(window).scrollTop();
				//console.log($scope.scrollPos);
			}
		});
		$rootScope.initScrollPos = function () {
			$scope.scrollPos = {};
		};
		$scope.scrollClear = function (path) {
			$scope.scrollPos[path] = 0;
		};

		$scope.$on('$stateChangeStart', function () {
			$scope.okSaveScroll = false;
		});

		$scope.$on('$stateChangeSuccess', function () {
			$timeout(function () {
				// wait for DOM, then restore scroll position
				$(window).scrollTop($scope.scrollPos[$location.path()] ? $scope.scrollPos[$location.path()] : 0);
				$scope.okSaveScroll = true;
			}, 0);
		});
	};
})();
