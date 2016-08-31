angular.module('discuteApp').controller('HomeController', function($scope,$rootScope,$cookies, $state,$location, $http, AuthenticationService, _, Discute, DModule, Upload, data){
	$scope.app = "Zever";
	// Setting 
	autosize($('textarea'));
	$scope.discutes = data;
	// Functions
	$scope.logout = function(){
		AuthenticationService.Logout();
		$state.go('login');
	}
	$(".dropdown-menu li a").click(function(){
		$(".dropdown-toggle").text($(this).text());
		$(".dropdown-toggle").append($("<span>").addClass('caret'));

	});
	if($location.path().indexOf("search") < 0 && $rootScope.searchItem !== null){
		$rootScope.searchItem = null;
	}
	$scope.comment = function(comment, side, discute){
		checkAvailability();
		var index = $scope.discutes.indexOf(discute);
		DModule.add_comment(comment, side, discute, $rootScope.currentUser.username);
		if(index === -1){
			if(side === 'right'){
				$rootScope.currentDiscute.right.comment = "";
			}
			if(side === 'left'){
				$rootScope.currentDiscute.left.comment = "";
			}
		}
		else{
			if(side === 'right'){
				$scope.discutes[index].right.comment = "";
				$scope.visible_right = true;
			}
			if(side === 'left'){
				$scope.discutes[index].left.comment = "";
				$scope.visible_left = true;
			}
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
	$scope.order = function(sort){
		$scope.isOrderedList = true;
		$scope.orderType = sort;
		// Case tag
		if(!angular.isUndefined($rootScope.currentTag) && $rootScope.currentTag !== null){
			DModule.tagAndOrder($rootScope.currentTag, sort, $scope.discutes).then(function(discutes){
				$scope.discutes = $rootScope.splitArray(discutes);
				$scope.$apply();
			});
		}
		// Case search
		else if(!angular.isUndefined($scope.searchDiscutes) && $scope.searchDiscutes !== null){
			DModule.searchAndOrder($scope.searchTerm, sort, $scope.searchDiscutes).then(function(discutes){
				$scope.searchDiscutes = $rootScope.splitArray(discutes);
				$scope.$apply();
			});
		}
		// Case world
		else{
			DModule.orderBy(sort, $scope.discutes).then(function(discutes){
				$scope.discutes = $rootScope.splitArray(discutes);
				$scope.$apply();
			});
		}
	}
	$scope.search = function(){
		$rootScope.prevURL = $location.path();
		DModule.search($scope.searchTerm, null).then(function(discutes){
			initDropDown();
			$scope.searchDiscutes = $rootScope.splitArray(discutes);
			$rootScope.searchItem = $scope.searchTerm;
			$scope.$apply();
		})
	}
	$scope.closeSearch = function(){
		if(!angular.isUndefined($rootScope.currentTag) && $rootScope.currentTag !== null){
			$rootScope.currentTag = null;
			$location.path($rootScope.prevURL);
		}	
		$scope.searchDiscutes = $rootScope.searchItem = $scope.searchTerm = null;
		initDropDown();
	}
	$scope.loadMore = function(sort, array){
		DModule.loadMore(sort, array, $scope.isOrderedList, $scope.orderType, $rootScope.searchItem).then(function(discutes){
			switch(sort){
				case 'home': {
					discutes.forEach(function(discute, index){
						$scope.discutes.push(discute);
					});
					break;
				}
				case 'tag': case 'world' :{
					complementDiscutes($scope.discutes, discutes);
					break;
				}
				case 'search': {
					complementDiscutes($scope.searchDiscutes, discutes);
					break;
				}
			}
			$scope.$apply();
		});
	}
	complementDiscutes = function(dest, array){
		while(dest[dest.length - 1].length < 3 && array.length > 0){
			dest[dest.length - 1].push(array.splice(0,1)[0]);
		}
		if(array.length > 0){
			splitArray(array).forEach(function(arr, index){
				dest[dest.length + index] = (arr);
			});
		}
	}
	initDropDown = function(){
		$(".dropdown-toggle").text('Best Rated');
		$(".dropdown-toggle").append($("<span>").addClass('caret'));
	}
	checkAvailability = function(){
		if(!$cookies.getObject('currentUser') || !$cookies.getObject('currentUser').username || !$rootScope.currentUser || !$rootScope.currentUser.username){
			console.log('HomeController');
			AuthenticationService.Logout();
			$state.go('login');
		}
	}
	$rootScope.updateCurrentUser();
});