angular.module('myApp').controller('SignUpController', function ($scope, $q, apiService) {
    $scope.cinemas = [];

    $scope.$on('getCinemas', function (e) {
        $scope.getCinemas();
    });

    $scope.$on('createSignupForm', function (e) {
        $scope.getCinemas();
        createForm();
    });

    function createForm() {
        const displayName = sessionStorage.getItem('userName');
        $scope.newUser = {
            googleID: sessionStorage.getItem('userId'),
            image: sessionStorage.getItem('userImg'),
            firstName: displayName.split(' ')[0],
            lastName: displayName.split(' ')[1],
            cinema: {
                id: '',
                name: ''
            },
            isNewGroup: true,
            groupName: '',
            invalidGroup: true
        }
    }

    $scope.submitNewUser = function () {
        if(!$scope.checkRegister()) {
            return;
        }
        const user = {
            firstName: $scope.newUser.firstName,
            lastName: $scope.newUser.lastName,
            googleID: $scope.newUser.googleID,
            image: $scope.newUser.image,
            group: $scope.newUser.group,
            groupName: $scope.newUser.groupName,
            siteId: $scope.newUser.siteId,
            siteName: $scope.newUser.siteName
        }
        apiService.post('/api/users', user).then(result => {
            $scope.$emit('goHome');
        }).catch(err => {
            console.log(err);
        });
    }

    $scope.checkGroup = function (group) {
        if(group.length === 0) {
            return;
        }
        apiService.get('/api/groups/' + group).then(result => {
            $scope.newUser.invalidGroup = false;
            $scope.newUser.groupName = result.name;
        }).catch(err => {
            if (err.status === 404) {
                $scope.newUser.invalidGroup = true;
            }
        })
    }

    $scope.changedGroupID = function() {
        $scope.newUser.invalidGroup = true;
    }

    $scope.getCinemas = function () {
        apiService.get('/api/cinemas/venues').then(result => {
            $scope.cinemaNames = result.map(p => p.displayName);
            $scope.cinemas = result;
        }).catch(err => {
            console.log(err);
        })
    }

    $scope.filterList = function (input, list) {
        var defer = $q.defer();
        let newList = list.filter(item => item.toLowerCase().startsWith(input.toLowerCase()));
        defer.resolve(newList);
        return defer.promise;
    };

    $scope.checkRegister = function () {
        if(!$scope.newUser) {
            return false;
        }
        if ($scope.newUser.firstName.length === 0 || $scope.newUser.lastName.length === 0) {
            return false;
        }
        if ($scope.newUser.isNewGroup) {
            const cinema = $scope.cinemas.find(p => p.displayName === $scope.newUser.siteName);
            if (!cinema || $scope.newUser.groupName.length === 0) {
                return false;
            }
        } else if ($scope.newUser.invalidGroup || $scope.newUser.group.length === 0) {
            return false;
        }

        return true;
    }

    $scope.cinemaSelected = function (item) {
        if($scope.newUser) {
            $scope.newUser.siteName = item;
            $scope.newUser.siteId = $scope.cinemas.find(p => p.displayName === item).id;
        }
    }
});
