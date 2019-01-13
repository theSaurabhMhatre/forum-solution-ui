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
    .otherwise({
        templateUrl : "/forum/html/register.html"
    });
});

app.service("CacheService", function(){
	this.common = {
			loggedIn: false,
			currentUser: null,
			selectedQuestion: null,
			questionOwner: null
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
	
	$scope.clearSession = function(){
		CacheService.clearSession();
		location.replace("#!logout");
	};
	
}]);