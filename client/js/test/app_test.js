describe('Controller', function(){
	var $controller, $scope, $httpBackend, $http, $location, $rootScope, $cookies, $state, data, DModule, AuthenticationService;

	beforeEach(function(){
		module('discuteApp');
		module(function($provide) {
			//Depencie van de resolve == mock object
			$provide.value('posts', {

				posts: [{id: "2385kdf2", title: "testpost"}],
				upvote: function(post){
					post.upvotes += 1;
				},
				create: function(post){
					this.posts.push(post);
				}
			});
		});
		inject(function(_$rootScope_){
			$scope = _$rootScope_.$new();
			$rootScope = _$rootScope_;
		});
		inject(function(_$controller_){
			$controller = _$controller_;
		});
		
		inject(function(_$cookies_){
			$cookies = _$cookies_;
		});
		inject(function(_$state_){
			$state = _$state_;
		});
		inject(function(_AuthenticationService_){
			AuthenticationService = _AuthenticationService_;
		});
		inject(function(_DModule_){
			DModule = _DModule_;
		});
		inject(function(_$location_){
			$location = _$location_;
		});


		// Overschrijft de actie van een bepaalde url
		inject(function(_$httpBackend_){
			$httpBackend = _$httpBackend_;
			$httpBackend.when('GET', 'http://localhost/test').respond(200, {name: "rudy"});
			$httpBackend.whenRoute('GET', '/posts/:post/upvote').respond(function(method, url, data, headers, params){
				//var post = params.posts;
			});

			//GELIJK 

			$httpBackend.when('GET', /\/posts\/.+/).respond(function(method, url, data, headers){
				// wanner er in een regex haakjes zet, zal hij de string opsplitsen.
				var args = url.match(/\/posts\/(.+)/);
				// de variabelen posts zal opgevuld worden doordat de inject het posts object set
				for (i in posts){
					if (posts[id].id === args[1]){
						return [200, {post: posts[i]}];
					}
				}
				//return [200, {id: args[1]}];
				return [400, {}];
			});

			// Verwacht dat deze url 1 keer opgeroepen worden in deze volgorde
			$httpBackend.expect('GET', 'http://post/1');
			$httpBackend.expect('GET', 'http://post/2');
			$httpBackend.expect('GET', 'http://post/3');

		});
		inject(function(_$http_){
			$http = _$http_
		});
		// Dit doen we om access te krijgen tot de posts in de $provide.value;
		// inject(function(_posts){
		// 	posts = _posts_.posts;
		// });
	});
	// afterEach(function(){
	// 	$httpBackend.verifyNoOutStandingExpectation();
	// 	$httpBackend.verifyNoOutStandingRequest();
	// });
	it("module", function(){
		// var ctrl = $controller('HomeController', {'$scope': $scope});
		var ctrl = $controller('HomeController', {$scope: $scope, $rootScope: $rootScope, $cookies: $cookies, $state: $state, $http: $http, $location: $location, AuthenticationService: AuthenticationService, DModule: DModule, data: {data: "hi"}});
		$scope.vote('left', {id: 1});
		var post = {title: 'test', upvotes: 4};
		$scope.incrementUpvotes(post);
		expect(post.upvotes).toBe(5);

		var nrPosts = $scope.posts.length();
		$scope.title = 'google';
		$scope.link = 'google';
		$scope.addPost();
		
		expect($scope.posts.length).toBe(nrPosts + 1);
		$http.get('http://localhost/test').success(function(data, status, header, config){
			$scope.valid = true;
			$scope.name = data.name;
		});

		$http.get('/posts/2385kdf2').success(function(data, status, header, config){
			$scope.postid = data.id;
		});

		// Pas na de flush wordt de request uitgevoerd
		$httpBackend().flush();
		expect($scope.valid).toBe(true);
		expect($scope.name).toEqual('rudy');

		expect($scope.post.postid).toEqual('2385kdf2');


		$httpBackend().flush();
	});
});