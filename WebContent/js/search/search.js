var app = angular.module("forumApp");

app.controller("searchController", ["$scope", "$location", "$routeParams", "CacheService", "UserFactory", "QuestionFactory", "AnswerFactory", "SearchFactory",
	function ($scope, $location, $routeParams, CacheService, UserFactory, QuestionFactory, AnswerFactory, SearchFactory) {

		$scope.allQuestions = [];
		$scope.topAnswers = [];
		$scope.selectedQuestion = {};
		$scope.selectedAnswer = {};
		$scope.questionOwner = {};
		$scope.sessionData = {};
		$scope.common = {
			search: {},
			noResults: true,
			count: {
				questions: 0,
				answers: 0
			}
		};

		$scope.init = function () {
			$scope.$emit("setLink", { value: "#searchLink", set: false });
			$scope.sessionData = CacheService.getSession();
			var loggedIn = $scope.sessionData.loggedIn;
			if (loggedIn) {
				$scope.common.search = {};
				$scope.common.search.keyword = $routeParams.keyword;
				$scope.common.search.category = $routeParams.category;
				$scope.common.search.type = $routeParams.type;
				$scope.fetchResults($scope.common.search);
			} else {
				$location.path("/register", true);
			}
		};

		$scope.fetchResults = function (search) {
			search.type = search.type.toLowerCase();
			search.category = search.category.toLowerCase();
			SearchFactory.performSearch(search)
				.then(function (response) {
					// success
					var data = response.data.responseObject;
					if (data.questions.length > 0) {
						$scope.common.noResults = false;
						$scope.common.count = data.counter;
						$scope.setQuestionsAndAnswers(data);
						$scope.checkAnswerLengths();
						$scope.setSelectedQuestion();
						$scope.setAnswer(0);
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
				}, function (response) {
					// failure
				});
		};

		$scope.setSelectedQuestion = function () {
			var userId;
			$scope.selectedQuestion = $scope.allQuestions[0];
			userId = $scope.selectedQuestion.askedBy;
			$scope.getUser(userId);
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
			$scope.allQuestions = data.questions;
			$scope.topAnswers = data.answers;
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
				if ($scope.allQuestions[currentQues].ques.toLowerCase().includes($scope.common.search.keyword) &&
					$scope.allQuestions[currentQues].answer.ans.toLowerCase().includes($scope.common.search.keyword) &&
					$scope.common.search.type == "all") {
					$scope.allQuestions[currentQues].badge = "both";
				} else if ($scope.allQuestions[currentQues].ques.toLowerCase().includes($scope.common.search.keyword) &&
					$scope.common.search.type != "answer") {
					$scope.allQuestions[currentQues].badge = "question";
				} else if ($scope.allQuestions[currentQues].answer.ans.toLowerCase().includes($scope.common.search.keyword) ||
					$scope.allQuestions[currentQues].answer.lengthExceeded == true) {
					$scope.allQuestions[currentQues].badge = "answer";
				}
			}
		};

		$scope.getQuestionInfo = function (quesId, userId, index) {
			$scope.selectedQuestion = {};
			var currentQuestion, totalQuestions;
			totalQuestions = $scope.allQuestions.length;
			for (currentQuestion = 0; currentQuestion < totalQuestions; currentQuestion++) {
				if ($scope.allQuestions[currentQuestion].quesId == quesId) {
					$scope.selectedQuestion = $scope.allQuestions[currentQuestion];
				}
			}
			$scope.setAnswer(index);
			$scope.getUser(userId);
		};

		$scope.setAnswer = function (index) {
			$scope.selectedAnswer = $scope.topAnswers[index];
			if ($scope.selectedAnswer.ansId == 0) {
				$scope.selectedAnswer.ansId = (-1) * $scope.allQuestions[index].quesId;
			}
		};

		$scope.viewDetails = function () {
			var ansId = 0;
			if ($scope.selectedAnswer.ansId > 0) {
				ansId = $scope.selectedAnswer.ansId;
			}
			$location.path("/question/" + $scope.selectedQuestion.quesId +
				"/answer/" + ansId, true);
		};

		$scope.$on("searchData", function (event, data) {
			$location.path("/search/" + data.type.toLowerCase() +
				"/category/" + data.category.toLowerCase() +
				"/keyword/" + data.keyword.toLowerCase(), true);
		});

	}]);