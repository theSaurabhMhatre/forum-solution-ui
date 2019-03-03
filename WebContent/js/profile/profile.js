var app = angular.module("forumApp");

app.controller("profileController", ["$scope", "CacheService", "UserFactory", "QuestionFactory", "AnswerFactory",
                                  function($scope, CacheService, UserFactory, QuestionFactory, AnswerFactory) {
	
	$scope.currentUser = {};
	$scope.tempUser = {};
    $scope.userRankings = [];
    $scope.sessionData = {};     
    $scope.askedQuestions = [];
    $scope.answeredQuestions = [];
    $scope.userCreds = {};
    $scope.common = {
    	pswdCheck: false	
    };
	
	$scope.init = function(){
        $scope.sessionData = CacheService.getSession();
		var loggedIn = $scope.sessionData.loggedIn;
		if(loggedIn){
			$scope.currentUser = $scope.sessionData.currentUser;
			$scope.tempUser = angular.copy($scope.currentUser);
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
	
	$scope.commenceEdit = function(){
		$scope.tempUser = angular.copy($scope.currentUser);
		$('#editDetails').modal('show');
	};
	
	$scope.validateEdit = function(attribute){
		var check = true;
		if(attribute == "name"){
			if($scope.tempUser.userName == ""){
				alert("Username cannot be empty!");
				check = false;
			} else if($scope.tempUser.userName == $scope.currentUser.userName){
				alert("No change in username!");
				check = false;
			} 
		} else if(attribute == "mail"){
			if($scope.tempUser.userMail == ""){
				alert("Mail cannot be empty!");
				check = false;
			} else if($scope.tempUser.userMail == $scope.currentUser.userMail){
				alert("No change in mail!");
				check = false;
			} 
		} else if(attribute == "bio"){
			if($scope.tempUser.userBio == ""){
				alert("Bio cannot be empty!");
				check = false;
			} else if($scope.tempUser.userBio == $scope.currentUser.userBio){
				alert("No change in bio!");
				check = false;
			} 
		} else if(attribute == "pswd"){
			if($scope.tempUser.userPswd == "" || $scope.tempUser.userPswdConfirm == "" || 
			           $scope.tempUser.userPswd != $scope.tempUser.userPswdConfirm){
				alert("Passwords do not match/cannot be blank!");
				check = false;
			} else if($scope.userCreds.userPswd == btoa($scope.tempUser.userPswd)){
				alert("No change in password!");
				check = false;
			} 
		}
		return check;
	};
	
	$scope.performEdit = function(attribute){
		var check = $scope.validateEdit(attribute);
		if(check == true){
			var updatedUser;
			if(attribute == "pswd"){
				$scope.tempUser.userPswd = btoa($scope.tempUser.userPswd);
				$scope.tempUser.userPswdConfirm = undefined;
			}
			UserFactory.updateUser($scope.tempUser, attribute)
			.then(function(response){
				// success
				updatedUser = response.data.responseObject;
				$scope.currentUser = updatedUser;
				$scope.tempUser = angular.copy(updatedUser);	
				$scope.sessionData.currentUser = updatedUser;
				CacheService.setSession($scope.sessionData);
				if(attribute == "pswd"){
					$scope.userCreds = {};
					$('#editPswd').modal('hide');
					alert("Password changed successfully!");
					$scope.common.pswdCheck = false;
				} else {
					alert("Update successful!");
				}
			}, function(response){
				// failure
				if(attribute == "name" && 
						response.data.responseMessage == "Integrity constraint violation"){
					alert("Username already taken, please select a different username!");
				} else {
					alert("Sorry, something went wrong!");
				}
			});
		}
	};
	
	$scope.closeEdit = function(){
		$scope.tempUser = angular.copy($scope.currentUser);
		$('#editDetails').modal('hide');
	};
	
	$scope.commenceChangePswd = function(){
		$scope.tempUser = angular.copy($scope.currentUser);
		$scope.tempUser.userPswd = "";
		$('#editPswd').modal('show');
	};	
	
	$scope.validatePswd = function(){
		if($scope.userCreds.userPswd != undefined && $scope.userCreds.userPswd != ""){
			$scope.userCreds.userName = $scope.tempUser.userName;
	    	$scope.userCreds.userPswd = btoa($scope.userCreds.userPswd);
	        UserFactory.validateUser($scope.userCreds)
	        .then(function(response){
	            // success
	        	$scope.common.pswdCheck = true;
	        }, function(response){
	            // failure
	        	$scope.userCreds.userPswd = "";
	            alert("Current password does not match!");
	        });
		} else {
			alert("Password cannot be blank!");
		}
	};
	
	$scope.closeEditPswd = function(){
		$scope.tempUser = angular.copy($scope.currentUser);
		$scope.userCreds = {};
		$('#editPswd').modal('hide');
		$scope.common.pswdCheck = false;
	};
    
    $scope.$on("searchData", function(event, data){
    	$scope.sessionData.search = data;
    	CacheService.setSession($scope.sessionData);
        location.replace("#!search");
    });                                

}]);