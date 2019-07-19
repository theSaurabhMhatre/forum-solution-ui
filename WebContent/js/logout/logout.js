var app = angular.module("forumApp");

app.controller("logoutController", ["$scope", "$route", "$timeout", "CacheService", function ($scope, $route, $timeout, CacheService) {

	$scope.common = {
		check: false
	};

	$scope.init = function () {
		$scope.$emit("setLink", { value: "#logoutLink", set: true });
		$scope.sessionData = CacheService.getSession();
		var loggedIn = $scope.sessionData.loggedIn;
		if (loggedIn) {
			$timeout(function () {
				$route.reload();
			}, 10000);
		} else {
			$scope.common.check = true;
		}
	};

}]);