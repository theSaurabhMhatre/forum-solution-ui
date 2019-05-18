var app = angular.module("forumApp");

app.factory("SearchFactory", ["$http", "$q", "CacheService", function($http, $q, CacheService){
	
	var searchAPIs = {};
	
	searchAPIs.performSearch = function(search){
		var deferred = $q.defer();
		var params = "type=" + search.type + "&category=" + search.category + "&keyword=" + search.keyword;
		var config = {
				method: "GET",
				url: CacheService.server.url + "/search?" + params
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
	
	return searchAPIs;
	
}]);