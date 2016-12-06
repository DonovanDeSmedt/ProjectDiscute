'use strict';

angular.module('discuteApp.directive', []).directive('passwordValidator', function () {
  return {
    require: 'ngModel',
    link: function link(scope, elm, attrs, ctl) {
      scope.$watch(attrs['passwordValidator'], function (errorMsg) {
        elm[0].setCustomValidity(errorMsg);
        ctl.$setValidity('passwordValidator', errorMsg ? true : false);
      });
    }
  };
}).directive('discuteHeader', function () {
  return {
    restrict: 'AE',
    replace: true,
    templateUrl: 'js/directives/header.html'
  };
}).directive('loginBackground', function () {
  return {
    restrict: 'AE',
    replace: true,
    templateUrl: 'js/directives/loginBackground.html',
    controller: 'GlobalController'
  };
}).directive('ngEnter', function () {
  return function (scope, element, attrs) {
    element.bind("keydown keypress", function (event) {
      if (event.which === 13) {
        scope.$apply(function () {
          scope.$eval(attrs.ngEnter, { 'event': event });
        });

        event.preventDefault();
      }
    });
  };
}).directive('iosDblclick', function () {

  var DblClickInterval = 300; //milliseconds

  var firstClickTime;
  var waitingSecondClick = false;

  return {
    restrict: 'A',
    link: function link(scope, element, attrs) {
      element.bind('click', function (e) {

        if (!waitingSecondClick) {
          firstClickTime = new Date().getTime();
          waitingSecondClick = true;

          setTimeout(function () {
            waitingSecondClick = false;
          }, DblClickInterval);
        } else {
          waitingSecondClick = false;

          var time = new Date().getTime();
          if (time - firstClickTime < DblClickInterval) {
            scope.$apply(attrs.iosDblclick);
          }
        }
      });
    }
  };
});;
