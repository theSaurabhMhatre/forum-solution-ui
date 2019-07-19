var app = angular.module("forumApp");

app.factory("UserFactory", ["$http", "$q", "CacheService", function ($http, $q, CacheService) {

	var userAPIs = {};

	userAPIs.getUser = function (userId) {
		var deferred = $q.defer();
		var config = {
			method: "GET",
			url: CacheService.server.url + "/users/" + userId
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

	userAPIs.validateUser = function (userCreds) {
		var deferred = $q.defer();
		var config = {
			method: "POST",
			data: userCreds,
			url: CacheService.server.url + "/users/" + userCreds.userName + "/validate"
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

	userAPIs.checkAvailability = function (userName) {
		var deferred = $q.defer();
		var config = {
			method: "GET",
			url: CacheService.server.url + "/users/" + userName + "/available"
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

	userAPIs.addUser = function (user) {
		var deferred = $q.defer();
		var config = {
			method: "POST",
			data: user,
			url: CacheService.server.url + "/users"
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

	userAPIs.updateUser = function (user, attribute) {
		var deferred = $q.defer();
		var config = {
			method: "PUT",
			data: user,
			url: CacheService.server.url + "/users/" + user.userId + "/" + attribute
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

	userAPIs.modifyAvatar = function (userName, userAvatar, mode) {
		var deferred = $q.defer();
		var config = {
			method: "POST",
			data: userAvatar,
			url: CacheService.server.url + "/users/" + userName + "/avatar/" + mode,
			transformRequest: angular.identity,
			headers: { "Content-Type": undefined }
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

	userAPIs.getUserRankings = function () {
		var deferred = $q.defer();
		var config = {
			method: "GET",
			url: CacheService.server.url + "/users/ranking"
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

	return userAPIs;

}]);