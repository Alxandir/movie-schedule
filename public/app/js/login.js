angular.module('loginApp', []);
angular.module('loginApp').controller('LoginController', function ($scope, $interval, apiService) {
    $scope.currentBackgroundMovie;
    $scope.backgroundURL = '';

    $scope.getBackground = function () {
        return {
            'background-image': 'url(' + $scope.backgroundURL + ')'
        }
    }

    function changeBackground() {
        apiService.get('api/films' + ($scope.currentBackgroundMovie ? '?prev=' + $scope.currentBackgroundMovie.offset : ''))
            .then(results => {
                $scope.currentBackgroundMovie = results[0];
                $scope.backgroundURL = $scope.currentBackgroundMovie.backgroundURL;
            }).catch(console.log);
    }

    changeBackground();
    $interval(changeBackground, 20000);
});