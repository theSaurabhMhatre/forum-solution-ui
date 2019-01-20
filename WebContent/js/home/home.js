var app = angular.module("forumApp");

app.controller("homeController", ["$scope", "CacheService", "UserFactory", "QuestionFactory", "AnswerFactory",
                                  function($scope, CacheService, UserFactory, QuestionFactory, AnswerFactory) {
	
	$scope.allQuestions = [];
	$scope.topAnswers = [];
	$scope.likedQuestions = [];
	$scope.selectedQuestion = {};
	$scope.questionOwner = {};
    $scope.sessionData = {}; 
	$scope.common = {
			categories: CacheService.common.categories,
            search: {
            	category: ""
            }
	};
	
	$scope.init = function(){
        $scope.sessionData = CacheService.getSession();
		var loggedIn = $scope.sessionData.loggedIn;
		if(loggedIn){
			QuestionFactory.getQuestions()
			.then(function(response){
				// success
				$scope.common.askQuestion = false;
				var data = response.data.responseObject;
				if(data[0].length > 0){
					$scope.common.noQuestions = false;
					$scope.setLikesForQuestions(data);
					$scope.setSelectedQuestion();	
				} else {
					$scope.common.noQuestions = true;
				}
			}, function(response){
				// failure
			});			
		} else {
			location.replace("#!register");
		}
	};
	
	$scope.setLikesForQuestions = function(data){
		var userId;
		$scope.setQuestionsAndAnswers(data);
		userId = $scope.sessionData.currentUser.userId;
		QuestionFactory.getLikedQuestions(userId)
		.then(function(response){
			// success
			$scope.likedQuestions = response.data.responseObject;
			var len, innerLen, currentQues, currentLike;
			len = $scope.allQuestions.length;
			innerLen = $scope.likedQuestions.length;
			for(currentQues = 0; currentQues < len; currentQues++){
				$scope.allQuestions[currentQues].isLiked = false;
				for(currentLike = 0; currentLike < innerLen; currentLike++){
					if($scope.allQuestions[currentQues].quesId == $scope.likedQuestions[currentLike]){
						$scope.allQuestions[currentQues].isLiked = true;
						break;
					}
				}
			}
		}, function(response){
			// failure
		});
	};
	
	$scope.setSelectedQuestion = function(){
		var userId;
		if($scope.selectedQuestion.quesId == undefined){
			$scope.selectedQuestion = $scope.allQuestions[0];
			userId = $scope.selectedQuestion.askedBy;
			$scope.getUser(userId);
		} else {
			var quesId, currentQues, len;
			quesId = $scope.selectedQuestion.quesId;
			len = $scope.allQuestions.length;
			for(currentQues = 0; currentQues < len; currentQues++){
				if(quesId == $scope.allQuestions[currentQues].quesId){
					$scope.selectedQuestion = $scope.allQuestions[0];
					userId = $scope.selectedQuestion.askedBy;
					$scope.getUser(userId);
				}
			}
		}
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
	
	$scope.likeQuestion = function(){
		var quesLike = {};
		quesLike.userId = $scope.sessionData.currentUser.userId;
		quesLike.quesId = $scope.selectedQuestion.quesId;
		QuestionFactory.likeQuestion(quesLike)
		.then(function(response){
			// success
			QuestionFactory.getQuestions()
			.then(function(response){
				// success
				var data = response.data.responseObject;
				$scope.setLikesForQuestions(data);
				$scope.setSelectedQuestion();
			}, function(response){
				// failure
			});
		}, function(response){
			// failure
			alert("Sorry, something went wrong!");
		});
	};
	
	$scope.answerQuestion = function(){
		$scope.sessionData.selectedQuestion = $scope.selectedQuestion;
		$scope.sessionData.questionOwner = $scope.questionOwner;
        CacheService.setSession($scope.sessionData);
		location.replace("#!answer");
	};
	
	$scope.viewAnswers = function(){
		$scope.sessionData.selectedQuestion = $scope.selectedQuestion;
		$scope.sessionData.questionOwner = $scope.questionOwner;
        CacheService.setSession($scope.sessionData);
		location.replace("#!answer");
	};
	
	$scope.commenceAskQuestion = function(){
		$scope.common.askQuestion = true;
	};
	
	$scope.validateQuestion = function(){
		if($scope.common.ques != undefined && $scope.common.ques.ques != undefined &&
				$scope.common.ques.ques.length > 0){
			$('#myModal').modal('show');
		} else {
			alert("Please enter a question!");
		}
	};
	
	$scope.askQuestion = function(){
		if($scope.common.ques.category != undefined){
			var ques = $scope.common.ques;
			ques.askedBy = $scope.sessionData.currentUser.userId;
			QuestionFactory.addQuestion(ques)
			.then(function(response){
				// success
				$scope.common.askQuestion = false;
				$('#myModal').modal('hide');
				$scope.common.ques = {};
				QuestionFactory.getQuestions()
				.then(function(response){
					// success
					var data = response.data.responseObject;
					$scope.setLikesForQuestions(data);
					$scope.setSelectedQuestion();
				}, function(response){
					// failure
				});			
			}, function(response){
				// failure
			});			
		} else {
			alert("Please select category!");
		}
	};

	$scope.resetQuestion = function(){
		$scope.common.ques = {};
	};
	
	$scope.cancelAskQuestion = function(){
		$scope.common.ques = {};
		$scope.common.askQuestion = false;
		$('#myModal').modal('hide');
	};
	
	$scope.setFilter = function(category){
		$scope.common.search.category = category;
	};
	
}]);