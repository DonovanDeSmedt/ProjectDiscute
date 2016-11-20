angular.module('discuteApp.service').factory('DModule', function($state, $http,$rootScope, AuthenticationService, $cookies){ 
  return (function(){

    let discutes;
    const _homeData = function(index){
      return $rootScope.updateCurrentUser().then(function(){
        return $http.get('/api/'+$rootScope.currentUser.username+'/'+index).then(function(data){
          return data.data.discutes;
        }).catch(function(err){
          console.log(err)
        });
      }).catch(function(err){
        console.log(err);
      });
    }
    const _worldData = function(index){
      return $rootScope.updateCurrentUser().then(function(){
        return $http.get('/api/'+index).then(function(data){
          return data.data.discutes;
        });
      }).catch(function(err){
        console.log(err);
      });
    }
    const getDiscutes = function(){
      return _homeData(0);
    }
    const getGeneralDiscutes = function(){
      return _worldData(0);
    }
    const getDiscuteById = function(id){
      return $rootScope.updateCurrentUser().then(function(){
        return $http.get('/api/discute/findById/'+id).then(function(data){
          return data.data.discute[0];
        });
      }).catch(function(err){
        console.log(err);
      });
    }

    const deleteDiscute = function(discute){
      if(discute.author === $rootScope.currentUser.username){
        $http.delete('/api/'+discute._id).then(function(data){

        }).catch(function(err){
          console.log(err);
        });
      }
    }
    const addDiscute = function(discute){
      discutes.push(discute);
    }

    const addComment = function(comment, side, discute, username){
      $http.put('/api/comment/'+discute._id, {user: username, comment: comment, side: side})
      .then(function(data){
          _updateDiscute(discute, data.data.left, data.data.right);
      })
      .catch(function(err){
          console.log(err);
          AuthenticationService.Logout();
          $state.go('login');
      });
   }

   const vote = function(side, discute, username){
    $http.put('/api/vote/'+discute._id, {user: username, side: side})
    .then(function(data){
        _updateDiscute(discute, data.data.left, data.data.right);
    })
    .catch(function(err){
        console.log(err);
        AuthenticationService.Logout();
        $state.go('login');
    });
  }

  const deleteComment = function(side, comment, indexComment, discute, username){
    if(comment.name === username){
      let id;
      if(side === 'left'){
        id = discute.left.comments[indexComment]._id;
      }
      if(side === 'right'){
        id = discute.right.comments[indexComment]._id;
      }
      $http.put('/api/uncomment/'+discute._id, {side: side, id: id})
      .then(function(data){
          _updateDiscute(discute, data.data.left, data.data.right);
      })
      .catch(function(err){
          console.log(err);
          AuthenticationService.Logout();
          $state.go('login');
      });
    }
  }
  const _updateDiscute = function(discute, left, right){
    discute.right.votes = right.votes;
    discute.right.comments = right.comments;
    discute.left.votes = left.votes;
    discute.left.comments = left.comments;
  }
  const search = function(name, array){
    const index =  array === null? 0 : Math.floor(_calculateLenghtDiscutes(array) / 21);
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
  const searchTag = function(name, array){
    const index =  array === null? 0 : Math.floor(_calculateLenghtDiscutes(array) / 21);
    return new Promise(function(resolve, reject){
      $http.get('/api/tag/'+name+'/'+index).then(function(data){
        discutes = data.data.discutes;
        resolve(discutes);
      });
    });
  }
  const tagAndOrder = function(name, sort, array){
    const index =  Math.floor(_calculateLenghtDiscutes(array) / 21);
    return new Promise(function(resolve, reject){
      $http.get('/api/tagAndOrder/'+name.slice(1)+'/'+sort+'/'+index).then(function(data){
        discutes = data.data.discutes;
        resolve(discutes);
      });
    });
  }
  const orderBy = function(sort, array){
    const index =  Math.floor(_calculateLenghtDiscutes(array) / 21); 
    return new Promise(function(resolve, reject){
      $http.get('/api/orderby/'+sort+'/'+index).then(function(data){
        discutes = data.data.discutes;
        resolve(discutes);
      }).catch(function(err){
        console.log(err);
      });
    });
  }
  const searchAndOrder = function(search, sort, array){
    const index =  Math.floor(_calculateLenghtDiscutes(array) / 21);
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

  const loadMore = function(sort, array, isOrdered, order, searchTerm){
    let index;
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
  const _calculateLenghtDiscutes = function(discutes){
    let length = 0;
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
    addComment : addComment,
    vote: vote,
    deleteComment: deleteComment,
    orderBy: orderBy,
    search: search,
    searchTag: searchTag,
    searchAndOrder: searchAndOrder,
    tagAndOrder: tagAndOrder,
    loadMore: loadMore
  }

})();
});