angular.module('discuteApp').controller('GlobalController', function($scope,$rootScope,$cookies,$http,$state,$location, $timeout, AuthenticationService){
	if(window.innerWidth > 769){
		$(".login-background img").width(window.innerWidth);
		$(".login-background img").height(window.innerWidth/1.5);
	}
	else{
		$(".login-background img").width(window.innerHeight*1.5);
		$(".login-background img").height(window.innerHeight);
	}
	$scope.logout = function(){
		AuthenticationService.Logout();
		$state.go('login');
	}
	$rootScope.setCurrentTag = function(tag){
		$rootScope.currentTag = $rootScope.searchItem = tag;
	}
	$rootScope.updateCurrentUser = function(){
		if(!$cookies.getObject('currentUser') || !$cookies.getObject('currentUser').username){
			AuthenticationService.Logout();
			$state.go('login');
			return false;
		}
		var username = $cookies.getObject('currentUser').username;
		return new Promise(function(resolve, reject){
			$http.get('/user/'+username).then(function(user){
				$rootScope.currentUser = user.data;
				resolve();
			}).catch(function(err){
				if(err){
					console.log(err);
					if(err.data = "Unauthorized"){
						$state.go('login');
					}
				}
			});
		});
		
	}
	$rootScope.prevPage = function(){
		$location.path($rootScope.prevURL);
	}
	$scope.scrollPos = {}; // scroll position of each view

	$(window).on('scroll', function() {
        if ($scope.okSaveScroll) { // false between $routeChangeStart and $routeChangeSuccess
        	$scope.scrollPos[$location.path()] = $(window).scrollTop();
            //console.log($scope.scrollPos);
        }
    });

	$scope.scrollClear = function(path) {
		$scope.scrollPos[path] = 0;
	}

	$scope.$on('$stateChangeStart', function() {
		$scope.okSaveScroll = false;
	});

	$scope.$on('$stateChangeSuccess', function() {
        $timeout(function() { // wait for DOM, then restore scroll position
        	$(window).scrollTop($scope.scrollPos[$location.path()] ? $scope.scrollPos[$location.path()] : 0);
        	$scope.okSaveScroll = true;
        }, 0);
    });
});