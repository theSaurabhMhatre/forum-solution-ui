var app = angular.module("forumApp", ["ngRoute"]);

app.config(function ($routeProvider) {

	$routeProvider
		.when("/home/:category", {
			templateUrl: "/forum/html/home.html"
		})
		.when("/register", {
			templateUrl: "/forum/html/register.html"
		})
		.when("/question/:questionId/answer/:answerId", {
			templateUrl: "/forum/html/answer.html"
		})
		.when("/profile/:userName", {
			templateUrl: "/forum/html/profile.html"
		})
		.when("/logout", {
			templateUrl: "/forum/html/logout.html"
		})
		.when("/search/:type/category/:category/keyword/:keyword", {
			templateUrl: "/forum/html/search.html"
		})
		.otherwise({
			templateUrl: "/forum/html/register.html"
		});

});

// changing route parameters without reloading page
// reference: https://www.consolelog.io/angularjs-change-path-without-reloading/
app.run(['$route', '$rootScope', '$location', function ($route, $rootScope, $location) {
	var original = $location.path;
	$location.path = function (path, reload) {
		if (reload === false) {
			var lastRoute = $route.current;
			var un = $rootScope.$on('$locationChangeSuccess', function () {
				$route.current = lastRoute;
				un();
			});
		}
		return original.apply($location, [path]);
	};
}])

app.service("CacheService", function () {

	this.common = {
		show: false,
		loggedIn: false,
		currentUser: null,
		categories: ["technology", "science", "history", "geography", "comics", "others"]
	};

	this.server = {
		url: "http://localhost:9090/forum"
	};

	this.setSession = function (sessionData) {
		var encodedData = btoa(JSON.stringify(sessionData));
		sessionStorage.setItem("common", encodedData);
	};

	this.getSession = function () {
		if (sessionStorage.getItem("common") == null) {
			return this.common;
		} else {
			var decodedData = atob(sessionStorage.getItem("common"));
			return JSON.parse(decodedData);
		}
	};

	this.clearSession = function () {
		sessionStorage.clear();
		this.resetCommon();
	};

	this.resetCommon = function () {
		this.common = {
			show: false,
			loggedIn: false,
			currentUser: null,
			categories: ["technology", "science", "history", "geography", "comics", "others"]
		};
	};

});

app.controller("forumController", ["$scope", "$location", "$timeout", "CacheService", function ($scope, $location, $timeout, CacheService) {

	$scope.sessionData = {};
	$scope.common = {
		show: false,
		types: [],
		categories: [],
		search: {
			keyword: null,
			category: null,
			type: null
		}
	};

	$scope.init = function () {
		$scope.sessionData = CacheService.getSession();
		$scope.resetCommon();
	};

	$scope.resetCommon = function () {
		$scope.common = {
			loggedIn: $scope.sessionData.loggedIn,
			show: $scope.sessionData.show,
			types: ["Question", "Answer", "All"],
			categories: ["Technology", "Science", "History", "Geography", "Comics", "Others", "All"],
			search: {
				keyword: "",
				category: "All",
				type: "All"
			}
		};
	};

	$scope.clearSession = function () {
		CacheService.clearSession();
		$scope.sessionData = CacheService.getSession();
		$scope.resetCommon();
		$location.path("/logout", true);
	};

	$scope.search = function () {
		var data = angular.copy($scope.common.search);
		if (data.keyword == "") {
			alert("Search string cannot be empty!");
		} else {
			$scope.$broadcast("searchData", data);
		}
	};

	$scope.$on("showSearch", function (event, data) {
		$scope.sessionData = CacheService.getSession();
		$scope.sessionData.show = data;
		$scope.sessionData.loggedIn = data;
		CacheService.setSession($scope.sessionData);
		$scope.common.show = data;
		$scope.common.loggedIn = data;
	});

	$scope.$on("setLink", function (event, data) {
		angular.element(document).ready(function () {
			$timeout(function () {
				$("a.nav-link.menu-link.active").removeClass("active");
				if (data.set == true) {
					$(data.value).addClass("active");
				}
			}, 500);
		});
	});

}]);