angular.module('myApp').controller('LeaderboardController', function ($scope, apiService) {
    $scope.leaderboardMovies = [];

    $scope.$on('getLeaderboard', function(e) {  
        $scope.getLeaderboard();        
    });
    
    $scope.getLeaderboard = function () {
        apiService.get('api/films?size=all')
        .then(movies => {
            $scope.leaderboardMovies = movies;
        }).catch(console.log);
    }
});
