describe('MainCtrl', function() {
  var scope, $state, createController;

  beforeEach(module('discuteApp')); //<--- Hook module

  beforeEach(inject(function ($rootScope, $controller) {
    scope = $rootScope.$new();

    createController = function() {
      return $controller('test', {
        '$scope': scope
      });
    };
  }));

  it('should make 3 as current step', function() {
    var controller = createController();
    expect(scope.isBigStep()).toBe(true);
  });
});