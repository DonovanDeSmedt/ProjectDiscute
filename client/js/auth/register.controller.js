angular.module('discuteApp.auth').controller('RegisterController', function($scope, $state, $http, AuthenticationService){
	
	$scope.submitForm = function(form, user){	
		if(!form.$valid){
			return false;
		}	
		user.username = removeWhiteSpace(user.username);
		AuthenticationService.Register(user, function(result, data){
			if(result){
				AuthenticationService.Login(user.email, user.password, function(loginResult){
					if(loginResult){
						$state.go('home');
					}
				})
			}
			else{
				if(data === "email"){
					$scope.emailError = true;
					$scope.usernameError = false;
					$('#email').addClass('invalid');
					$('#username').removeClass('invalid');
				}
				if(data === "username"){
					$scope.usernameError = true;
					$scope.emailError = false;
					$('#email').removeClass('invalid');
					$('#username').addClass('invalid');
				}
		}});
	}
	var removeWhiteSpace = function(word) {
		word.trim();
		var index = word.indexOf(' ');
		if(index >= 0){
			word = word.replace(/ /g, '');
		}
  		return  word;
	}
});
