var app = angular.module("forumApp");

app.controller("registerController", ["$scope", "$location", "CacheService", "UserFactory", "QuestionFactory", "AnswerFactory",
    function ($scope, $location, CacheService, UserFactory, QuestionFactory, AnswerFactory) {

        $scope.sessionData = {};
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

        $scope.init = function () {
            $scope.sessionData = CacheService.getSession();
            var loggedIn = $scope.sessionData.loggedIn;
            if (loggedIn) {
                $location.path("/home/all", true);
            } else {
                var queryParams = $location.search();
                if (queryParams.value != undefined && queryParams.value != null) {
                    if (queryParams.value == "signUp") {
                        $("#myModal").modal("show");
                    } else if (queryParams.value == "userNameChange") {
                        alert("As you changed you username, please sign in again!");
                    }
                }
            }
        };

        $scope.validateUser = function () {
            if ($scope.userCreds.userName != "" && $scope.userCreds.userPswd != "") {
                $scope.userCreds.userPswd = btoa($scope.userCreds.userPswd);
                UserFactory.validateUser($scope.userCreds)
                    .then(function (response) {
                        // success
                        $scope.sessionData = CacheService.common;
                        $scope.sessionData.currentUser = response.data.responseObject;
                        $scope.sessionData.loggedIn = true;
                        // setting user specific token
                        var token = btoa($scope.userCreds.userName + ":" + $scope.userCreds.userPswd);  
                        $scope.sessionData.token = token;
                        CacheService.setSession($scope.sessionData);
                        $scope.$emit("showSearch", true);
                        var queryParams = $location.search();
                        if (queryParams.redirect != undefined && queryParams.redirect != null &&
                            queryParams.redirect != "") {
                            var url = queryParams.redirect;
                            if (queryParams.answerQuestion != undefined && queryParams.answerQuestion != null &&
                                queryParams.answerQuestion == "true") {
                                $location.path(url, true).search({ answerQuestion: "true" });
                            } else if (queryParams.showQuestion != undefined && queryParams.showQuestion != null &&
                                queryParams.showQuestion == "true") {
                                $location.path(url, true).search({ showQuestion: "true" });
                            }
                        } else {
                            $location.path("/home/all", true);
                        }
                    }, function (response) {
                        // failure
                        $scope.resetCreds();
                        alert("Invalid username and/or password!");
                    });
            } else {
                alert("Username and/or password cannot be blank!");
            }
        };

        $scope.checkAvailability = function () {
            if ($scope.tempUser.userName != "") {
                UserFactory.checkAvailability($scope.tempUser.userName)
                    .then(function (response) {
                        // success
                        var available;
                        available = response.data.responseObject.available;
                        if (available == true) {
                            alert("Username is not available :(");
                        }
                    }, function (response) {
                        // failure
                        alert("Username is available :)");
                    });
            } else {
                alert("Username cannot be empty!");
            }
        };

        $scope.resetCreds = function () {
            $scope.userCreds = {
                userName: "",
                userPswd: ""
            };
        };

        $scope.registerUser = function () {
            if ($scope.tempUser.userPswd != "" && $scope.tempUser.userPswdConfirm != "" &&
                $scope.tempUser.userPswd == $scope.tempUser.userPswdConfirm) {
                if ($scope.tempUser.userName != "" && $scope.tempUser.userPswd != "" &&
                    $scope.tempUser.userMail != "" && $scope.tempUser.userBio != "") {
                    var available;
                    UserFactory.checkAvailability($scope.tempUser.userName)
                        .then(function (response) {
                            // success
                            available = response.data.responseObject.available;
                            if (available == true) {
                                alert("Username is not available :(");
                            }
                        }, function (response) {
                            // failure
                            $scope.newUser.userName = $scope.tempUser.userName;
                            $scope.newUser.userPswd = $scope.tempUser.userPswd;
                            $scope.newUser.userMail = $scope.tempUser.userMail;
                            $scope.newUser.userBio = $scope.tempUser.userBio;
                            $scope.newUser.userPswd = btoa($scope.newUser.userPswd);
                            UserFactory.addUser($scope.newUser)
                                .then(function (response) {
                                    // success
                                    $scope.resetTempUser();
                                    $("#myModal").modal("hide");
                                    alert("Account created successfully! Please Login to continue.");
                                }, function (response) {
                                    // failure
                                    $scope.resetTempUser();
                                    alert("Sorry, something went wrong!");
                                });
                        });
                } else {
                    alert("All fields are mandatory!");
                }
            } else {
                alert("Passwords do not match/cannot be blank!");
            }
        };

        $scope.cancelRegistration = function () {
            $scope.resetTempUser();
            $("#myModal").modal("hide");
        };

        $scope.resetTempUser = function () {
            $scope.tempUser = {
                userName: "",
                userPswd: "",
                userPswdConfirm: "",
                userMail: "",
                userBio: ""
            };
        };

        $scope.skip = function () {
            $location.path("/home/all", true);
        };

    }]);