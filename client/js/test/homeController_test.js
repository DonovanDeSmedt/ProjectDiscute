describe('MainCtrl', function() {

  var Users;
  var $httpBackend;
  var posts;
  var userList = [
  {
    id: '1',
    name: 'Jane',
    role: 'Designer',
    location: 'New York',
    twitter: 'gijane'
  },
  {
    id: '2',
    name: 'Bob',
    role: 'Developer',
    location: 'New York',
    twitter: 'billybob'
  },
  {
    id: '3',
    name: 'Jim',
    role: 'Developer',
    location: 'Chicago',
    twitter: 'jimbo'
  },
  {
    id: '4',
    name: 'Bill',
    role: 'Designer',
    location: 'LA',
    twitter: 'dabill'
  }
  ];
  var singleUser = {
    id: '2',
    name: 'Bob',
    role: 'Developer',
    location: 'New York',
    twitter: 'billybob'
  };

  // Before each test load our api.users module
  beforeEach(angular.mock.module('api.users'));

  
  // Before each test set our injected Users factory (_Users_) to our local Users variable
  beforeEach(
    module(function($provide) {
      //Depencie van de resolve == mock object
      $provide.value('posts', {

        posts: [{id: "2385kdf2", title: "testpost"},{id: "2325kdf2", title: "testpost2"}],
        upvote: function(post){
          post.upvotes += 1;
        },
        create: function(post){
          this.posts.push(post);
        }
      });
    }));

   // beforeEach(inject(function($injector) {
   //      $httpBackend = $injector.get('$httpBackend');
   //      projectsResponse = [ {name:'Project 1'}, {name:'Project 2'} ];
   //      $httpBackend.when('GET', 'api/projects').respond(projectsResponse);

   //    }));
  beforeEach(inject(function(_$httpBackend_ , _Users_, _posts_) {
    Users = _Users_;
    $httpBackend = _$httpBackend_;
    posts = _posts_;
    $httpBackend.when('GET', 'posts').respond(200, posts.posts);
  }));

  // A simple test to verify the Users factory exists
  describe('Users', function() {
    it('should exist', function() {
      expect(Users).toBeDefined();
    });
  });
  


  describe('.all()', function() {
    // A simple test to verify the method all exists
    it('should exist', function() {
      expect(Users.all).toBeDefined();
    });

    it('should return a hard-coded list of users', function() {
      expect(Users.all()).toEqual(userList);
    });

  });

  describe('.findById()', function() {
    it('should exist', function() {
      expect(Users.findById).toBeDefined();
    });

    it('should return one user object if it exists', function() {
      expect(Users.findById('2')).toEqual(singleUser);
    });
    // A test to verify that calling findById() with an id that doesn't exist, in this case 'ABC', returns undefined
    it('should return undefined if the user cannot be found', function() {
      expect(Users.findById('ABC')).not.toBeDefined();
    });

  });
  
  describe('.getPosts()', function() {
    it('should find posts', function() {
      expect(Users.getPosts().length).toEqual(2);
    });
  });

  describe('Add new posts', function() {
    it("Add new post request", function() {
      console.log($httpBackend);
      $httpBackend
      .expectPOST('/posts', posts.posts)
      .respond(200);
      var succeeded;
      Users.add()
      .then(function () {
        succeeded = true;
      });
      $httpBackend.flush();
      expect(succeeded).toBe(true);
    })
  });


});


