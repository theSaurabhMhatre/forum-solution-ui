var app = angular.module("forumApp");

app.controller("registerController", ["$scope", "CacheService", "UserFactory", "QuestionFactory", "AnswerFactory",
                                      function($scope, CacheService, UserFactory, QuestionFactory, AnswerFactory) {
	
	$scope.userCreds = {
        userName: "",
        userPswd: "" 
    };
	$scope.tempUser = {
        userName: "",
        userPswd: "",
        userPswdConfirm: "",
        userMail: "",
        userBio: ""
    };
	$scope.newUser = {
        userName: "",
        userPswd: "",
        userMail: "",
        userBio: ""
    };
    $scope.sessionData = {};                                          
                                          
	$scope.init = function(){
        $scope.sessionData = CacheService.getSession();
		var loggedIn = $scope.sessionData.loggedIn;
		if(loggedIn){
			location.replace("#!home");
		}
	};
	
	$scope.validateUser = function(){
        if($scope.userCreds.userName != "" && $scope.userCreds.userPswd != ""){
        	$scope.userCreds.userPswd = btoa($scope.userCreds.userPswd);
            UserFactory.validateUser($scope.userCreds)
            .then(function(response){
                // success
                $scope.sessionData = CacheService.common;
                $scope.sessionData.currentUser = response.data.responseObject;
                $scope.sessionData.loggedIn = true;
                CacheService.setSession($scope.sessionData);
                location.replace("#!home");
            }, function(response){
                // failure
                $scope.resetCreds();
                alert("Invalid username and/or password!");
            });
        } else {
            alert("Username and/or password cannot be blank!");
        }
	};
	
	$scope.resetCreds = function(){
        $scope.userCreds = {
            userName: "",
            userPswd: "" 
        };
	};

	$scope.registerUser = function(){
		if($scope.tempUser.userPswd != "" && $scope.tempUser.userPswdConfirm != "" && 
           $scope.tempUser.userPswd == $scope.tempUser.userPswdConfirm){
            if($scope.tempUser.userName != "" && $scope.tempUser.userPswd != "" && 
               $scope.tempUser.userMail != "" && $scope.tempUser.userBio != ""){
                $scope.newUser.userName = $scope.tempUser.userName;
                $scope.newUser.userPswd = $scope.tempUser.userPswd;
                $scope.newUser.userMail = $scope.tempUser.userMail;
                $scope.newUser.userBio = $scope.tempUser.userBio;
                $scope.newUser.userPswd = btoa($scope.newUser.userPswd);
                UserFactory.addUser($scope.newUser)
                .then(function(response){
                    // success
                    $scope.resetTempUser();
                    $('#myModal').modal('hide');
                    alert("Account created successfully! Please Login to continue.");
                }, function(response){
                    // failure
                    $scope.resetTempUser();
                    alert("Sorry, something went wrong!");
                });                
            } else {
                alert("All fields are mandatory!");
            }
		} else {
			alert("Passwords do not match/cannot be blank!");
		}
	};
	
	$scope.cancelRegistration = function(){
        $scope.resetTempUser();
		$('#myModal').modal('hide');
	};
                                          
    $scope.resetTempUser = function(){
        $scope.tempUser = {
            userName: "",
            userPswd: "",
            userPswdConfirm: "",
            userMail: "",
            userBio: ""
        };        
    };                                      
	
}]);