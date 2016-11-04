angular.module('discuteApp.auth').controller('LoginController', function($scope,$rootScope, $state, $http, AuthenticationService){
	$http.get('/login').then(function(data){
	}).catch(function(err){
		console.log(err);
	});
	$(".login-background").show();
	$scope.submitLoginForm = function(user){
		if(angular.isUndefined(user) || user === null ){
			$scope.errorMessage = "Email or password incorrect";
			return false;
		}
		AuthenticationService.Login(user.email, user.password, function(result){
			if(result ===  true){
				$state.go('home');
			}
			else{
				$scope.errorMessage = "Email or password incorrect";
			}
		})
	}
	
});