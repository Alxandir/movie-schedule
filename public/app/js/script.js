angular.module('myApp', []);
angular.module('myApp').controller('MainController', function ($scope, $interval, $sce, apiService) {
    $scope.selectedMovie = -1;
    $scope.selectedView = 5;
    $scope.allMovies = [];
    $scope.newFilm = {
        title:"",
        actualTitle:"",
        year:new Date().getFullYear(),
        posterURL:"",
        backgroundURL:""
    };
    $scope.films = [{}, {}];
    $scope.backgroundURL = '';
    $scope.showWarning = false;

    
    $scope.getBackground = function () {
        return {
            'background-image': 'url(' + $scope.backgroundURL + ')'
        }
    }

    $scope.getMoviePosters = function () {
        var data = {};
        if ($scope.selectedMovie > -1) {
            data.better = $scope.films[$scope.selectedMovie];
            data.worse = $scope.films[($scope.selectedMovie + 1) % 2];
        }
        apiService.post('api/filmPosters', data)
        .then(films => {
            $scope.films = films;
            $scope.selectedMovie = -1;
        }).catch(console.log);
    }

    function changeBackground() {
        if ($scope.selectedView != 1 || ($scope.selectedView == 1 && $scope.newFilm.backgroundURL == '')) {
            var index = 0;
            do {
                index = Math.floor(Math.random() * $scope.allMovies.length);
            } while (!$scope.allMovies[index].backgroundURL || $scope.allMovies[index].backgroundURL == $scope.backgroundURL)
            $scope.backgroundURL = $scope.allMovies[index].backgroundURL;
        }
    }
    
    $scope.setBackgroundImage = function (url, index, length) {
        if (url != "") {
            if(url instanceof Array) {
                if(!url[index % length] || !url[index % length].posterURL) {
                    return;
                }
                return {
                    'background-image': 'url(' + url[index % length].posterURL + ')'
                }
            }
            return {
                'background-image': 'url(' + url + ')'
            }
        } else {
            return;
        }
    }

    $scope.getAllMovies = function () {
        apiService.get('api/films')
        .then(allMovies => {
            $scope.allMovies = allMovies;
            if ($scope.selectedView == 5) {
                changeBackground();
            }
        }).catch(console.log);
    }

    $scope.submitRating = function () {
        if ($scope.selectedMovie > -1) {
            $scope.getMoviePosters();
        }
    }

    $scope.findPoster = function () {
        if ($scope.newFilm.title == '' || $scope.newFilm.year <= 1900 || $scope.newFilm.year >= 2100) {
            return;
        }
        var title = $scope.newFilm.title.replace('&', 'and');
        apiService.get('api/filmPosters?title=' + title + '&year=' + $scope.newFilm.year)
        .then(poster => {
            if (poster == 'Movie not found') {
                $scope.showWarning = true;
                $scope.newFilm.posterURL = '';
                $scope.newFilm.backgroundURL = '';
            } else {
                $scope.showWarning = false;
                $scope.newFilm.title = poster.title;
                $scope.newFilm.actualTitle = poster.title;
                $scope.newFilm.posterURL = poster.posterURL;
                $scope.newFilm.backgroundURL = poster.backgroundURL;
                $scope.backgroundURL = poster.backgroundURL;
            }
        }).catch(console.log);
    }

    $scope.add = function () {
        var data = {
            title: $scope.newFilm.actualTitle,
            year: $scope.newFilm.year,
            posterURL: $scope.newFilm.posterURL,
            backgroundURL: $scope.newFilm.backgroundURL
        };
        apiService.post('api/films', data)
        .then(() => {
            $scope.newFilm.title = "";
            $scope.newFilm.posterURL = "";
        }).catch(console.log);
    }

    $scope.returnToAdd = function () {
        if ($scope.newFilm.backgroundURL != '') {
            $scope.backgroundURL = $scope.newFilm.backgroundURL;
        }
    }
    
    $scope.getCalendar = function () {
        $scope.$broadcast ('getCalendar');
    }

    $scope.getComingSoonCalendar = function () {
        $scope.$broadcast ('getComingSoonCalendar');
    }
    
    $scope.getHistory = function () {
        $scope.$broadcast ('getHistory');
    }
    
    $scope.getFeatured = function () {
        $scope.$broadcast ('getFeaturedMovies');
    }

    $scope.getAllMovies();
    $interval(changeBackground, 20000);
});

angular.module('myApp').directive('dlEnterKey', function () {
    return function (scope, element, attrs) {

        element.bind("keydown keypress", function (event) {
            var keyCode = event.which || event.keyCode;

            // If enter key is pressed
            if (keyCode === 13) {
                scope.$apply(function () {
                    // Evaluate the expression
                    scope.$eval(attrs.dlEnterKey);
                });

                event.preventDefault();
            }
        });
    };
});

angular.module('myApp').directive('onErrorMovie', function ($http, apiService) {
    return {
        link: function (scope, element, attrs) {
            element.bind('error', function () {
                var movie = JSON.parse(attrs.onErrorMovie);
                var searchYear = attrs.year;
                var searchTitle = movie.title;
                if (searchTitle.endsWith(': Unlimited Screening')) {
                    searchTitle = searchTitle.split(': Unlimited Screening')[0];
                }
                searchTitle = searchTitle.replace('&','and');
                searchTitle = searchTitle.replace('SubM4J ', '');
                searchTitle = searchTitle.replace('M4J ', '');
                searchTitle = searchTitle.replace('(4DX) ', '');
                searchTitle = searchTitle.replace('Classic Movie Monday ', '');
                searchTitle = searchTitle.split(' + ')[0];
                apiService.get('api/filmPosters?title=' + searchTitle + '&year=' + searchYear)
                .then(poster => {
                    if (poster === 'Movie not found') {
                        console.log('Unable to find poster for movie: ', searchTitle);
                    } else {
                        if (poster.posterURL != null) {
                            attrs.$set('src', poster.posterURL);
                        }
                    }
                }).catch(console.log);
            });
        }
    }
});
