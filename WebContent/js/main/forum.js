var app = angular.module("forumApp", ["ngRoute"]);

app.config(function($routeProvider) {
	
    $routeProvider
    .when("/home", {
        templateUrl : "/forum/html/home.html"
    })
    .when("/register", {
        templateUrl : "/forum/html/register.html"
    })
    .when("/answer", {
        templateUrl : "/forum/html/answer.html"
    })
    .when("/profile", {
        templateUrl : "/forum/html/profile.html"
    })
    .when("/logout", {
        templateUrl : "/forum/html/logout.html"
    })
    .when("/search", {
        templateUrl : "/forum/html/search.html"
    })
    .otherwise({
        templateUrl : "/forum/html/register.html"
    });
    
});

app.service("CacheService", function(){
	
	this.common = {
			show: false,
			search: null,
			loggedIn: false,
			currentUser: null,
			selectedQuestion: null,
			questionOwner: null,
			categories: ["technology", "science", "history", "comics", "others"]
	};
	
	this.server = {
			url: "http://localhost:9090/forum"
	};
	
	this.setSession = function(sessionData){
        var encodedData = btoa(JSON.stringify(sessionData));
		sessionStorage.setItem("common", encodedData);
	};
	
	this.getSession = function(){
        if(sessionStorage.getItem("common") == null){
            return this.common;
        } else {
            var decodedData = atob(sessionStorage.getItem("common"));
            return JSON.parse(decodedData);
        }
	};
	
	this.clearSession = function(){
		sessionStorage.clear();
	};
    
});

app.controller("forumController", ["$scope", "CacheService", function($scope, CacheService){
	
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
	
	$scope.init = function(){
		$scope.sessionData = CacheService.getSession();
		$scope.common = {
				show: $scope.sessionData.show,
				types: ["Question","Answer","All"],
	            categories: ["Technology", "Science", "History", "Comics", "Others", "All"],
				search: {
					keyword: "",
	                category: "All",
					type: "All"
				}
		};
	};
	
	$scope.clearSession = function(){
		$scope.common.show = false;
		CacheService.clearSession();
		location.replace("#!logout");
	};
    
    $scope.search = function(){
    	var data = angular.copy($scope.common.search);
    	if(data.keyword == ""){
    		alert("Search string cannot be empty!");
    	} else {
            $scope.$broadcast("searchData", data);	
    	}
    };
    
    $scope.$on("showSearch", function(event, data){
		$scope.sessionData = CacheService.getSession();
		$scope.sessionData.show = data;
		CacheService.setSession($scope.sessionData);
    	$scope.common.show = data;
    });
    
}]);