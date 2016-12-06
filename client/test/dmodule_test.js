describe('HomeController', function() {

  var DModule, data;
  var $httpBackend, $state, $cookies, $scope, controller;
  var auth, discutes;

  beforeEach(module('ui.router'));
  beforeEach(angular.mock.module('discuteApp.service'));

  

  beforeEach(
    module(function($provide) {
      //Depencie van de resolve == mock object
      $provide.value('AuthenticationService', {
          logout: function(){
            return true
          }
        });
      }));


  beforeEach(inject(function(_$httpBackend_, _DModule_, _AuthenticationService_) {
    $httpBackend = _$httpBackend_;
    DModule = _DModule_;
    auth = _AuthenticationService_;
    discutes = readJSON('client/test/discutes.json');

    $httpBackend.when('PUT', '/discute/comment/'+discutes[0]._id).respond(200, discutes[1]);
    $httpBackend.when('PUT', '/discute/uncomment/'+discutes[1]._id).respond(200, discutes[0]);
    $httpBackend.when('GET', '/search/gent/0').respond(200, {discutes: discutes});

  }));




  describe('Comment', function() {
    it('add comment should increase comments with one', function() {

      expect(discutes[0].left.comments.length).toEqual(0); 
      
      
      DModule.addComment('no comment', 'Left',discutes[0] ,'james').then(function(data) {
        expect(data.left.comments.length).toEqual(1);
      });
      $httpBackend.flush();
    });

    it('remove comment should increase comments with one', function() {

      expect(discutes[1].left.comments.length).toEqual(1); 
      
      DModule.deleteComment('left', discutes[1].left.comments[0], 0 ,discutes[1] ,'james').then(function(data) {
        expect(data.left.comments.length).toEqual(0);
      });
      $httpBackend.flush();
    });
  });

  describe('Search', function() {
    it('search for discute with name GENT should return discute KAA GENT', function() {
    
        DModule.search('gent', null).then(function(data) {
            console.log(data);
            expect(data.length).toEqual(1);
        });
        $httpBackend.flush();
    })
  })

  


});


