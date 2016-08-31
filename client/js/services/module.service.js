angular.module('discuteApp.services').factory('Discute', function($resource){ 
  return $resource('/discute/:id', { id: '@_id' }, {
    update: {
      method: 'PUT' 
    }
  });
}).factory('DModule', function(Discute, $state, $http,$rootScope, AuthenticationService, $cookies){ 
  return (function(){

    var discutes;
    var _homeData = function(index){
      return $rootScope.updateCurrentUser().then(function(){
        return new Promise(function(resolve, reject){
          $http.get('/api/'+$rootScope.currentUser.username+'/'+index).then(function(data){
            discutes = data.data.discutes;
            resolve(discutes);
          }).catch(function(err){console.log(err)});
        });

      }).catch(function(err){
        console.log(err);
      });
    }
    var _worldData = function(index){
      return $rootScope.updateCurrentUser().then(function(){
        return new Promise(function(resolve, reject){
          $http.get('/api/'+index).then(function(data){
            discutes = data.data.discutes;
            resolve(discutes);
          });
        });

      }).catch(function(err){
        console.log(err);
      });
    }
    var getDiscutes = function(){
      return _homeData(0);
    }
    var getGeneralDiscutes = function(){
      return _worldData(0);
    }
    var getDiscuteById = function(id){
      return $rootScope.updateCurrentUser().then(function(){
        return new Promise(function(resolve, reject){
          $http.get('/api/discute/findById/'+id).then(function(data){
            discutes = data.data.discute[0];
            resolve(discutes);
          });
        });

      }).catch(function(err){
        console.log(err);
      });
    }

    var deleteDiscute = function(discute){
      if(discute.author === $rootScope.currentUser.username){
        $http.delete('/api/'+discute._id).then(function(data){

        }).catch(function(err){
          console.log(err);
        });
      }
    }
    var addDiscute = function(discute){
      discutes.push(discute);
    }

    var add_comment = function( comment, side, discute, username){
      var newComment = {name: username, comment: comment};
      if(side === 'right'){
       discute.right.comments.push(newComment);
     }
     if(side === 'left'){
       discute.left.comments.push(newComment);
     }
     _update_discute(discute);
   }

   var vote = function(side, discute, username){
    var indexLeft = discute.left.votes.indexOf(username);
    var indexRight = discute.right.votes.indexOf(username);

    if(side === 'right'){
      if(indexRight < 0){
        discute.right.votes.push(username)
            //Als zowel rechts als links gevoted werd zal de vorige vote geannuleerd worden
            if(indexLeft > -1)
              discute.left.votes.splice(indexLeft, 1); 
          }
          else{
            discute.right.votes.splice(indexRight, 1); 
          } 
        }
        
        if(side === 'left'){
          if(indexLeft < 0){
            discute.left.votes.push(username)
            if(indexRight > -1)
              discute.right.votes.splice(indexRight, 1); 
          }
          else{
            discute.left.votes.splice(indexLeft, 1);	
          }
        }
        _update_discute(discute);
      }

      var delete_comment = function(side, comment, indexComment, discute, username){
        if(comment.name === username){
          if(side === 'right'){
            discute.right.comments.splice(indexComment, 1);	
          }
          if(side === 'left'){
            discute.left.comments.splice(indexComment, 1);	
          }
          _update_discute(discute);
        }
      }

      var _update_discute = function(discute){
        $http.put('/api/new/discute/'+discute._id, discute).then(function(data){

        }).catch(function(err){
          console.log(err);
          AuthenticationService.Logout();
          $state.go('login');
        });
      }
      var search = function(name, array){
        var index =  array === null? 0 : Math.floor(_calculateLenghtDiscutes(array) / 21);
        if(name[0] === '#'){
          return searchTag(name.slice(1), null);
        }
        else{
          return new Promise(function(resolve, reject){
            $http.get('/api/search/'+name.trim()+'/'+index).then(function(data){
              discutes = data.data.discutes;
              resolve(discutes);
            });
          });
        }
      }
      var searchTag = function(name, array){
        var index =  array === null? 0 : Math.floor(_calculateLenghtDiscutes(array) / 21);
        return new Promise(function(resolve, reject){
          $http.get('/api/tag/'+name+'/'+index).then(function(data){
            discutes = data.data.discutes;
            resolve(discutes);
          });
        });
      }
      var tagAndOrder = function(name, sort, array){
        var index =  Math.floor(_calculateLenghtDiscutes(array) / 21);
        return new Promise(function(resolve, reject){
          $http.get('/api/tagAndOrder/'+name.slice(1)+'/'+sort+'/'+index).then(function(data){
            discutes = data.data.discutes;
            resolve(discutes);
          });
        });
      }
      var orderBy = function(sort, array){
        var index =  Math.floor(_calculateLenghtDiscutes(array) / 21); 
        return new Promise(function(resolve, reject){
          $http.get('/api/orderby/'+sort+'/'+index).then(function(data){
            discutes = data.data.discutes;
            resolve(discutes);
          }).catch(function(err){
            console.log(err);
          });
        });
      }
      var searchAndOrder = function(search, sort, array){
        var index =  Math.floor(_calculateLenghtDiscutes(array) / 21);
        if(search[0] === '#'){
          return tagAndOrder(search, sort, array);
        }
        else{
          return new Promise(function(resolve, reject){
            $http.get('/api/searchAndOrder/'+search+'/'+sort+'/'+index).then(function(data){
              discutes = data.data.discutes;
              resolve(discutes);
            }).catch(function(err){
              console.log(err);
            });
          });
        }
      }

      var loadMore = function(sort, array, isOrdered, order, searchTerm){
        var index;
        switch(sort.toLowerCase()){
          case 'home': {
            index = Math.floor(array.length / 12);
            return _homeData(index);
          }
          case 'world': {
            index = Math.floor(_calculateLenghtDiscutes(array) / 21);
            return (angular.isUndefined(isOrdered) || !isOrdered) ?  _worldData(index): orderby(order, array);
          }
          case 'search': {
            return (angular.isUndefined(isOrdered) || !isOrdered) ? search(searchTerm, array): searchAndOrder(searchTerm, order, array);
          }
          case 'tag': {
            index = Math.floor(_calculateLenghtDiscutes(array) / 21);
            return (angular.isUndefined(isOrdered) || !isOrdered) ? searchTag(searchTerm.slice(1), array): tagAndOrder(searchTerm, order, array);
          }
        }
      }
      var _calculateLenghtDiscutes = function(discutes){
        var length = 0;
        discutes.forEach(function(array, index){
          length += array.length;
        })
        return length;
      }

      return {
        getDiscutes: getDiscutes,
        getGeneralDiscutes: getGeneralDiscutes,
        getDiscuteById: getDiscuteById,
        deleteDiscute: deleteDiscute,
        add_comment : add_comment,
        vote: vote,
        delete_comment: delete_comment,
        orderBy: orderBy,
        search: search,
        searchTag: searchTag,
        searchAndOrder: searchAndOrder,
        tagAndOrder: tagAndOrder,
        loadMore: loadMore
      }

    })();
  });