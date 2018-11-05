angular.module('myApp').controller('OverviewController', function ($scope, $rootScope, $sce, apiService) {
    $scope.features = {
        nowBooking: [],
        comingSoon: []
    };
    $scope.featureGrid = [];
    $scope.selectedFeaturedTab = "SHOWING";
    $scope.selectedTrailer = '';
    $scope.enableYoutube = false;
    $scope.lastUpdate = {
        SHOWING: 0,
        FUTURE: 0
    };

    $scope.$on('getFeaturedMovies', function (e) {
        $scope.getFeaturedMovies();
    });

    $scope.getFeaturedMovies = function () {
        if (!$rootScope.siteId) {
            return apiService.get('api/groups').then(group => {
                $rootScope.siteId = group.siteId;
                getFeaturedMoviesInner();
            }).catch(err => {
                console.error(err);
            });
        }
        getFeaturedMoviesInner();
    }

    function getFeaturedMoviesInner() {
        var currentTime = new Date().getTime();
        var currentKey = $scope.selectedFeaturedTab;
        if ($scope.features[currentKey] == null || (currentTime - $scope.lastUpdate[currentKey] > (10 * 60 * 1000))) {
            $scope.lastUpdate[currentKey] = currentTime;
            apiService.get(`api/cineworld/featured?type=${$scope.selectedFeaturedTab}&siteId=${$rootScope.siteId}`)
            .then(movies => {
                $scope.features[currentKey] = movies;
                $scope.generateGrid($scope.features[currentKey]);
            }).catch(console.log);
        } else {
            $scope.generateGrid($scope.features[currentKey]);
        }
    }

    $scope.pauseVideo = function () {
        var iframe = document.getElementsByTagName("iframe")[0].contentWindow;
        iframe.postMessage('{"event":"command","func":"' + 'pauseVideo' + '","args":""}', '*');
        $scope.enableYoutube = false;
    }

    $scope.setTrailerURL = function (title) {
        if (title.endsWith(': Unlimited Screening')) {
            title = title.split(': Unlimited Screening')[0];
        }
        title += " movie";
        title = title.replace(/&/g, "and")
        $scope.selectedTrailer = $sce.trustAsResourceUrl("https://www.youtube.com/embed/?listType=search&list=" + encodeURI(title));
        $scope.enableYoutube = true;
    }

    $scope.generateGrid = function (movies) {
        var rows = movies.length / 5;
        rows = Math.ceil(rows * 1);
        $scope.featureGrid = [];
        for (var rowIndex = 0; rowIndex < rows; rowIndex++) {
            var firstIndex = rowIndex * 5;
            var remainder = movies.length - (firstIndex + 1);
            if (remainder > 5) {
                remainder = 5;
            }
            $scope.featureGrid.push(movies.slice(firstIndex, firstIndex + remainder));
        }
    }
});
