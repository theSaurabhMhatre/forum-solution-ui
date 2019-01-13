var app = angular.module("forumApp");

app.controller("answerController", ["$scope", "CacheService", "UserFactory", "QuestionFactory", "AnswerFactory",
                                  function($scope, CacheService, UserFactory, QuestionFactory, AnswerFactory) {
	
	$scope.allAnswers = [];
	$scope.likedAnswers = [];
	$scope.selectedQuestion = {};
	$scope.selectedAnswer = {};
	$scope.questionOwner = {};
	$scope.answerOwner = {};
	$scope.common = {};
    $scope.sessionData = {};                                      
	
	$scope.init = function(){
		var loggedIn, userId;
        $scope.sessionData = CacheService.getSession();
		var loggedIn = $scope.sessionData.loggedIn;
		$scope.selectedQuestion = $scope.sessionData.selectedQuestion;
		if(loggedIn == true && $scope.selectedQuestion != null){
			var quesId;
			//$scope.selectedQuestion = $scope.sessionData.selectedQuestion;
			$scope.questionOwner = $scope.sessionData.questionOwner;
			quesId = $scope.selectedQuestion.quesId;
			AnswerFactory.getAnswersByQuestion(quesId)
			.then(function(response){
				// success
				var data = response.data.responseObject;
				if(data.length > 0){
					$scope.common.noAnswers = false;
					$scope.setLikesForAnswers(data);
					$scope.setSelectedAnswer();
				} else {
					$scope.common.noAnswers = true;
				}
			}, function(response){
				// failure
			});
		} else {
			location.replace("#!register");
		}
	};
	
	$scope.setSelectedAnswer = function(){
		var userId;
		if($scope.selectedAnswer.ansId == undefined){
			$scope.selectedAnswer = $scope.allAnswers[0];
			userId = $scope.selectedAnswer.answeredBy;
			$scope.getUser(userId);
		} else {
			var ansId, currentAns, len;
			ansId = $scope.selectedAnswer.ansId;
			len = $scope.allAnswers.length;
			for(currentAns = 0; currentAns < len; currentAns++){
				if(ansId == $scope.allAnswers[currentAns].ansId){
					$scope.selectedAnswer = $scope.allAnswers[0];
					userId = $scope.selectedAnswer.answeredBy;
					$scope.getUser(userId);
				}
			}
		}
	};
	
	$scope.getUser = function(userId){
		UserFactory.getUser(userId)
		.then(function(response){
			// success
			data = response.data.responseObject;
			$scope.answerOwner = data;
		}, function(response){
			// failure
		});
	};
	
	$scope.setLikesForAnswers = function(data){
		var userId;
		$scope.allAnswers = data;
		userId = $scope.sessionData.currentUser.userId;
		AnswerFactory.getLikedAnswers(userId)
		.then(function(response){
			// success
			$scope.likedAnswers = response.data.responseObject;
			var len, innerLen, currentAns, currentLike;
			len = $scope.allAnswers.length;
			innerLen = $scope.likedAnswers.length;
			for(currentAns = 0; currentAns < len; currentAns++){
				$scope.allAnswers[currentAns].isLiked = false;
				for(currentLike = 0; currentLike < innerLen; currentLike++){
					if($scope.allAnswers[currentAns].ansId == $scope.likedAnswers[currentLike]){
						$scope.allAnswers[currentAns].isLiked = true;
						break;
					}
				}
			}
		}, function(response){
			// failure
		});
	};
	
	$scope.getAnswerInfo = function(index, userId){
		$scope.selectedAnswer = {};
		$scope.selectedAnswer = $scope.allAnswers[index];
		$scope.getUser(userId);
	};
	
	$scope.likeAnswer = function(){
		var ansLike = {};
		ansLike.userId = $scope.sessionData.currentUser.userId;
		ansLike.quesId = $scope.selectedQuestion.quesId;
		ansLike.ansId = $scope.selectedAnswer.ansId;
		AnswerFactory.likeAnswer(ansLike)
		.then(function(response){
			// success
			var quesId;
			quesId = $scope.selectedQuestion.quesId;
			AnswerFactory.getAnswersByQuestion(quesId)
			.then(function(response){
				// success
				var data = response.data.responseObject;
				$scope.setLikesForAnswers(data);
				$scope.setSelectedAnswer();
			}, function(response){
				// failure
			});
		}, function(response){
			// failure
			alert("Sorry, something went wrong!");
		});
	};
	
	$scope.submitAnswer = function(){
		if($scope.common.ans != undefined && $scope.common.ans.ans.length > 0){
			var ans = $scope.common.ans;
			ans.quesId = $scope.selectedQuestion.quesId;
			ans.answeredBy = $scope.sessionData.currentUser.userId;
			AnswerFactory.addAnswer(ans)
			.then(function(response){
				// success
				var quesId;
				quesId = $scope.selectedQuestion.quesId;
				AnswerFactory.getAnswersByQuestion(quesId)
				.then(function(response){
					// success
					$scope.common.ans = "";
					$scope.common.noAnswers = false;
					var data = response.data.responseObject;
					$scope.setLikesForAnswers(data);
					$scope.setSelectedAnswer();
				}, function(response){
					// failure
				});
			}, function(response){
				// failure
			});			
		} else {
			alert("Please enter an answer!");
		}
	};
	
	$scope.resetAnswer = function(){
		$scope.common.ans = undefined;
	};
	
}]);