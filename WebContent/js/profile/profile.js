var app = angular.module("forumApp");

app.controller("profileController", ["$scope", "$timeout", "$location", "$route", "$routeParams", "$routeParams", "CacheService", "UserFactory", "QuestionFactory", "AnswerFactory",
	function ($scope, $timeout, $location, $route, $routeParams, $routeParams, CacheService, UserFactory, QuestionFactory, AnswerFactory) {

		$scope.currentUser = {};
		$scope.tempUser = {};
		$scope.userRankings = [];
		$scope.sessionData = {};
		$scope.askedQuestions = [];
		$scope.answeredQuestions = [];
		$scope.answeredAnswers = [];
		$scope.userCreds = {};
		$scope.common = {
			pageExists: true,
			loggedIn: false,
			editControls: false,
			pswdCheck: false,
			routeUserName: null
		};

		$scope.init = function () {
			$scope.$emit("setLink", { value: "#profileLink", set: true });
			$scope.common.routeUserName = $routeParams.userName;
			$scope.sessionData = CacheService.getSession();
			$scope.common.loggedIn = $scope.sessionData.loggedIn;
			if ($scope.common.loggedIn == true &&
				$scope.common.routeUserName == $scope.sessionData.currentUser.userName) {
				$scope.common.editControls = true;
				$scope.currentUser = $scope.sessionData.currentUser;
				if (!$scope.currentUser.userAvatar.includes("decache")) {
					$scope.currentUser.userAvatar += "?decache=" + (new Date().toString());
				}
				$scope.tempUser = angular.copy($scope.currentUser);
				$scope.getUserRankings();
			} else {
				UserFactory.checkAvailability($scope.common.routeUserName)
					.then(function (response) {
						// success
						$scope.currentUser = response.data.responseObject.user;
						if (!$scope.currentUser.userAvatar.includes("decache")) {
							$scope.currentUser.userAvatar += "?decache=" + (new Date().toString());
						}
						$scope.tempUser = angular.copy($scope.currentUser);
						$scope.getUserRankings();
					}, function (response) {
						// failure
						$scope.common.pageExists = false;
					});
			}
		};

		$scope.getUserRankings = function () {
			UserFactory.getUserRankings()
				.then(function (response) {
					// success
					$scope.userRankings = response.data.responseObject;
					$scope.setUserRankings();
					$scope.setAskedQuestions($scope.currentUser.userId);
					$scope.setAnsweredQuestions($scope.currentUser.userId);
				}, function (response) {
					// failure
				});
		};

		$scope.setUserRankings = function () {
			$(document).ready(function () {
				var currentUser, totalUsers;
				totalUsers = $scope.userRankings.length;
				for (currentUser = 0; currentUser < totalUsers; currentUser++) {
					var toggle = "#popover" + currentUser;
					var rankDetails = $scope.userRankings[currentUser];
					$(toggle).popover({
						title: "<div align='center'><small><h6>USER DETAILS</h6></small></div>",
						content: "<div align='center'><small>Name: " + rankDetails[0] + "</small></div>"
							+ "<div align='center'><small>Answer Likes: " + rankDetails[2] + "</small></div>"
							+ "<div align='center'><small>Question Likes: " + rankDetails[3] + "</small></div>"
							+ "<div align='center'><small>Total Likes: " + rankDetails[4] + "</small></div>"
						, html: true
						, placement: "top"
						, trigger: "hover"
					});
				}
			});
		};

		$scope.setAskedQuestions = function (userId) {
			QuestionFactory.getAskedQuestions(userId)
				.then(function (response) {
					// success
					$scope.askedQuestions = response.data.responseObject;
				}, function (response) {
					// failure
				});
		};

		$scope.setAnsweredQuestions = function (userId) {
			QuestionFactory.getAnsweredQuestions(userId)
				.then(function (response) {
					// success
					$scope.answeredQuestions = response.data.responseObject[0];
					$scope.answeredAnswers = response.data.responseObject[1];
				}, function (response) {
					// failure
				});
		};

		$scope.viewAskedQuestion = function (question) {
			$location.path("/question/" + question.quesId +
				"/answer/" + 0, true);
		};

		$scope.viewAnsweredQuestion = function (question, index) {
			$location.path("/question/" + question.quesId +
				"/answer/" + $scope.answeredAnswers[index].ansId, true);
		};

		$scope.commenceEdit = function () {
			$scope.tempUser = angular.copy($scope.currentUser);
			$('#editDetails').modal('show');
		};

		$scope.commenceUploadAvatar = function () {
			$scope.tempUser = angular.copy($scope.currentUser);
			$('#uploadAvatar').modal('show');
		};

		$(".custom-file-input").on("change", function () {
			var fileName = $(this).val().split("\\").pop();
			$(this).siblings(".custom-file-label").addClass("selected").html(fileName);
		});

		$scope.uploadAvatar = function () {
			var mode;
			if ($scope.currentUser.userAvatar == null) {
				mode = "add";
			} else {
				mode = "update";
			}
			var userAvatar = document.getElementById("userAvatar").files[0];
			if (userAvatar != null && userAvatar != undefined) {
				var formData = new FormData();
				formData.append("userAvatar", userAvatar);
				UserFactory.modifyAvatar($scope.currentUser.userName, formData, mode)
					.then(function (response) {
						// success
						updatedUser = response.data.responseObject;
						$scope.currentUser = updatedUser;
						if (!$scope.currentUser.userAvatar.includes("decache")) {
							$scope.currentUser.userAvatar += "?decache=" + (new Date().toString());
						}
						$scope.tempUser = angular.copy(updatedUser);
						$scope.sessionData.currentUser = updatedUser;
						CacheService.setSession($scope.sessionData);
						$('#uploadAvatar').modal('hide');
						if (mode == "add") {
							alert("Profile picture set successfully!");
						} else {
							alert("Profile picture updated successfully!");
						}
						$timeout(function () {
							$route.reload();
						}, 1000);
					}, function (response) {
						// failure
						alert("Something went wrong, please try again later!");
					});
			} else {
				alert("Please select a file!");
			}
		};

		$scope.closeUploadAvatar = function () {
			$scope.tempUser = angular.copy($scope.currentUser);
			$('#uploadAvatar').modal('hide');
		};

		$scope.validateEdit = function (attribute) {
			var check = true;
			if (attribute == "user_name") {
				if ($scope.tempUser.userName == "") {
					alert("Username cannot be empty!");
					check = false;
				} else if ($scope.tempUser.userName == $scope.currentUser.userName) {
					alert("No change in username!");
					check = false;
				}
			} else if (attribute == "user_mail") {
				if ($scope.tempUser.userMail == "") {
					alert("Mail cannot be empty!");
					check = false;
				} else if ($scope.tempUser.userMail == $scope.currentUser.userMail) {
					alert("No change in mail!");
					check = false;
				}
			} else if (attribute == "user_bio") {
				if ($scope.tempUser.userBio == "") {
					alert("Bio cannot be empty!");
					check = false;
				} else if ($scope.tempUser.userBio == $scope.currentUser.userBio) {
					alert("No change in bio!");
					check = false;
				}
			} else if (attribute == "user_pswd") {
				if ($scope.tempUser.userPswd == "" || $scope.tempUser.userPswdConfirm == "" ||
					$scope.tempUser.userPswd != $scope.tempUser.userPswdConfirm) {
					alert("Passwords do not match/cannot be blank!");
					check = false;
				} else if ($scope.userCreds.userPswd == btoa($scope.tempUser.userPswd)) {
					alert("No change in password!");
					check = false;
				}
			}
			return check;
		};

		$scope.performEdit = function (attribute) {
			var check = $scope.validateEdit(attribute);
			if (check == true) {
				var updatedUser;
				if (attribute == "user_pswd") {
					$scope.tempUser.userPswd = btoa($scope.tempUser.userPswd);
					$scope.tempUser.userPswdConfirm = undefined;
				}
				UserFactory.updateUser($scope.tempUser, attribute)
					.then(function (response) {
						// success
						updatedUser = response.data.responseObject;
						$scope.currentUser = updatedUser;
						if (!$scope.currentUser.userAvatar.includes("decache")) {
							$scope.currentUser.userAvatar += "?decache=" + (new Date().toString());
						}
						$scope.tempUser = angular.copy(updatedUser);
						$scope.sessionData.currentUser = updatedUser;
						CacheService.setSession($scope.sessionData);
						if (attribute == "user_pswd") {
							$scope.userCreds = {};
							$('#editPswd').modal('hide');
							alert("Password changed successfully!");
							$scope.common.pswdCheck = false;
						} else if (attribute == "user_name") {
							CacheService.clearSession();
							$scope.$emit("showSearch", false);
							$('#editDetails').modal('hide');
							$timeout(function () {
								$location.path("/register", true).search({ value: "userNameChange" });
							}, 1000);
						} else {
							alert("Update successful!");
						}
					}, function (response) {
						// failure
						if (attribute == "user_name" &&
							response.data.responseMessage == "Integrity constraint violation") {
							alert("Username already taken, please select a different username!");
						} else {
							alert("Sorry, something went wrong!");
						}
					});
			}
		};

		$scope.closeEdit = function () {
			$scope.tempUser = angular.copy($scope.currentUser);
			$('#editDetails').modal('hide');
		};

		$scope.commenceChangePswd = function () {
			$scope.tempUser = angular.copy($scope.currentUser);
			$scope.tempUser.userPswd = "";
			$('#editPswd').modal('show');
		};

		$scope.validatePswd = function () {
			if ($scope.userCreds.userPswd != undefined && $scope.userCreds.userPswd != "") {
				$scope.userCreds.userName = $scope.tempUser.userName;
				$scope.userCreds.userPswd = btoa($scope.userCreds.userPswd);
				UserFactory.validateUser($scope.userCreds)
					.then(function (response) {
						// success
						$scope.common.pswdCheck = true;
					}, function (response) {
						// failure
						$scope.userCreds.userPswd = "";
						alert("Current password does not match!");
					});
			} else {
				alert("Password cannot be blank!");
			}
		};

		$scope.closeEditPswd = function () {
			$scope.tempUser = angular.copy($scope.currentUser);
			$scope.userCreds = {};
			$('#editPswd').modal('hide');
			$scope.common.pswdCheck = false;
		};

		$scope.$on("searchData", function (event, data) {
			$location.path("/search/" + data.type.toLowerCase() +
				"/category/" + data.category.toLowerCase() +
				"/keyword/" + data.keyword.toLowerCase(), true);
		});

		$scope.showProfile = function (index) {
			var element = "#popover" + index;
			$(element).popover("hide");
			$location.path("/profile/" + $scope.userRankings[index][0], true);
		};

		$scope.addClassQues = function (quesNum) {
			var quesId = "#quesNum" + quesNum;
			$(quesId).removeClass("profile-question-card");
			$(quesId).addClass("profile-selected-question-card");
		};

		$scope.removeClassQues = function (quesNum) {
			var quesId = "#quesNum" + quesNum;
			$(quesId).removeClass("profile-selected-question-card");
			$(quesId).addClass("profile-question-card");
		};

		$scope.addClassAns = function (quesNum) {
			var quesId = "#ansNum" + quesNum;
			$(quesId).removeClass("profile-question-card");
			$(quesId).addClass("profile-selected-question-card");
		};

		$scope.removeClassAns = function (quesNum) {
			var quesId = "#ansNum" + quesNum;
			$(quesId).removeClass("profile-selected-question-card");
			$(quesId).addClass("profile-question-card");
		};

	}]);