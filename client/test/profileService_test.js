describe('HomeController', function() {

  var ProfileService, data;
  var $httpBackend, $state, $cookies, $scope, controller;
  var users;

  beforeEach(module('ui.router'));
  beforeEach(angular.mock.module('discuteApp.service'));

  

  beforeEach(inject(function(_$httpBackend_, _ProfileService_) {
    $httpBackend = _$httpBackend_;
    ProfileService = _ProfileService_;
    users = readJSON('client/test/users.json');

    $httpBackend.when('GET', '/user/donovan').respond(200, users);
  }));

 

  describe('User', function() {
    it('getUser should return User object', function() {
      
      ProfileService.getUser("donovan").then(function(data) {
          expect(data.data).toEqual(users);
      });
      $httpBackend.flush();
    });
  });





  


});


