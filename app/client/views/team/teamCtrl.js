angular.module('reg')
  .controller('TeamCtrl', [
    '$scope',
    'currentUser',
    'settings',
    'Utils',
    'UserService',
    'TEAM',
    function($scope, currentUser, settings, Utils, UserService, TEAM){

      //icon tooltip popup
      $('.icon')
      .popup({
        on: 'hover'
      });

      // Get the current user's most recent data.
      var Settings = settings.data;
      $scope.regIsOpen = true; // Don't change, at least yet.
      $scope.pastReg = Settings.timeClose < new Date().getTime()
      $scope.user = currentUser.data;
      $scope.fieldErrors = undefined
      $scope.error = undefined
      $scope.TEAM = TEAM;

      function _populateTeammates(){
        UserService
          .getMyTeammates()
          .success(function(users){
            $scope.error = null;
            $scope.teammates = users;
          })
          .error(function(res){
            $scope.error = res.message;
          });
      }
      function _getTeamInfo(){
        UserService
          .getTeamInfo()
          .success(function(team) {
            $scope.teamLeader = team.leader;
            $scope.teamLocked = team.teamLocked;
            $scope.teamInterests = team.trackInterests;
            $scope.firstPriorityTrack = team.firstPriorityTrack;
            $scope.secondPriorityTrack = team.secondPriorityTrack;
            $scope.thirdPriorityTrack = team.thirdPriorityTrack;
            $scope.assignedTrack = team.assignedTrack;
            _setupForm();
          })
          .error(function(res){
            $scope.error = res.message;
          });
      }
      if ($scope.user.team){
        _populateTeammates();
        _getTeamInfo();
      }

      $scope.joinTeam = function(){
        UserService
          .joinTeam($scope.code)
          .success(function(user){
            $scope.error = null;
            $scope.user = user;
            _populateTeammates();
            _getTeamInfo();
          })
          .error(function(res){
            $scope.error = res.message;
          });
      };

      $scope.createTeam = function() {
        UserService
          .createTeam()
          .success(function(user) {
            $scope.error = null;
            $scope.user = user;
            _populateTeammates();
            _getTeamInfo();
          })
          .error(function(res){
            $scope.error = res.message;
          });
      }

      $scope.leaveTeam = function(){
        UserService
          .leaveTeam()
          .success(function(user){
            $scope.error = null;
            $scope.user = user;
            $scope.teammates = [];
            $("#teamInterests").dropdown('set selected', "");
          })
          .error(function(res){
            $scope.error = res.data.message;
          });
      };

      $scope.lockTeam = function(){
        if($('#lockingForm').form('is valid')){
          $scope.error = null
          $scope.fieldErrors = null
          swal({
            title: "Are you sure?",
            text: "Do you have all members in the team?\n This will lock in your team, new members won't be able to join the team anymore after it is locked.",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, lock the team.",
            closeOnConfirm: true
            }, function(){
              UserService
                .lockTeam($scope.teamInterests)
                .success(function(team) {
                  $scope.teamLocked = team.teamLocked
                })
                .error(function(res){
                  $scope.error = res.data.message;
                });
          })
        } else {
          $('#lockingForm').form('validate form')
        }
      }

      $scope.updatePriorities = function(){
        if($('#priorityForm').form('is valid')){
          $scope.error = null
          $scope.fieldErrors = null
          const priorities = {
            firstPriorityTrack: $scope.firstPriorityTrack,
            secondPriorityTrack: $scope.secondPriorityTrack,
            thirdPriorityTrack: $scope.thirdPriorityTrack
          }
          console.log('hm')
          UserService
            .updatePriorities(priorities)
            .success(function(team) {
              $scope.firstPriorityTrack = team.firstPriorityTrack;
              $scope.secondPriorityTrack = team.secondPriorityTrack;
              $scope.thirdPriorityTrack = team.thirdPriorityTrack;
              swal("Success!", "Your team's track priorities have been updated.")
            })
            .error(function(res){
              $scope.error = res.data.message;
            });
        } else {
          $('#priorityForm').form('validate form')
        }
      }

      $scope.kickFromTeam = function(user){
        swal({
          title: "Are you sure?",
          text: `Do you want to kick ${user.profile.name} from your team?`,
          type: "warning",
          showCancelButton: true,
          confirmButtonColor: "#DD6B55",
          confirmButtonText: "Yes, I'm sure.",
          closeOnConfirm: true
          }, function(){
            UserService
              .kickFromTeam(user.id)
              .success(function(team) {
                _populateTeammates()
              })
              .error(function(res){
                $scope.error = res.data.message;
              });
        });
      }

      function _setupForm() {
        /*
          $('#lockingForm')
          .form({
            fields: {
              teamInterests:  {
                identifier: 'teamInterests',
                rules: [
                  {
                    type: 'maxCount[3]',
                    prompt: 'You can select max 3 tracks!'
                  },
                  {
                    type: 'empty',
                    prompt: 'Please select at least one track'
                  }
                ]
              }
            },
            onFailure: function(formErrors, fields){
              $scope.fieldErrors = formErrors;
              $scope.error = 'There is error in the field above!';
            }
          })
          $("#teamInterests").dropdown('set selected', $scope.teamInterests); */
        var priorityRules = []
        if ($scope.teamLeader == $scope.user.id) {
          priorityRules = [{
            type: 'empty',
            prompt: 'As a team leader you have to pick a track for this priority!'
          }]
        }
        $('#priorityForm').form({
          inline:true,
          fields: {
            firstPrio: {
              identifier: 'firstPrioTrack',
              rules: priorityRules
            },
            secondPrio: {
              identifier: 'secondPrioTrack',
              rules: priorityRules
            },
            thirdPrio: {
              identifier: 'thirdPrioTrack',
              rules: priorityRules
            }
            },
            onSuccess: function(event, fields){
              console.log('gaff')
              $("#firstPrioTrack").dropdown('set selected', $scope.firstPriorityTrack);
              $("#secondPrioTrack").dropdown('set selected', $scope.secondPriorityTrack);
              $("#thirdPrioTrack").dropdown('set selected', $scope.thirdPriorityTrack);
            },
          onFailure: function(formErrors, fields){
            console.log('guff')
            $scope.fieldErrors = formErrors;
            $scope.error = 'There were errors in your application. Please check that you filled all required fields.';
        }
        
        });
      }

      _setupForm()
    }]);
