var app = angular.module("forumApp");

app.factory("QuestionFactory", ["$http", "$q", "CacheService", function($http, $q, CacheService){
	var questionAPIs = {};
	
	questionAPIs.getQuestions = function(){
		var deferred = $q.defer();
		var config = {
				method: "GET",
				url: CacheService.server.url + "/questions"
		}
		$http(config)
		.then(function(response){
			// success
			deferred.resolve(response);
		}, function(response){
			// failure
			deferred.reject(response);
		});
		return deferred.promise;
	};

	questionAPIs.addQuestion = function(ques){
		var deferred = $q.defer();
		var config = {
				method: "POST",
				data: ques,
				url: CacheService.server.url + "/questions"
		}
		$http(config)
		.then(function(response){
			// success
			deferred.resolve(response);
		}, function(response){
			// failure
			deferred.reject(response);
		});
		return deferred.promise;
	};

	questionAPIs.likeQuestion = function(quesLike){
		var deferred = $q.defer();
		var config = {
				method: "POST",
				data: quesLike,
				url: CacheService.server.url + "/questions/" + quesLike.quesId + "/like"
		}
		$http(config)
		.then(function(response){
			// success
			deferred.resolve(response);
		}, function(response){
			// failure
			deferred.reject(response);
		});
		return deferred.promise;
	};
	
	questionAPIs.getLikedQuestions = function(userId){
		var deferred = $q.defer();
		var config = {
				method: "GET",
				url: CacheService.server.url + "/questions/" + userId + "/likes"
		}
		$http(config)
		.then(function(response){
			// success
			deferred.resolve(response);
		}, function(response){
			// failure
			deferred.reject(response);
		});
		return deferred.promise;
	};
	
	return questionAPIs;
}]);