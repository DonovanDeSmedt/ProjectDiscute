'use strict';

var requires = ['ui.router', 'ngResource', 'ngTouch', 'ngFileUpload', 'ngCookies', 'ngImgCrop', 'discuteApp.home', 'discuteApp.profile', 'discuteApp.create', 'discuteApp.service', 'discuteApp.global', 'discuteApp.auth', 'discuteApp.directive'];

angular.module('discuteApp', requires);

angular.module('discuteApp').config(function ($stateProvider, $httpProvider, $urlRouterProvider) {
  $httpProvider.interceptors.push('authInterceptor');
  $httpProvider.defaults.withCredentials = true;
  $httpProvider.defaults.xsrfCookieName = 'csrftoken';
  $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
  $httpProvider.interceptors.push('myCSRF');
  $urlRouterProvider.otherwise("/home");
  $stateProvider.state('home', {
    cache: false,
    url: '/home',
    templateUrl: 'js/home/home.html',
    controller: 'HomeController',
    controllerAs: 'homeCtrl',
    resolve: {
      logincheck: checkLoggedIn,
      background: function background($rootScope) {
        // $(".login-background").hide();
        $rootScope.currentTag = null;
      },
      data: function data(DModule) {
        return DModule.getDiscutes().then(function (discutes) {
          return discutes;
        });
      }
    }
  }).state('world', {
    cache: false,
    url: '/world',
    templateUrl: 'js/home/world.html',
    controller: 'HomeController',
    controllerAs: 'homeCtrl',
    resolve: {
      logincheck: checkLoggedIn,
      background: function background($rootScope) {
        $rootScope.currentTag = null;
      },
      data: function data(DModule) {
        return DModule.getGeneralDiscutes().then(function (discutes) {
          return splitArray(discutes);
        });
      }
    }
  }).state('search', {
    cache: false,
    url: '/search/:name',
    templateUrl: 'js/home/search.html',
    controller: 'HomeController',
    controllerAs: 'homeCtrl',
    resolve: {
      logincheck: checkLoggedIn,
      data: function data(DModule, $stateParams) {
        return DModule.searchTag($stateParams.name, null).then(function (discutes) {
          return splitArray(discutes);
        });
      }
    }
  }).state('profile', {
    cache: false,
    url: '/profile',
    templateUrl: 'js/profile/profile.html',
    controller: 'ProfileController',
    controllerAs: 'profileCtrl',
    resolve: {
      logincheck: checkLoggedIn
    }
  }).state('add-discute', {
    cache: false,
    url: '/add-discute',
    templateUrl: 'js/create/create.html',
    controller: 'CreateController',
    controllerAs: 'createCtrl',
    resolve: {
      logincheck: checkLoggedIn
    }
  }).state('mobile-discute-view', {
    cache: false,
    url: '/discute/:id',
    templateUrl: 'js/partials/discute_modal_mobile.html',
    controller: 'HomeController',
    controllerAs: 'homeCtrl',
    resolve: {
      logincheck: checkLoggedIn,
      data: function data(DModule, $stateParams, $state) {
        return DModule.getDiscuteById($stateParams.id).then(function (discute) {
          return discute;
        }).catch(function (err) {
          console.log(err);
          $state.go('404');
        });
      }
    }
  }).state('user', {
    cache: false,
    url: '/profile/:username',
    templateUrl: 'js/profile/profile.html',
    controller: 'ProfileController',
    controllerAs: 'profileCtrl',
    resolve: {
      logincheck: checkLoggedIn
    }
  }).state('edit', {
    cache: false,
    url: '/account/:username',
    templateUrl: 'js/profile/edit_profile.html',
    controller: 'ProfileController',
    controllerAs: 'profileCtrl',
    resolve: {
      logincheck: checkLoggedIn,
      usercheck: checkUser
    }
  }).state('login', {
    cache: false,
    url: '/login',
    templateUrl: 'js/auth/login.html',
    controller: 'LoginController'
  }).state('register', {
    cache: false,
    url: '/register',
    templateUrl: 'js/auth/register.html',
    controller: 'RegisterController'
  }).state('api', {
    cache: false,
    url: '/api',
    resolve: {
      api: function api() {
        window.location.href = "apidoc/index.html";
      }
    },
    templateUrl: 'apidoc/index.html'
  }).state('404', {
    cache: false,
    url: '/404',
    templateUrl: 'js/404/404.html',
    controller: 'GlobalController'
  });
}).constant('_', window._).run(function ($state, $http, $cookies) {
  $state.go('home');
  // $http.defaults.headers.post['X-CSRFToken'] = $cookies.csrftoken;
}).provider('myCSRF', [function () {
  var headerName = 'X-CSRFToken';
  var cookieName = 'csrftoken';
  var allowedMethods = ['GET'];

  this.setHeaderName = function (n) {
    headerName = n;
  };
  this.setCookieName = function (n) {
    cookieName = n;
  };
  this.setAllowedMethods = function (n) {
    allowedMethods = n;
  };
  this.$get = ['$cookies', function ($cookies) {
    return {
      'request': function request(config) {
        if (allowedMethods.indexOf(config.method) === -1) {
          // do something on success
          config.headers[headerName] = $cookies.get(cookieName);
        }
        return config;
      }
    };
  }];
}]);

