var app = angular.module('billboardNews', ['ui.router']);

app.config([
'$stateProvider',
'$urlRouterProvider',
function($stateProvider, $urlRouterProvider) {

  $stateProvider
    .state('home', {
      url: '/home',
      templateUrl: '/home.html',
      controller: 'MainCtrl',
      resolve: {
    postPromise: ['posts', function(posts){
      return posts.getAll();
    }]
  }
    })  
   .state('posts', {
      url: '/posts/{id}',
      templateUrl: '/posts.html',
      controller: 'PostsCtrl',
      resolve: {
    post: ['$stateParams', 'posts', function($stateParams, posts) {
      return posts.get($stateParams.id);
    }]
  }
    });

  $urlRouterProvider.otherwise('home');
}]);

app.controller('PostsCtrl', [
'$scope',
'posts',
'post',
function($scope, posts, post){
  $scope.post = post;

$scope.addComment = function(){
  if($scope.body === '') { return; }
  posts.addComment(post._id, {
    body: $scope.body,
    author: $scope.author,
  }).success(function(comment) {
    $scope.post.comments.push(comment);
  });
  $scope.body = '';
};


}]);

app.factory('posts', ['$http', function($http){
   // service body
  var o = {
    posts: []
  };

  o.getAll = function() {
    return $http.get('/posts').success(function(data){
      angular.copy(data, o.posts);
    });
  };

  o.create = function(post) {
  return $http.post('/posts', post).success(function(data){
    o.posts.push(data);
    });
  };

o.like = function(post) {
  return $http.put('/posts/' + post._id + '/like')
    .success(function(data){
      post.likes += 1;
    });
};

o.get = function(id) {
  return $http.get('/posts/' + id).then(function(res){
    return res.data;
  });
};

o.addComment = function(id, comment) {
  return $http.post('/posts/' + id + '/comments', comment);
};

  return o;
}])

app.controller('MainCtrl', [
'$scope',
'posts',
function($scope, posts){
  $scope.test = 'Hello world!';

  $scope.posts = posts.posts;

$scope.addPost = function(){
  if(!$scope.title || $scope.title === '') { return; }
  posts.create({
    title: $scope.title,
    link: $scope.link,
    likes: 0
  });
  $scope.title = '';
  $scope.link = '';
};
  
$scope.incrementLikes = function(post) {
  posts.like(post);
};

}]);
