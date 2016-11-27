describe('HomeController', function() {

  var DModule, data;
  var $httpBacken, $state, $cookies, $scope, controller;
  

  // Before each test load our api.users module
  beforeEach(module('ui.router'));
  // beforeEach(angular.mock.module('discuteApp.service'));
  beforeEach(module('discuteApp'));
  beforeEach(module('discuteApp.home'));

  
  

   // beforeEach(inject(function($injector) {
   //      $httpBackend = $injector.get('$httpBackend');
   //      projectsResponse = [ {name:'Project 1'}, {name:'Project 2'} ];
   //      $httpBackend.when('GET', 'api/projects').respond(projectsResponse);

   //    }));
  beforeEach(inject(function($controller, _$rootScope_) {
    // DModule = _DModule_;
    // $httpBackend = _$httpBackend_;
    // $state = _$state_;
    // $cookies = _$cookies_;
    $scope = _$rootScope_.$new();
    controller = $controller('HomeController', {
      $scope: $scope
    });
    /*Routes*/
    // $httpBackend.when('GET', '/api/donovan/0').respond(200, discutes);


  }));

  // Before each test set our injected Users factory (_Users_) to our local Users variable
  // beforeEach(
  //   module(function($provide) {
  //     //Depencie van de resolve == mock object
  //     $provide.value('AuthenticationService', {
  //         logout: function(){
  //           return true
  //         }
  //       });
  //     }));
  
  // A simple test to verify the Users factory exists
  describe('DModule', function() {
    it('DModule should exist', function() {
      console.log("Do");
      expect(2+2).toEqual(4);
    });
  });


  // describe('Read json file', function() {
  //   it("should load a fixture", function () {
  //       discute = readJSON('client/js/test/discutes.json');
  //   })

    
  // });
  

  


});


