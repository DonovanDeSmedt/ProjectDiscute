'use strict';

(function () {
  'use strict';

  angular.module('discuteApp.service').factory('DModule', ['$state', '$http', '$rootScope', 'AuthenticationService', '$cookies', dModule]);
  function dModule($state, $http, $rootScope, AuthenticationService, $cookies) {
    return function () {

      var discutes = void 0;
      var _homeData = function _homeData(index) {
        return $rootScope.updateCurrentUser().then(function () {
          return $http.get('/discute/' + $rootScope.currentUser.username + '/' + index).then(function (data) {
            return data.data.discutes;
          }).catch(function (err) {
            console.log(err);
          });
        }).catch(function (err) {
          console.log(err);
        });
      };
      var _worldData = function _worldData(index) {
        return $rootScope.updateCurrentUser().then(function () {
          return $http.get('/discute/' + index).then(function (data) {
            return data.data.discutes;
          });
        }).catch(function (err) {
          console.log(err);
        });
      };
      var getDiscutes = function getDiscutes() {
        return _homeData(0);
      };
      var getGeneralDiscutes = function getGeneralDiscutes() {
        return _worldData(0);
      };
      var getDiscuteById = function getDiscuteById(id) {
        return $rootScope.updateCurrentUser().then(function () {
          return $http.get('/discute/findBy/id/' + id).then(function (data) {
            return data.data.discute[0];
          });
        });
      };

      var deleteDiscute = function deleteDiscute(discute) {
        if (discute.author === $rootScope.currentUser.username) {
          $http.delete('/discute/' + discute._id).then(function (data) {}).catch(function (err) {
            console.log(err);
          });
        }
      };
      var addDiscute = function addDiscute(discute) {
        discutes.push(discute);
      };

      var addComment = function addComment(comment, side, discute, username) {
        return $http.put('/discute/comment/' + discute._id, { user: username, comment: comment, side: side }).then(function (data) {
          _updateDiscute(discute, data.data.left, data.data.right);
          return discute;
        }).catch(function (err) {
          console.log(err);
          AuthenticationService.Logout();
          $state.go('login');
        });
      };

      var vote = function vote(side, discute, username) {
        $http.put('/discute/vote/' + discute._id, { user: username, side: side }).then(function (data) {
          _updateDiscute(discute, data.data.left, data.data.right);
        }).catch(function (err) {
          console.log(err);
          AuthenticationService.Logout();
          $state.go('login');
        });
      };

      var deleteComment = function deleteComment(side, comment, indexComment, discute, username) {
        if (comment.name === username) {
          var id = void 0;
          if (side === 'left') {
            id = discute.left.comments[indexComment]._id;
          }
          if (side === 'right') {
            id = discute.right.comments[indexComment]._id;
          }
          return $http.put('/discute/uncomment/' + discute._id, { side: side, id: id }).then(function (data) {
            _updateDiscute(discute, data.data.left, data.data.right);
            return discute;
          }).catch(function (err) {
            console.log(err);
            AuthenticationService.Logout();
            $state.go('login');
          });
        }
      };
      var _updateDiscute = function _updateDiscute(discute, left, right) {
        discute.right.votes = right.votes;
        discute.right.comments = right.comments;
        discute.left.votes = left.votes;
        discute.left.comments = left.comments;
      };
      var search = function search(name, array) {
        var index = array === null ? 0 : Math.floor(_calculateLenghtDiscutes(array) / 21);
        if (name[0] === '#') {
          return searchTag(name.slice(1), null);
        } else {
          return new Promise(function (resolve, reject) {
            $http.get('/search/' + name.trim() + '/' + index).then(function (data) {
              discutes = data.data.discutes;
              resolve(discutes);
            });
          });
        }
      };
      var searchTag = function searchTag(name, array) {
        var index = array === null ? 0 : Math.floor(_calculateLenghtDiscutes(array) / 21);
        return new Promise(function (resolve, reject) {
          $http.get('/search/tag/' + name + '/' + index).then(function (data) {
            discutes = data.data.discutes;
            resolve(discutes);
          });
        });
      };
      var tagAndOrder = function tagAndOrder(name, sort, array) {
        var index = Math.floor(_calculateLenghtDiscutes(array) / 21);
        return new Promise(function (resolve, reject) {
          $http.get('/search/tagAndOrder/' + name.slice(1) + '/' + sort + '/' + index).then(function (data) {
            discutes = data.data.discutes;
            resolve(discutes);
          });
        });
      };
      var orderBy = function orderBy(sort, array) {
        var index = Math.floor(_calculateLenghtDiscutes(array) / 21);
        return new Promise(function (resolve, reject) {
          $http.get('/search/orderby/' + sort + '/' + index).then(function (data) {
            discutes = data.data.discutes;
            resolve(discutes);
          }).catch(function (err) {
            console.log(err);
          });
        });
      };
      var searchAndOrder = function searchAndOrder(search, sort, array) {
        var index = Math.floor(_calculateLenghtDiscutes(array) / 21);
        if (search[0] === '#') {
          return tagAndOrder(search, sort, array);
        } else {
          return new Promise(function (resolve, reject) {
            $http.get('/search/searchAndOrder/' + search + '/' + sort + '/' + index).then(function (data) {
              discutes = data.data.discutes;
              resolve(discutes);
            }).catch(function (err) {
              console.log(err);
            });
          });
        }
      };

      var loadMore = function loadMore(sort, array, isOrdered, order, searchTerm) {
        var index = void 0;
        switch (sort.toLowerCase()) {
          case 'home':
            {
              index = Math.floor(array.length / 12);
              return _homeData(index);
            }
          case 'world':
            {
              index = Math.floor(_calculateLenghtDiscutes(array) / 21);
              return angular.isUndefined(isOrdered) || !isOrdered ? _worldData(index) : orderby(order, array);
            }
          case 'search':
            {
              return angular.isUndefined(isOrdered) || !isOrdered ? search(searchTerm, array) : searchAndOrder(searchTerm, order, array);
            }
          case 'tag':
            {
              index = Math.floor(_calculateLenghtDiscutes(array) / 21);
              return angular.isUndefined(isOrdered) || !isOrdered ? searchTag(searchTerm.slice(1), array) : tagAndOrder(searchTerm, order, array);
            }
        }
      };
      var _calculateLenghtDiscutes = function _calculateLenghtDiscutes(discutes) {
        var length = 0;
        discutes.forEach(function (array, index) {
          length += array.length;
        });
        return length;
      };

      return {
        getDiscutes: getDiscutes,
        getGeneralDiscutes: getGeneralDiscutes,
        getDiscuteById: getDiscuteById,
        deleteDiscute: deleteDiscute,
        addComment: addComment,
        vote: vote,
        deleteComment: deleteComment,
        orderBy: orderBy,
        search: search,
        searchTag: searchTag,
        searchAndOrder: searchAndOrder,
        tagAndOrder: tagAndOrder,
        loadMore: loadMore
      };
    }();
  };
})();
