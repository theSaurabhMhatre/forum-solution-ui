var app = angular.module("forumApp");

app.factory("QuestionFactory", ["$http", "$q", "CacheService", function ($http, $q, CacheService) {

	var questionAPIs = {};

	questionAPIs.getQuestion = function (quesId) {
		var deferred = $q.defer();
		var config = {
			method: "GET",
			url: CacheService.server.url + "/questions/" + quesId,
			headers: {
				"Authorization": "Basic " + CacheService.common.token
			}
		}
		$http(config)
			.then(function (response) {
				// success
				deferred.resolve(response);
			}, function (response) {
				// failure
				deferred.reject(response);
			});
		return deferred.promise;
	};

	questionAPIs.getQuestions = function () {
		var deferred = $q.defer();
		var config = {
			method: "GET",
			url: CacheService.server.url + "/questions",
			headers: {
				"Authorization": "Basic " + CacheService.common.token
			}
		}
		$http(config)
			.then(function (response) {
				// success
				deferred.resolve(response);
			}, function (response) {
				// failure
				deferred.reject(response);
			});
		return deferred.promise;
	};

	questionAPIs.addQuestion = function (ques) {
		var deferred = $q.defer();
		var config = {
			method: "POST",
			data: ques,
			url: CacheService.server.url + "/questions",
			headers: {
				"Authorization": "Basic " + CacheService.common.token
			}
		}
		$http(config)
			.then(function (response) {
				// success
				deferred.resolve(response);
			}, function (response) {
				// failure
				deferred.reject(response);
			});
		return deferred.promise;
	};

	questionAPIs.updateQuestion = function (ques, quesId) {
		var deferred = $q.defer();
		var config = {
			method: "PUT",
			data: ques,
			url: CacheService.server.url + "/questions/" + quesId,
			headers: {
				"Authorization": "Basic " + CacheService.common.token
			}
		}
		$http(config)
			.then(function (response) {
				// success
				deferred.resolve(response);
			}, function (response) {
				// failure
				deferred.reject(response);
			});
		return deferred.promise;
	};

	questionAPIs.likeQuestion = function (quesLike) {
		var deferred = $q.defer();
		var config = {
			method: "POST",
			data: quesLike,
			url: CacheService.server.url + "/questions/" + quesLike.quesId + "/like",
			headers: {
				"Authorization": "Basic " + CacheService.common.token
			}
		}
		$http(config)
			.then(function (response) {
				// success
				deferred.resolve(response);
			}, function (response) {
				// failure
				deferred.reject(response);
			});
		return deferred.promise;
	};

	questionAPIs.dislikeQuestion = function (quesLike) {
		var deferred = $q.defer();
		var config = {
			method: "DELETE",
			data: quesLike,
			headers: {
				"content-type": "application/json",
				"Authorization": "Basic " + CacheService.common.token
			},
			url: CacheService.server.url + "/questions/" + quesLike.quesId + "/dislike"
		}
		$http(config)
			.then(function (response) {
				// success
				deferred.resolve(response);
			}, function (response) {
				// failure
				deferred.reject(response);
			});
		return deferred.promise;
	};

	questionAPIs.getLikedQuestions = function (userId) {
		var deferred = $q.defer();
		var config = {
			method: "GET",
			url: CacheService.server.url + "/questions/" + userId + "/likes",
			headers: {
				"Authorization": "Basic " + CacheService.common.token
			}
		}
		$http(config)
			.then(function (response) {
				// success
				deferred.resolve(response);
			}, function (response) {
				// failure
				deferred.reject(response);
			});
		return deferred.promise;
	};

	questionAPIs.getAskedQuestions = function (userId) {
		var deferred = $q.defer();
		var config = {
			method: "GET",
			url: CacheService.server.url + "/questions/" + userId + "/user/asked",
			headers: {
				"Authorization": "Basic " + CacheService.common.token
			}
		}
		$http(config)
			.then(function (response) {
				// success
				deferred.resolve(response);
			}, function (response) {
				// failure
				deferred.reject(response);
			});
		return deferred.promise;
	};

	questionAPIs.getAnsweredQuestions = function (userId) {
		var deferred = $q.defer();
		var config = {
			method: "GET",
			url: CacheService.server.url + "/questions/" + userId + "/user/answered",
			headers: {
				"Authorization": "Basic " + CacheService.common.token
			}
		}
		$http(config)
			.then(function (response) {
				// success
				deferred.resolve(response);
			}, function (response) {
				// failure
				deferred.reject(response);
			});
		return deferred.promise;
	};

	return questionAPIs;

}]);