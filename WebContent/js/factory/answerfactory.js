var app = angular.module("forumApp");

app.factory("AnswerFactory", ["$http", "$q", "CacheService", function ($http, $q, CacheService) {

	var answerAPIs = {};

	answerAPIs.getAnswersByQuestion = function (quesId) {
		var deferred = $q.defer();
		var config = {
			method: "GET",
			url: CacheService.server.url + "/answers/" + quesId
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

	answerAPIs.addAnswer = function (ans) {
		var deferred = $q.defer();
		var config = {
			method: "POST",
			data: ans,
			url: CacheService.server.url + "/answers"
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

	answerAPIs.updateAnswer = function (ans, ansId) {
		var deferred = $q.defer();
		var config = {
			method: "PUT",
			data: ans,
			url: CacheService.server.url + "/answers/" + ansId
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

	answerAPIs.likeAnswer = function (ansLike) {
		var deferred = $q.defer();
		var config = {
			method: "POST",
			data: ansLike,
			url: CacheService.server.url + "/answers/" + ansLike.ansId + "/like"
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

	answerAPIs.dislikeAnswer = function (ansLike) {
		var deferred = $q.defer();
		var config = {
			method: "DELETE",
			data: ansLike,
			headers: {
				'content-type': 'application/json'
			},
			url: CacheService.server.url + "/answers/" + ansLike.ansId + "/dislike"
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

	answerAPIs.getLikedAnswers = function (userId) {
		var deferred = $q.defer();
		var config = {
			method: "GET",
			url: CacheService.server.url + "/answers/" + userId + "/likes"
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

	answerAPIs.getAnswerByQuesAnsPair = function (ansId, quesId) {
		var deferred = $q.defer();
		var config = {
			method: "GET",
			url: CacheService.server.url + "/answers/" + ansId + "/question/" + quesId
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

	return answerAPIs;

}]);