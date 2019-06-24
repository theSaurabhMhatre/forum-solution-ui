var app = angular.module("forumApp");

app.controller("logoutController", ["$scope", "$timeout", "CacheService", function ($scope, $timeout, CacheService) {

	$scope.common = {
		check: false
	};

	$scope.init = function () {
		$scope.$emit("setLink", { value: "#logoutLink", set: true });
		$scope.sessionData = CacheService.getSession();
		var loggedIn = $scope.sessionData.loggedIn;
		if (loggedIn) {
			$timeout(location.reload(), 10000);
		} else {
			$scope.common.check = true;
		}
	};

}]);