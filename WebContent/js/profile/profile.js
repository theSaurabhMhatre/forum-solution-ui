var app = angular.module("forumApp");

app.controller("profileController", ["$scope", "CacheService", "UserFactory", "QuestionFactory", "AnswerFactory",
                                  function($scope, CacheService, UserFactory, QuestionFactory, AnswerFactory) {
	
	$scope.currentUser = {};    
    $scope.userRankings = [];
    $scope.sessionData = {};     
    $scope.askedQuestions = [];
    $scope.answeredQuestions = [];
	
	$scope.init = function(){
        $scope.sessionData = CacheService.getSession();
		var loggedIn = $scope.sessionData.loggedIn;
		if(loggedIn){
			$scope.currentUser = $scope.sessionData.currentUser;
            UserFactory.getUserRankings()
            .then(function(response){
                // success
                $scope.userRankings = response.data.responseObject;
                $scope.setUserRankings();
                $scope.setAskedQuestions($scope.currentUser.userId);
                $scope.setAnsweredQuestions($scope.currentUser.userId);
            }, function(response){
                // failure
            });
		} else {
			location.replace("#!register");
		}
	};
	
	$scope.setUserRankings = function(){
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
	};
	

	$scope.setAskedQuestions = function(userId){
		QuestionFactory.getAskedQuestions(userId)
		.then(function(response){
			// success
			$scope.askedQuestions = response.data.responseObject;
		}, function(response){
			// failure
		});
	};
	
	$scope.setAnsweredQuestions = function(userId){
		QuestionFactory.getAnsweredQuestions(userId)
		.then(function(response){
			// success
			$scope.answeredQuestions = response.data.responseObject;
		}, function(response){
			// failure
		});
	};
	
	$scope.viewAskedQuestion = function(question){
		$scope.sessionData.selectedQuestion = question;
		$scope.sessionData.questionOwner = $scope.currentUser;
        CacheService.setSession($scope.sessionData);
		location.replace("#!answer");
	};

	$scope.viewAnsweredQuestion = function(question){
		var questionOwner;
		UserFactory.getUser(question.askedBy)
		.then(function(response){
			// success
			questionOwner = response.data.responseObject;
			$scope.sessionData.selectedQuestion = question;
			$scope.sessionData.questionOwner = questionOwner;
	        CacheService.setSession($scope.sessionData);
			location.replace("#!answer");
		}, function(response){
			// failure
		});
	};
	
}]);