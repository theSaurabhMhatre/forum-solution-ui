var app = angular.module("forumApp");

app.controller("profileController", ["$scope", "CacheService", "UserFactory", "QuestionFactory", "AnswerFactory",
                                  function($scope, CacheService, UserFactory, QuestionFactory, AnswerFactory) {
	
	$scope.currentUser = {};    
    $scope.userRankings = [];
    $scope.sessionData = {};                                      
	
	$scope.init = function(){
        $scope.sessionData = CacheService.getSession();
		var loggedIn = $scope.sessionData.loggedIn;
		if(loggedIn){
			$scope.currentUser = $scope.sessionData.currentUser;
            UserFactory.getUserRankings()
            .then(function(response){
                // success
                $scope.userRankings = response.data.responseObject;
                $(document).ready(function(){
                    var currentUser, totalUsers;
                    totalUsers = $scope.userRankings.length;
                    for(currentUser = 0; currentUser < totalUsers; currentUser++){
                    	var toggle = "#popover" + currentUser;
                        var rankDetails = $scope.userRankings[currentUser];
                        $(toggle).popover({title: "<div align='center'><small><h6>USER DETAILS</h6></small></div>",
                        	content: "<div align='center'><small>Name: " + rankDetails[0] + "</small></div>"
                        	+ "<div align='center'><small>Answer Likes: " + rankDetails[2] + "</small></div>"
                        	+ "<div align='center'><small>Question Likes: " + rankDetails[3] + "</small></div>"
                        	+ "<div align='center'><small>Total Likes: " + rankDetails[4] + "</small></div>"
                        	, html: true
                        	, placement: "top"
                        	, trigger: "hover" });
                    }
                });
            }, function(response){
                // failure
            })
		} else {
			location.replace("#!register");
		}
	};
	
}]);