var checkLoggedIn = function checkLoggedIn($q, $timeout, $cookies, $http, $location, $rootScope, $state, AuthenticationService) {
  var deferred = $q.defer();
  $rootScope.prevURL = $location.path();
  if ($cookies.getObject('currentUser') != null) {
    deferred.resolve();
  } else {
    // $rootScope.errorMessage = 'You need to log in';
    AuthenticationService.Logout();
    deferred.reject();
    $state.go('login');
    window.location.href = '/#/login';
    return false;
  }

  return deferred.promise;
};
var checkUser = function checkUser($q, $stateParams, $rootScope) {
  var deferred = $q.defer();
  console.log($stateParams.username);
  if (!angular.isUndefined($rootScope.currentUser) && $stateParams.username !== $rootScope.currentUser.username) {
    deferred.reject();
    $state.go('profile');
  } else {
    deferred.resolve();
  }
  return deferred.promise;
};
var splitArray = function splitArray(discutes) {
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
;// angular.module('discuteApp.auth',[]);
"use strict";
;'use strict';

(function () {
	'use strict';

	angular.module('discuteApp.auth', []).controller('LoginController', ['$scope', '$rootScope', '$state', '$http', 'AuthenticationService', loginCtrl]);

	function loginCtrl($scope, $rootScope, $state, $http, AuthenticationService) {
		$http.get('/login').then(function (data) {}).catch(function (err) {
			console.log(err);
		});
		$(".login-background").show();
		$scope.submitLoginForm = function (user) {
			if (angular.isUndefined(user) || user === null) {
				$scope.errorMessage = "Email or password incorrect";
				return false;
			}
			AuthenticationService.Login(user.email, user.password, function (result) {
				if (result === true) {
					$state.go('home');
				} else {
					$scope.errorMessage = "Email or password incorrect";
				}
			});
		};
	}
})();
;'use strict';

(function () {
	'use strict';

	angular.module('discuteApp.auth').controller('RegisterController', ['$scope', '$state', '$http', 'AuthenticationService', registerCtrl]);
	function registerCtrl($scope, $state, $http, AuthenticationService) {

		$scope.submitForm = function (form, user) {
			if (!form.$valid) {
				return false;
			}
			user.username = removeWhiteSpace(user.username);
			AuthenticationService.Register(user, function (result, data) {
				if (result) {
					AuthenticationService.Login(user.email, user.password, function (loginResult) {
						if (loginResult) {
							$state.go('home');
						}
					});
				} else {
					if (data === "email") {
						$scope.emailError = true;
						$scope.usernameError = false;
						$('#email').addClass('invalid');
						$('#username').removeClass('invalid');
					}
					if (data === "username") {
						$scope.usernameError = true;
						$scope.emailError = false;
						$('#email').removeClass('invalid');
						$('#username').addClass('invalid');
					}
				}
			});
		};
		var removeWhiteSpace = function removeWhiteSpace(word) {
			word.trim();
			var index = word.indexOf(' ');
			if (index >= 0) {
				word = word.replace(/ /g, '');
			}
			return word;
		};
	}
})();
;'use strict';

(function () {
	'use strict';

	angular.module('discuteApp.create', []).controller('CreateController', ['$scope', '$rootScope', '$cookies', '$state', 'AuthenticationService', 'Upload', 'DModule', '$timeout', 'DiscuteService', createCtrl]);

	function createCtrl($scope, $rootScope, $cookies, $state, AuthenticationService, Upload, DModule, $timeout, DiscuteService) {
		var self = this;
		self.app = "iDiscute";
		self.discute = {};
		self.discute.tags = [];
		self.triggerUpload = triggerUpload;
		self.customSearch = customSearch;
		self.upload = upload;
		self.removeWhiteSpace = removeWhiteSpace;

		// Setting the current user;
		$rootScope.updateCurrentUser();
		autosize($('textarea'));
		function triggerUpload(side) {
			if (side === 'left') {
				$timeout(function () {
					$("#upload-image-left").click();
				});
			} else if (side === 'right') {
				$timeout(function () {
					$("#upload-image-right").click();
				});
			}
		}
		$scope.$watch('discute.description', function (newValue, oldValue) {
			if (newValue) {
				if (newValue.length > 150) {
					$scope.discute.description = oldValue;
				}
			}
		});
		$("#delete-right").click(function () {
			self.discute.picture.right = "";
		});
		$("#delete-left").click(function () {
			self.discute.picture.left = "";
		});
		function customSearch(name, side) {
			DiscuteService.customSearch(name).then(function (img) {
				if (angular.isUndefined(self.discute.picture)) {
					self.discute.picture = {};
				}
				switch (side) {
					case 'left':
						self.discute.picture.left = "uploads/" + img.data;break;
					case 'right':
						self.discute.picture.right = "uploads/" + img.data;break;
				}
			}).catch(function (err) {
				console.log(err);
			});
		}
		function upload(leftPicture, rightPicture) {
			leftPicture === null ? $("#discute-side-left").addClass('upload-invalid') : $("#discute-side-left").removeClass('upload-invalid');
			rightPicture === null ? $("#discute-side-right").addClass('upload-invalid') : $("#discute-side-right").removeClass('upload-invalid');
			if (rightPicture !== null && leftPicture !== null) {
				var discute = self.discute;
				var fd = new FormData();

				discute.tags = $.map(discute.tags, function (value, index) {
					if (value[0] != '#') {
						value = '#' + removeWhiteSpace(value);
					}
					return value;
				});
				for (var key in discute) {
					fd.append(key, discute[key]);
				}
				fd.append('author', $rootScope.currentUser.username);
				fd.append('leftPicture', Upload.dataUrltoBlob(leftPicture, 'blobleft'));
				fd.append('rightPicture', Upload.dataUrltoBlob(rightPicture, 'blobright'));
				DiscuteService.uploadDiscute(fd).then(function (response) {
					$rootScope.initScrollPos();
					$state.go('home');
				});
			}
		};
		function removeWhiteSpace(word) {
			word.trim();
			var index = word.indexOf(' ');
			if (index >= 0) {
				word = word.replace(/ /g, '');
			}
			return word;
		}
	}
})();
;'use strict';

angular.module('discuteApp.directive', []).directive('passwordValidator', function () {
  return {
    require: 'ngModel',
    link: function link(scope, elm, attrs, ctl) {
      scope.$watch(attrs['passwordValidator'], function (errorMsg) {
        elm[0].setCustomValidity(errorMsg);
        ctl.$setValidity('passwordValidator', errorMsg ? true : false);
      });
    }
  };
}).directive('discuteHeader', function () {
  return {
    restrict: 'AE',
    replace: true,
    templateUrl: 'js/directives/header.html'
  };
}).directive('loginBackground', function () {
  return {
    restrict: 'AE',
    replace: true,
    templateUrl: 'js/directives/loginBackground.html',
    controller: 'GlobalController'
  };
}).directive('ngEnter', function () {
  return function (scope, element, attrs) {
    element.bind("keydown keypress", function (event) {
      if (event.which === 13) {
        scope.$apply(function () {
          scope.$eval(attrs.ngEnter, { 'event': event });
        });

        event.preventDefault();
      }
    });
  };
}).directive('iosDblclick', function () {

  var DblClickInterval = 300; //milliseconds

  var firstClickTime;
  var waitingSecondClick = false;

  return {
    restrict: 'A',
    link: function link(scope, element, attrs) {
      element.bind('click', function (e) {

        if (!waitingSecondClick) {
          firstClickTime = new Date().getTime();
          waitingSecondClick = true;

          setTimeout(function () {
            waitingSecondClick = false;
          }, DblClickInterval);
        } else {
          waitingSecondClick = false;

          var time = new Date().getTime();
          if (time - firstClickTime < DblClickInterval) {
            scope.$apply(attrs.iosDblclick);
          }
        }
      });
    }
  };
});;
;'use strict';

(function () {
	'use strict';

	angular.module('discuteApp.global', []).controller('GlobalController', ['$scope', '$rootScope', '$cookies', '$http', '$state', '$location', '$timeout', 'AuthenticationService', globalCtrl]);
	function globalCtrl($scope, $rootScope, $cookies, $http, $state, $location, $timeout, AuthenticationService) {
		$rootScope.rootImgUrl = 'http://res.cloudinary.com/dvf32xjxh/image/upload/c_scale,h_400,q_75/v1480612233/';
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
;'use strict';

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
;'use strict';

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
;'use strict';

(function () {
    'use strict';

    angular.module('discuteApp.service', ['ngCookies']).factory('AuthenticationService', ['$http', '$cookies', '$rootScope', AuthenticationFactory]);

    function AuthenticationFactory($http, $cookies, $rootScope) {
        var service = {};
        service.Login = login;
        service.Logout = logout;
        service.Register = register;
        return service;

        function login(email, password, callback) {
            $http.post('/login', { username: email, password: password }).then(function (response) {
                // login successful if there's a token in the response
                if (response.data.token) {
                    // store username and token in local storage to keep user logged in between page refreshes
                    $rootScope.currentUser = { email: email, token: response.data.token, username: response.data.username, following: response.data.following };
                    $cookies.putObject('currentUser', { email: email, token: response.data.token, username: response.data.username, test: "Zever" });
                    // add jwt token to auth header for all requests made by the $http service
                    // $http.defaults.headers.common.Authorization = response.data.token;
                    // execute callback with true to indicate successful login
                    callback(true);
                } else {
                    // execute callback with false to indicate failed login
                    callback(false);
                }
            }).catch(function (err) {
                callback(false);
            });
        }
        function register(user, callback) {
            $http.post('/register', user).then(function () {
                callback(true);
            }).catch(function (data, status, headers, config) {
                console.log("Fail");
                callback(false, data.data);
            });
        }
        function logout() {
            $cookies.remove('currentUser');
            $rootScope.currentUser = null;
            $http.defaults.headers.common.Authorization = '';
        }
    }
})();
;'use strict';

(function () {
	'use strict';

	angular.module('discuteApp.service').factory('authInterceptor', ['$cookies', authInterceptor]);

	function authInterceptor($cookies) {
		return {
			request: function request(config) {
				if ($cookies.getObject('currentUser')) {
					config.headers.Authorization = $cookies.getObject('currentUser').token;
				}
				return config;
			}

		};
	}
})();
;'use strict';

(function () {
	'use strict';

	angular.module('discuteApp.service').factory('DiscuteService', ['$http', discuteService]);
	function discuteService($http) {
		var service = {};
		service.uploadDiscute = uploadDiscute;
		service.customSearch = customSearch;

		return service;

		function uploadDiscute(fd) {
			return $http.post('/discute/new', fd, {
				transformRequest: angular.indentity,
				headers: { 'Content-Type': undefined }
			});
		}
		function customSearch(name) {
			return $http.get('pictures/search/custom/' + name);
		}
	};
})();
;'use strict';

angular.module('discuteApp.service').factory('_', function ($window) {
  if (!$window._) {
    // For testing purposes
  }
  return $window._;
});
;// angular.module('discuteApp.service',['ngCookies']);
"use strict";
;'use strict';

(function () {
  'use strict';

  angular.module('discuteApp.service').factory('DModule', ['$state', '$http', '$rootScope', 'AuthenticationService', '$cookies', dModule]);
  function dModule($state, $http, $rootScope, AuthenticationService, $cookies) {
    return function () {

      var discutes = void 0;
      var _homeData = function _homeData(index) {
        return $rootScope.updateCurrentUser().then(function () {
          return $http.get('/discute/' + $rootScope.currentUser.username + '/' + index).then(function (data) {
            return data.data.discutes;
          }).catch(function (err) {
            console.log(err);
          });
        }).catch(function (err) {
          console.log(err);
        });
      };
      var _worldData = function _worldData(index) {
        return $rootScope.updateCurrentUser().then(function () {
          return $http.get('/discute/' + index).then(function (data) {
            return data.data.discutes;
          });
        }).catch(function (err) {
          console.log(err);
        });
      };
      var getDiscutes = function getDiscutes() {
        return _homeData(0);
      };
      var getGeneralDiscutes = function getGeneralDiscutes() {
        return _worldData(0);
      };
      var getDiscuteById = function getDiscuteById(id) {
        return $rootScope.updateCurrentUser().then(function () {
          return $http.get('/discute/findBy/id/' + id).then(function (data) {
            return data.data.discute[0];
          });
        });
      };

      var deleteDiscute = function deleteDiscute(discute) {
        if (discute.author === $rootScope.currentUser.username) {
          $http.delete('/discute/' + discute._id).then(function (data) {}).catch(function (err) {
            console.log(err);
          });
        }
      };
      var addDiscute = function addDiscute(discute) {
        discutes.push(discute);
      };

      var addComment = function addComment(comment, side, discute, username) {
        return $http.put('/discute/comment/' + discute._id, { user: username, comment: comment, side: side }).then(function (data) {
          _updateDiscute(discute, data.data.left, data.data.right);
          return discute;
        }).catch(function (err) {
          console.log(err);
          AuthenticationService.Logout();
          $state.go('login');
        });
      };

      var vote = function vote(side, discute, username) {
        $http.put('/discute/vote/' + discute._id, { user: username, side: side }).then(function (data) {
          _updateDiscute(discute, data.data.left, data.data.right);
        }).catch(function (err) {
          console.log(err);
          AuthenticationService.Logout();
          $state.go('login');
        });
      };

      var deleteComment = function deleteComment(side, comment, indexComment, discute, username) {
        if (comment.name === username) {
          var id = void 0;
          if (side === 'left') {
            id = discute.left.comments[indexComment]._id;
          }
          if (side === 'right') {
            id = discute.right.comments[indexComment]._id;
          }
          return $http.put('/discute/uncomment/' + discute._id, { side: side, id: id }).then(function (data) {
            _updateDiscute(discute, data.data.left, data.data.right);
            return discute;
          }).catch(function (err) {
            console.log(err);
            AuthenticationService.Logout();
            $state.go('login');
          });
        }
      };
      var _updateDiscute = function _updateDiscute(discute, left, right) {
        discute.right.votes = right.votes;
        discute.right.comments = right.comments;
        discute.left.votes = left.votes;
        discute.left.comments = left.comments;
      };
      var search = function search(name, array) {
        var index = array === null ? 0 : Math.floor(_calculateLenghtDiscutes(array) / 21);
        if (name[0] === '#') {
          return searchTag(name.slice(1), null);
        } else {
          return new Promise(function (resolve, reject) {
            $http.get('/search/' + name.trim() + '/' + index).then(function (data) {
              discutes = data.data.discutes;
              resolve(discutes);
            });
          });
        }
      };
      var searchTag = function searchTag(name, array) {
        var index = array === null ? 0 : Math.floor(_calculateLenghtDiscutes(array) / 21);
        return new Promise(function (resolve, reject) {
          $http.get('/search/tag/' + name + '/' + index).then(function (data) {
            discutes = data.data.discutes;
            resolve(discutes);
          });
        });
      };
      var tagAndOrder = function tagAndOrder(name, sort, array) {
        var index = Math.floor(_calculateLenghtDiscutes(array) / 21);
        return new Promise(function (resolve, reject) {
          $http.get('/search/tagAndOrder/' + name.slice(1) + '/' + sort + '/' + index).then(function (data) {
            discutes = data.data.discutes;
            resolve(discutes);
          });
        });
      };
      var orderBy = function orderBy(sort, array) {
        var index = Math.floor(_calculateLenghtDiscutes(array) / 21);
        return new Promise(function (resolve, reject) {
          $http.get('/search/orderby/' + sort + '/' + index).then(function (data) {
            discutes = data.data.discutes;
            resolve(discutes);
          }).catch(function (err) {
            console.log(err);
          });
        });
      };
      var searchAndOrder = function searchAndOrder(search, sort, array) {
        var index = Math.floor(_calculateLenghtDiscutes(array) / 21);
        if (search[0] === '#') {
          return tagAndOrder(search, sort, array);
        } else {
          return new Promise(function (resolve, reject) {
            $http.get('/search/searchAndOrder/' + search + '/' + sort + '/' + index).then(function (data) {
              discutes = data.data.discutes;
              resolve(discutes);
            }).catch(function (err) {
              console.log(err);
            });
          });
        }
      };

      var loadMore = function loadMore(sort, array, isOrdered, order, searchTerm) {
        var index = void 0;
        switch (sort.toLowerCase()) {
          case 'home':
            {
              index = Math.floor(array.length / 12);
              return _homeData(index);
            }
          case 'world':
            {
              index = Math.floor(_calculateLenghtDiscutes(array) / 21);
              return angular.isUndefined(isOrdered) || !isOrdered ? _worldData(index) : orderby(order, array);
            }
          case 'search':
            {
              return angular.isUndefined(isOrdered) || !isOrdered ? search(searchTerm, array) : searchAndOrder(searchTerm, order, array);
            }
          case 'tag':
            {
              index = Math.floor(_calculateLenghtDiscutes(array) / 21);
              return angular.isUndefined(isOrdered) || !isOrdered ? searchTag(searchTerm.slice(1), array) : tagAndOrder(searchTerm, order, array);
            }
        }
      };
      var _calculateLenghtDiscutes = function _calculateLenghtDiscutes(discutes) {
        var length = 0;
        discutes.forEach(function (array, index) {
          length += array.length;
        });
        return length;
      };

      return {
        getDiscutes: getDiscutes,
        getGeneralDiscutes: getGeneralDiscutes,
        getDiscuteById: getDiscuteById,
        deleteDiscute: deleteDiscute,
        addComment: addComment,
        vote: vote,
        deleteComment: deleteComment,
        orderBy: orderBy,
        search: search,
        searchTag: searchTag,
        searchAndOrder: searchAndOrder,
        tagAndOrder: tagAndOrder,
        loadMore: loadMore
      };
    }();
  };
})();
;'use strict';

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
