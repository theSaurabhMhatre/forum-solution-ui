var app = angular.module("forumApp");

app.controller("answerController", ["$scope", "$routeParams", "$location", "CacheService", "UserFactory", "QuestionFactory", "AnswerFactory",
	function ($scope, $routeParams, $location, CacheService, UserFactory, QuestionFactory, AnswerFactory) {

		$scope.allAnswers = [];
		$scope.likedAnswers = [];
		$scope.selectedQuestion = {};
		$scope.selectedAnswer = {};
		$scope.questionOwner = {};
		$scope.answerOwner = {};
		$scope.sessionData = {};
		$scope.common = {
			isAnswered: false,
			pageExists: true,
			loggedIn: false,
			answerQuestion: false,
			ans: {},
			ques: {},
			previousValue: 0,
			categories: CacheService.common.categories
		};

		$scope.init = function () {
			$scope.$emit("setLink", { value: "#answerLink", set: false });
			$scope.sessionData = CacheService.getSession();
			$scope.common.loggedIn = $scope.sessionData.loggedIn;
			var quesId, ansId;
			quesId = $routeParams.questionId;
			$scope.getQuestion(quesId);
			ansId = $routeParams.answerId;
			if (ansId != 0) {
				AnswerFactory.getAnswerByQuesAnsPair(ansId, quesId)
					.then(function (response) {
						// success
						if (response.data.responseObject.exists == true) {
							$scope.continueInit(quesId);
						} else {
							$scope.common.pageExists = false;
						}
					}, function (response) {
						// failure
						$scope.common.pageExists = false;
					});
			} else {
				$scope.continueInit(quesId);
			}
		};

		$scope.continueInit = function (quesId) {
			AnswerFactory.getAnswersByQuestion(quesId)
				.then(function (response) {
					// success
					var data = response.data.responseObject;
					if (data.length > 0) {
						$scope.common.noAnswers = false;
						$scope.allAnswers = data;
						if ($scope.common.loggedIn) {
							$scope.setLikesForAnswers(data);
						}
						$scope.setSelectedAnswer();
						$scope.checkIfAnswered();
						$scope.common.mode = "add";
					} else {
						$scope.common.noAnswers = true;
						$scope.common.mode = "add";
					}
					var queryParams = $location.search();
					if (queryParams.answerQuestion != undefined && queryParams.answerQuestion != null &&
						queryParams.answerQuestion == "true") {
						$scope.common.answerQuestion = true;
					}
				}, function (response) {
					// failure
				});
		};

		$scope.setSelectedAnswer = function () {
			var userId, ansId, currentAns, len;
			len = $scope.allAnswers.length;
			ansId = $scope.common.previousValue;
			if ($scope.selectedAnswer.ansId == undefined) {
				ansId = $routeParams.answerId;
			} else {
				ansId = $scope.selectedAnswer.ansId;
			}
			$scope.common.previousValue = ansId;
			if (ansId == 0) {
				$scope.selectedAnswer = $scope.allAnswers[0];
			} else {
				for (currentAns = 0; currentAns < len; currentAns++) {
					if (ansId == $scope.allAnswers[currentAns].ansId) {
						$scope.selectedAnswer = $scope.allAnswers[currentAns];
					}
				}
			}
			userId = $scope.selectedAnswer.answeredBy;
			$scope.getUser(userId, "answer");
		};

		$scope.checkIfAnswered = function () {
			if ($scope.common.loggedIn) {
				var currentAns, len;
				len = $scope.allAnswers.length;
				for (currentAns = 0; currentAns < len; currentAns++) {
					if ($scope.allAnswers[currentAns].answeredBy == $scope.sessionData.currentUser.userId) {
						$scope.common.isAnswered = true;
						break;
					}
				}
			}
		};

		$scope.getQuestion = function (quesId) {
			QuestionFactory.getQuestion(quesId)
				.then(function (response) {
					// success
					data = response.data.responseObject;
					$scope.selectedQuestion = data;
					$scope.getUser(data.askedBy, "question");
				}, function (response) {
					// failure
					$scope.common.pageExists = false;
				});
		};

		$scope.getUser = function (userId, value) {
			UserFactory.getUser(userId)
				.then(function (response) {
					// success
					data = response.data.responseObject;
					if (value == "question") {
						$scope.questionOwner = data;
					} else if (value == "answer") {
						$scope.answerOwner = data;
					}
				}, function (response) {
					// failure
				});
		};

		$scope.setLikesForAnswers = function (data) {
			var userId;
			userId = $scope.sessionData.currentUser.userId;
			AnswerFactory.getLikedAnswers(userId)
				.then(function (response) {
					// success
					$scope.likedAnswers = response.data.responseObject;
					var len, innerLen, currentAns, currentLike;
					len = $scope.allAnswers.length;
					innerLen = $scope.likedAnswers.length;
					for (currentAns = 0; currentAns < len; currentAns++) {
						$scope.allAnswers[currentAns].isLiked = false;
						for (currentLike = 0; currentLike < innerLen; currentLike++) {
							if ($scope.allAnswers[currentAns].ansId == $scope.likedAnswers[currentLike]) {
								$scope.allAnswers[currentAns].isLiked = true;
								break;
							}
						}
					}
				}, function (response) {
					// failure
				});
		};

		$scope.getAnswerInfo = function (index, userId) {
			$scope.selectedAnswer = {};
			$scope.selectedAnswer = $scope.allAnswers[index];
			$scope.getUser(userId, "answer");
			if ($scope.common.previousValue != $scope.selectedAnswer.ansId) {
				$scope.common.previousValue = $scope.selectedAnswer.ansId;
				$location.path("/question/" + $scope.selectedQuestion.quesId +
					"/answer/" + $scope.selectedAnswer.ansId, false);
			}
		};

		$scope.likeAnswer = function () {
			var ansLike = {};
			ansLike.userId = $scope.sessionData.currentUser.userId;
			ansLike.quesId = $scope.selectedQuestion.quesId;
			ansLike.ansId = $scope.selectedAnswer.ansId;
			AnswerFactory.likeAnswer(ansLike)
				.then(function (response) {
					// success
					var quesId;
					quesId = $scope.selectedQuestion.quesId;
					AnswerFactory.getAnswersByQuestion(quesId)
						.then(function (response) {
							// success
							var data = response.data.responseObject;
							$scope.allAnswers = data;
							if ($scope.common.loggedIn) {
								$scope.setLikesForAnswers(data);
							}
							$scope.setSelectedAnswer();
							$scope.common.mode = "add";
						}, function (response) {
							// failure
						});
				}, function (response) {
					// failure
					alert("Sorry, something went wrong!");
				});
		};

		$scope.dislikeAnswer = function () {
			var ansLike = {};
			ansLike.userId = $scope.sessionData.currentUser.userId;
			ansLike.quesId = $scope.selectedQuestion.quesId;
			ansLike.ansId = $scope.selectedAnswer.ansId;
			AnswerFactory.dislikeAnswer(ansLike)
				.then(function (response) {
					// success
					var quesId;
					quesId = $scope.selectedQuestion.quesId;
					AnswerFactory.getAnswersByQuestion(quesId)
						.then(function (response) {
							// success
							var data = response.data.responseObject;
							$scope.allAnswers = data;
							if ($scope.common.loggedIn) {
								$scope.setLikesForAnswers(data);
							}
							$scope.setSelectedAnswer();
							$scope.common.mode = "add";
						}, function (response) {
							// failure
						});
				}, function (response) {
					// failure
					alert("Sorry, something went wrong!");
				});
		};

		$scope.cancelAskAnswer = function () {
			$scope.common.answerQuestion = false;
			$scope.resetAnswer();
		};

		$scope.submitAnswer = function () {
			if ((!$scope.common.isAnswered && $scope.common.mode == "add") ||
				($scope.common.isAnswered && $scope.common.mode == "update")) {
				if ($scope.common.ans != undefined && $scope.common.ans.ans != undefined &&
					$scope.common.ans.ans.length > 0) {
					if ($scope.common.mode == "add") {
						// add a new answer
						var ans = $scope.common.ans;
						ans.quesId = $scope.selectedQuestion.quesId;
						ans.answeredBy = $scope.sessionData.currentUser.userId;
						$scope.addAnswer(ans);
					} else {
						// update an existing answer
						var ans = {};
						ans.ans = $scope.common.ans.ans;
						ans.ansId = $scope.selectedAnswer.ansId;
						ans.quesId = $scope.selectedQuestion.quesId;
						ans.answeredBy = $scope.sessionData.currentUser.userId;
						ans.ansCreatedOn = $scope.selectedAnswer.ansCreatedOn;
						$scope.updateAnswer(ans);
					}
				} else {
					alert("Please enter an answer!");
				}
			} else {
				var check = confirm("You've already answered this question! Do you want to edit your answer?");
				if (check) {
					var index, len;
					len = $scope.allAnswers.length;
					for (index = 0; index < len; index++) {
						if ($scope.allAnswers[index].answeredBy == $scope.sessionData.currentUser.userId) {
							$scope.selectedAnswer = $scope.allAnswers[index];
							$scope.getUser($scope.selectedAnswer.answeredBy, "answer");
						}
					}
					$scope.commenceUpdateAnswer();
				}
			}
		};

		$scope.addAnswer = function (ans) {
			AnswerFactory.addAnswer(ans)
				.then(function (response) {
					// success
					var quesId;
					quesId = $scope.selectedQuestion.quesId;
					AnswerFactory.getAnswersByQuestion(quesId)
						.then(function (response) {
							// success
							$scope.common.ans = "";
							$scope.common.noAnswers = false;
							var data = response.data.responseObject;
							$scope.allAnswers = data;
							if ($scope.common.loggedIn) {
								$scope.setLikesForAnswers(data);
							}
							$scope.setSelectedAnswer();
							$scope.common.isAnswered = true;
						}, function (response) {
							// failure
						});
				}, function (response) {
					// failure
				});
		};

		$scope.updateAnswer = function (ans) {
			AnswerFactory.updateAnswer(ans, ans.ansId)
				.then(function (response) {
					// success
					var quesId;
					quesId = $scope.selectedQuestion.quesId;
					AnswerFactory.getAnswersByQuestion(quesId)
						.then(function (response) {
							// success
							$scope.common.ans = "";
							$scope.common.mode = "add";
							$scope.common.noAnswers = false;
							var data = response.data.responseObject;
							$scope.allAnswers = data;
							if ($scope.common.loggedIn) {
								$scope.setLikesForAnswers(data);
							}
							$scope.setSelectedAnswer();
						}, function (response) {
							// failure
						});
				}, function (response) {
					// failure
				});
		};

		$scope.resetAnswer = function () {
			$scope.common.ans = undefined;
			$scope.common.mode = "add";
		};

		$scope.commenceAnswerQuestion = function () {
			if ($scope.common.loggedIn) {
				$scope.common.answerQuestion = true;
			} else {
				var check = confirm("You need to login to answer questions. Do you wish to sign in?");
				if (check) {
					var redirectUrl = $location.url();
					$location.path("/register", true).search({ redirect: redirectUrl, answerQuestion: "true" });
				}
			}
		};

		$scope.commenceUpdateAnswer = function () {
			$scope.common.ans = $scope.selectedAnswer;
			$scope.common.mode = "update";
			$scope.common.answerQuestion = true;
		};

		$scope.commenceUpdateQuestion = function () {
			$scope.common.ques.ques = $scope.selectedQuestion.ques;
			$scope.common.ques.category = $scope.selectedQuestion.category;
			$('#myModal').modal('show');
		};

		$scope.updateQuestion = function () {
			if ($scope.common.ques != undefined && $scope.common.ques.ques != undefined &&
				$scope.common.ques.ques.length > 0) {
				var ques = $scope.common.ques;
				ques.quesId = $scope.selectedQuestion.quesId;
				ques.askedBy = $scope.selectedQuestion.askedBy;
				ques.quesCreatedOn = $scope.selectedQuestion.quesCreatedOn;
				QuestionFactory.updateQuestion(ques, ques.quesId)
					.then(function (response) {
						// success
						ques = response.data.responseObject;
						$scope.selectedQuestion.ques = ques.ques;
						$scope.selectedQuestion.category = ques.category;
						$('#myModal').modal('hide');
					}, function (response) {
						// failure
					});
			} else {
				alert("Please enter a question!");
			}
		};

		$scope.cancelUpdateQuestion = function () {
			$scope.common.ques.ques = $scope.selectedQuestion.ques;
			$scope.common.ques.category = $scope.selectedQuestion.category;
			$('#myModal').modal('hide');
		};

		$scope.$on("searchData", function (event, data) {
			$scope.sessionData.search = data;
			CacheService.setSession($scope.sessionData);
			$location.path("/search/" + data.type.toLowerCase() +
				"/category/" + data.category.toLowerCase() +
				"/keyword/" + data.keyword.toLowerCase(), true);
		});

	}]);