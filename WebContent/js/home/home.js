var app = angular.module("forumApp");

app.controller("homeController", ["$scope", "$routeParams", "$location", "CacheService", "UserFactory", "QuestionFactory", "AnswerFactory",
	function ($scope, $routeParams, $location, CacheService, UserFactory, QuestionFactory, AnswerFactory) {

		$scope.allQuestions = [];
		$scope.topAnswers = [];
		$scope.likedQuestions = [];
		$scope.selectedQuestion = {};
		$scope.questionOwner = {};
		$scope.sessionData = {};
		$scope.common = {
			showLoader: true,
			loggedIn: false,
			categories: CacheService.common.categories,
			quesMap: new Map(),
			search: {
				category: ""
			}
		};

		$scope.init = function () {
			$scope.$emit("setLink", { value: "#homeLink", set: true });
			$scope.sessionData = CacheService.getSession();
			$scope.common.loggedIn = $scope.sessionData.loggedIn;
			if ($scope.common.categories.includes($routeParams.category)) {
				$scope.common.search.category = $routeParams.category;
			} else if ($routeParams.category == "all") {
				$scope.common.search.category = "";
			} else {
				$location.path("/home/all", true);
			}
			QuestionFactory.getQuestions()
				.then(function (response) {
					// success
					$scope.common.askQuestion = false;
					var data = response.data.responseObject;
					if (data[0].length > 0) {
						$scope.common.showLoader = false;
						$scope.common.noQuestions = false;
						$scope.setQuestionsAndAnswers(data);
						$scope.checkAnswerLengths();
						if ($scope.common.loggedIn) {
							$scope.setLikesForQuestions(data);
						}
						$scope.populateQuesMap();
						$scope.setSelectedQuestion();
					} else {
						$scope.common.showLoader = false;
						$scope.common.noQuestions = true;
					}
					var queryParams = $location.search();
					if (queryParams.showQuestion != undefined && queryParams.showQuestion != null &&
						queryParams.showQuestion == "true") {
						$scope.common.askQuestion = true;
					}
				}, function (response) {
					// failure
				});
		};

		$scope.setLikesForQuestions = function (data) {
			var userId;
			userId = $scope.sessionData.currentUser.userId;
			QuestionFactory.getLikedQuestions(userId)
				.then(function (response) {
					// success
					$scope.likedQuestions = response.data.responseObject;
					var len, innerLen, currentQues, currentLike;
					len = $scope.allQuestions.length;
					innerLen = $scope.likedQuestions.length;
					for (currentQues = 0; currentQues < len; currentQues++) {
						$scope.allQuestions[currentQues].isLiked = false;
						for (currentLike = 0; currentLike < innerLen; currentLike++) {
							if ($scope.allQuestions[currentQues].quesId == $scope.likedQuestions[currentLike]) {
								$scope.allQuestions[currentQues].isLiked = true;
								break;
							}
						}
					}
				}, function (response) {
					// failure
				});
		};

		$scope.setSelectedQuestion = function () {
			var userId;
			if ($scope.selectedQuestion == undefined || $scope.selectedQuestion.quesId == undefined) {
				if ($scope.common.search.category == '') {
					$scope.selectedQuestion = $scope.allQuestions[0];
				} else {
					$scope.selectedQuestion = $scope.common.quesMap.get($scope.common.search.category);
				}
				userId = $scope.selectedQuestion.askedBy;
				$scope.getUser(userId);
			} else {
				var quesId, currentQues, len;
				quesId = $scope.selectedQuestion.quesId;
				len = $scope.allQuestions.length;
				for (currentQues = 0; currentQues < len; currentQues++) {
					if (quesId == $scope.allQuestions[currentQues].quesId) {
						$scope.selectedQuestion = $scope.allQuestions[currentQues];
						userId = $scope.selectedQuestion.askedBy;
						$scope.getUser(userId);
						break;
					}
				}
			}
		};

		$scope.getUser = function (userId) {
			UserFactory.getUser(userId)
				.then(function (response) {
					// success
					var data = response.data.responseObject;
					$scope.questionOwner = data;
				}, function (response) {
					// failure
				});
		};

		$scope.setQuestionsAndAnswers = function (data) {
			$scope.allQuestions = data[0];
			$scope.topAnswers = data[1];
			var currentQuestion, totalQuestions;
			totalQuestions = $scope.allQuestions.length;
			for (currentQuestion = 0; currentQuestion < totalQuestions; currentQuestion++) {
				$scope.allQuestions[currentQuestion].answer = $scope.topAnswers[currentQuestion];
			}
		};

		$scope.checkAnswerLengths = function () {
			var currentQues, totalQuestions, index;
			totalQuestions = $scope.allQuestions.length;
			for (currentQues = 0; currentQues < totalQuestions; currentQues++) {
				if ($scope.allQuestions[currentQues].answer.ans.length > 475) {
					index = $scope.allQuestions[currentQues].answer.ans.indexOf(" ", 470);
					$scope.allQuestions[currentQues].answer.ans = $scope.allQuestions[currentQues].answer.ans.slice(0, index);
					$scope.allQuestions[currentQues].answer.lengthExceeded = true;
				} else {
					$scope.allQuestions[currentQues].answer.lengthExceeded = false;
				}
			}
		};

		$scope.getQuestionInfo = function (quesId, userId) {
			$scope.selectedQuestion = {};
			var currentQuestion, totalQuestions;
			totalQuestions = $scope.allQuestions.length;
			for (currentQuestion = 0; currentQuestion < totalQuestions; currentQuestion++) {
				if ($scope.allQuestions[currentQuestion].quesId == quesId) {
					$scope.selectedQuestion = $scope.allQuestions[currentQuestion];
				}
			}
			$scope.getUser(userId);
		};

		$scope.likeQuestion = function () {
			var quesLike = {};
			quesLike.userId = $scope.sessionData.currentUser.userId;
			quesLike.quesId = $scope.selectedQuestion.quesId;
			QuestionFactory.likeQuestion(quesLike)
				.then(function (response) {
					// success
					QuestionFactory.getQuestions()
						.then(function (response) {
							// success
							var data = response.data.responseObject;
							$scope.setQuestionsAndAnswers(data);
							$scope.checkAnswerLengths();
							if ($scope.common.loggedIn) {
								$scope.setLikesForQuestions(data);
							}
							$scope.common.quesMap.clear();
							$scope.populateQuesMap();
							$scope.setSelectedQuestion();
						}, function (response) {
							// failure
						});
				}, function (response) {
					// failure
					alert("Sorry, something went wrong!");
				});
		};

		$scope.dislikeQuestion = function () {
			var quesLike = {};
			quesLike.userId = $scope.sessionData.currentUser.userId;
			quesLike.quesId = $scope.selectedQuestion.quesId;
			QuestionFactory.dislikeQuestion(quesLike)
				.then(function (response) {
					// success
					QuestionFactory.getQuestions()
						.then(function (response) {
							// success
							var data = response.data.responseObject;
							$scope.setQuestionsAndAnswers(data);
							$scope.checkAnswerLengths();
							if ($scope.common.loggedIn) {
								$scope.setLikesForQuestions(data);
							}
							$scope.common.quesMap.clear();
							$scope.populateQuesMap();
							$scope.setSelectedQuestion();
						}, function (response) {
							// failure
						});
				}, function (response) {
					// failure
					alert("Sorry, something went wrong!");
				});
		};

		$scope.answerQuestion = function () {
			if ($scope.common.loggedIn) {
				$location.path("/question/" + $scope.selectedQuestion.quesId +
					"/answer/" + $scope.selectedQuestion.answer.ansId, true).search({ answerQuestion: "true" });
			} else {
				var check = confirm("You need to login to answer questions. Do you wish to sign in?");
				if (check) {
					$location.path("/register", true).search({
						redirect: "/question/" +
							$scope.selectedQuestion.quesId + "/answer/" + $scope.selectedQuestion.answer.ansId,
						answerQuestion: "true"
					});
				}
			}
		};

		$scope.viewAnswers = function () {
			if ($location.search().showQuestion == "true") {
				$location.search("showQuestion", null);
			}
			$location.path("/question/" + $scope.selectedQuestion.quesId +
				"/answer/" + $scope.selectedQuestion.answer.ansId, true);
		};

		$scope.commenceAskQuestion = function () {
			if ($scope.common.loggedIn) {
				$scope.common.askQuestion = true;
			} else {
				var check = confirm("You need to login to answer questions. Do you wish to sign in?");
				if (check) {
					$location.path("/register", true).search({ redirect: $location.url(), showQuestion: "true" });
				}
			}
		};

		$scope.validateQuestion = function () {
			if ($scope.common.ques != undefined && $scope.common.ques.ques != undefined &&
				$scope.common.ques.ques.length > 0) {
				$("#myModal").modal("show");
			} else {
				alert("Please enter a question!");
			}
		};

		$scope.askQuestion = function () {
			if ($scope.common.ques.category != undefined) {
				var ques = $scope.common.ques;
				ques.askedBy = $scope.sessionData.currentUser.userId;
				QuestionFactory.addQuestion(ques)
					.then(function (response) {
						// success
						$scope.common.askQuestion = false;
						$("#myModal").modal("hide");
						$scope.common.ques = {};
						QuestionFactory.getQuestions()
							.then(function (response) {
								// success
								var data = response.data.responseObject;
								$scope.setQuestionsAndAnswers(data);
								$scope.checkAnswerLengths();
								if ($scope.common.loggedIn) {
									$scope.setLikesForQuestions(data);
								}
								$scope.common.quesMap.clear();
								$scope.populateQuesMap();
								$scope.setSelectedQuestion();
							}, function (response) {
								// failure
							});
					}, function (response) {
						// failure
					});
			} else {
				alert("Please select category!");
			}
		};

		$scope.resetQuestion = function () {
			$scope.common.ques = {};
		};

		$scope.cancelAskQuestion = function () {
			$scope.common.ques = {};
			$scope.common.askQuestion = false;
			$("#myModal").modal("hide");
		};

		$scope.setFilter = function (category) {
			$scope.common.search.category = category;
			if (category == '') {
				$scope.selectedQuestion = $scope.allQuestions[0];
			} else {
				$scope.selectedQuestion = $scope.common.quesMap.get(category);
			}
			var path = "all";
			if ($scope.common.search.category != "") {
				path = $scope.common.search.category;
			}
			$location.path("/home/" + path, false);
		};

		$scope.populateQuesMap = function () {
			var currentQuestion, totalQuestions;
			totalQuestions = $scope.allQuestions.length;
			for (currentQuestion = 0; currentQuestion < totalQuestions; currentQuestion++) {
				if ($scope.common.quesMap.has($scope.allQuestions[currentQuestion].category) == false) {
					$scope.common.quesMap.set($scope.allQuestions[currentQuestion].category,
						$scope.allQuestions[currentQuestion]);
				}
			}
		};

		$scope.$on("searchData", function (event, data) {
			$location.path("/search/" + data.type.toLowerCase() +
				"/category/" + data.category.toLowerCase() +
				"/keyword/" + data.keyword.toLowerCase(), true);
		});

	}]);