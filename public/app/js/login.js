angular.module('loginApp', []);
angular.module('loginApp').controller('LoginController', function ($scope, $interval, apiService) {
    $scope.allMovies = [];
    $scope.backgroundURL = '';

    $scope.getAllMovies = function () {
        apiService.get('api/films')
        .then(allMovies => {
            $scope.allMovies = allMovies;
            changeBackground();
        }).catch(console.log);
    }

    $scope.getBackground = function () {
        return {
            'background-image': 'url(' + $scope.backgroundURL + ')'
        }
    }

    function changeBackground() {
        var index = 0;
        do {
            index = Math.floor(Math.random() * $scope.allMovies.length);
        } while (!$scope.allMovies[index].backgroundURL || $scope.allMovies[index].backgroundURL == $scope.backgroundURL)
        $scope.backgroundURL = $scope.allMovies[index].backgroundURL;
    }

    $scope.getAllMovies();
    $interval(changeBackground, 20000);
});