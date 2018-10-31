angular.module('reg')
  .controller('AdminUserCtrl',[
    '$scope',
    '$http',
    'user',
    'UserService',
    function($scope, $http, User, UserService){
      $scope.selectedUser = User.data;
      $scope.password = '';
      $scope.specialRegistered = $scope.selectedUser.specialRegistration ? 'Special registration' : 'Normal registration'

      // Populate the school dropdown
      populateSchools();

      /**
       * TODO: JANK WARNING
       */
      function populateSchools(){

        $http
          .get('/assets/schools.json')
          .then(function(res){
            var schools = res.data;
            var email = $scope.selectedUser.email.split('@')[1];

            if (schools[email]){
              $scope.selectedUser.profile.school = schools[email].school;
              $scope.autoFilledSchool = true;
            }

          });
      }


      $scope.updateProfile = function(){
        UserService
          .adminUpdateProfile($scope.selectedUser._id, $scope.selectedUser.profile)
          .success(function(data){
            $selectedUser = data;
            swal("Updated!", "Profile updated.", "success");
          })
          .error(function(err){
            console.log(err)
            swal("Oops, something went wrong.");
          });
      };

      $scope.updateEmail = function() {
        UserService
          .updateEmail($scope.selectedUser._id, $scope.selectedUser.email)
          .success(function(data) {
            $selectedUser = data;
            swal("Updated", "Email updated", "success");
          })
          .error(function(err){
            swal("Oops, something went wrong.", err.message);
          });
      }

      $scope.sendPasswordResetEmail = function() {
        UserService
          .sendPasswordResetEmail($scope.selectedUser._id)
          .success(function(data) {
            swal("Sent!", "Password reset email sent to user", "success");
          })
          .error(function(err){
            swal("Oops, something went wrong.", err.message);
          });
      }

      $scope.toggleSpecialRegistration = function() {
        UserService
          .toggleSpecialRegistration($scope.selectedUser._id, $scope.selectedUser.specialRegistration)
          .success(function(data) {
            $scope.selectedUser = data;
            swal("Updated", "Secret registration status updated", "success");
          })
          .error(function(err){
            swal("Oops, something went wrong.", err.message);
          });
      }
      
      $scope.changeUserPassword = function(){
        if($scope.password.length < 6) {
          swal('Password too short')
        }
        else {
          UserService
            .changeUserPassword($scope.selectedUser._id, $scope.password)
            .success(function(data){
              $selectedUser = data;
              swal("Updated!", "Password changed.", "success");
            })
            .error(function(err){
              console.log(err)
              swal("Oops, something went wrong.");
            });
        }
      };
      

    }]);