var app = angular.module("forumApp");

app.controller("searchController", ["$scope", "CacheService", "UserFactory", "QuestionFactory", "AnswerFactory",
                                  function($scope, CacheService, UserFactory, QuestionFactory, AnswerFactory) {
	
	$scope.allQuestions = [];
	$scope.topAnswers = [];
	$scope.selectedQuestion = {};
	$scope.questionOwner = {};
    $scope.sessionData = {}; 
	$scope.common = {
            noResults: true,
            count: {
            	questions: 0,
            	answers: 0
            }
	};
	
	$scope.init = function(){
        $scope.sessionData = CacheService.getSession();
		var loggedIn = $scope.sessionData.loggedIn;
		if(loggedIn){
            var search = $scope.sessionData.search;
            $scope.fetchResults(search);
		} else {
			location.replace("#!register");
		}
	};
	
	$scope.fetchResults = function(search){
        search.type = search.type.toLowerCase();
        search.category = search.category.toLowerCase(); 
        QuestionFactory.performSearch(search)
        .then(function(response){
        	// success
        	var data = response.data.responseObject;
        	if(data[0].length > 0){
            	$scope.common.noResults = false; 
        		$scope.common.count = data[2];
        		$scope.setQuestionsAndAnswers(data);
        		$scope.setSelectedQuestion();
        	} else {
            	$scope.allQuestions = [];
            	$scope.topAnswers = [];
            	$scope.selectedQuestion = {};
            	$scope.questionOwner = {};
            	$scope.common = {
                        noResults: true,
                        count: {
                        	questions: 0,
                        	answers: 0
                        }
            	};
        	}
        }, function(response){
        	// failure
        });
	};
	
	$scope.setSelectedQuestion = function(){
		var userId;
        $scope.selectedQuestion = $scope.allQuestions[0];
        userId = $scope.selectedQuestion.askedBy;
        $scope.getUser(userId);
	};
	
	$scope.getUser = function(userId){
		UserFactory.getUser(userId)
		.then(function(response){
			// success
			var data = response.data.responseObject;
			$scope.questionOwner = data;
		}, function(response){
			// failure
		});
	};
	
	$scope.setQuestionsAndAnswers = function(data){
		$scope.allQuestions = data[0];
        $scope.topAnswers = data[1];
        var currentQuestion, totalQuestions;
        totalQuestions = $scope.allQuestions.length;
        for(currentQuestion = 0; currentQuestion < totalQuestions; currentQuestion++){
        	$scope.allQuestions[currentQuestion].answer = $scope.topAnswers[currentQuestion];
        }
	};
	
	$scope.getQuestionInfo = function(quesId, userId){
		$scope.selectedQuestion = {};
        var currentQuestion, totalQuestions;
        totalQuestions = $scope.allQuestions.length;
        for(currentQuestion = 0; currentQuestion < totalQuestions; currentQuestion++){
        	if($scope.allQuestions[currentQuestion].quesId == quesId){
                $scope.selectedQuestion = $scope.allQuestions[currentQuestion];
            }
        }
		$scope.getUser(userId);
	};
	
	$scope.viewDetails = function(){
		$scope.sessionData.selectedQuestion = $scope.selectedQuestion;
		$scope.sessionData.questionOwner = $scope.questionOwner;
        $scope.sessionData.data = [];
        CacheService.setSession($scope.sessionData);
		location.replace("#!answer");
	};
	
    $scope.$on("searchData", function(event, data){
    	$scope.fetchResults(data);
    });  

}]);