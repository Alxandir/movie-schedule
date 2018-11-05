angular.module('myApp').controller('SignUpController', function ($scope, apiService) {
    $scope.$on('getCinemas', function (e) {
        $scope.getCinemas();
    });

    $scope.$on('createSignupForm', function (e) {
        createForm();
    });

    function createForm() {
        const displayName = sessionStorage.getItem('userName');
        $scope.newUser = {
            googleID: sessionStorage.getItem('userId'),
            image: sessionStorage.getItem('userImg'),
            firstName: displayName.split(' ')[0],
            lastName: displayName.split(' ')[1],
            siteId: '10108',
            isNewGroup: 'true',
            groupName: ''
        }
    }

    $scope.submitNewUser = function() {
        const user = {
            firstName: $scope.newUser.firstName,
            lastName: $scope.newUser.lastName,
            googleID: $scope.newUser.googleID,
            image: $scope.newUser.image,
            group: $scope.newUser.group,
            groupName: $scope.newUser.groupName,
            siteId: $scope.newUser.siteId
        }
        apiService.post('/api/users', user).then(result => {
            $scope.$emit('goHome');
        }).catch(err => {
            console.log(err);
        });
    }

    $scope.checkGroup = function(group) {
        apiService.get('/api/groups/' + group).then(result => {
            $scope.newUser.invalidGroup = false;
            $scope.newUser.groupName = result.name;
        }).catch(err => {
            if(err.status === 404) {
                $scope.newUser.invalidGroup = true;
            }
        })
    }

    $scope.getCinemas = function () {
        // get list of cinema IDs
    }

    $scope.getCinemas();
});
