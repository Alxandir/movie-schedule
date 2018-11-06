angular.module('myApp').controller('HistoryController', function ($scope, $http, $interval, $sce, apiService) {
    $scope.history = {
        bookings: [],
        upcomingBookings: [],
        pastBookings: []
    };

    $scope.$on('getHistory', function(e) {  
        $scope.getHistory();        
    });
    
    $scope.getHistory = function () {
        apiService.get('api/cinemas/bookings')
        .then(bookings => {
            $scope.history.bookings = bookings;
            $scope.history.pastBookings = [];
            var currentDate = new Date().getTime();
            $scope.history.upcomingBookings = bookings.filter(p => p.timestamp >= currentDate);
            $scope.history.pastBookings = bookings.filter(p => p.timestamp < currentDate);
        }).catch(console.log);
    }
});
