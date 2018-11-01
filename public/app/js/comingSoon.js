angular.module('myApp').controller('ComingSoonController', function ($scope, $http, $interval, $sce, apiService) {
    $scope.enableShadow = false;
    $scope.enableYoutube = false;
    $scope.init = false;
    $scope.calendarMovies = {};
    $scope.scrollingIndex = 0;
    $scope.today = {
        day: new Date().getDate(),
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
    };
    $scope.calendar = {
        weeks: [],
        month: $scope.today.month,
        year: $scope.today.year
    };

    $scope.monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    $scope.dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday",
        "Saturday"
    ];
    $scope.$on('getComingSoonCalendar', function (e) {
        $scope.getComingSoonCalendar();
    });

    $interval(() => {
        $scope.scrollingIndex++;
        $scope.scrollingIndex = $scope.scrollingIndex % 30;
    },8000);

    $scope.getComingSoonCalendar = function () {
        if(Object.keys($scope.calendarMovies).length > 0) {
            buildMonth();
            return;
        }
        apiService.get('api/cineworld/featured?type=SHOWING')
        .then(outNowRaw => {
            let outNow = outNowRaw.sort(sortMovies);
            for(movie of outNow) {
                addCalendarItem(movie);
            }
            apiService.get('api/cineworld/featured?type=FUTURE')
            .then(futureRaw => {
                let future = futureRaw.sort(sortMovies);
                for(movie of future) {
                    addCalendarItem(movie);
                }
                buildMonth();
            });
        }).catch(err => {
            console.log(err);
        });
    }

    function buildMonth() {
        var totalDays = daysInMonth($scope.calendar.year, $scope.calendar.month);
        var dayOne = new Date($scope.calendar.year, $scope.calendar.month - 1, 1);
        var dayIndex = dayOne.getDay();
        var weekOne = [];
        for (var i = 0; i < 7; i++) {
            weekOne.push({
                number: "",
                movies: []
            });
        }
        $scope.calendar.weeks = [];
        $scope.calendar.weeks.push(weekOne);
        var weekIndex = 0;
        let section = ($scope.calendar.year * 100) + $scope.calendar.month
        for (var i = 1; i <= totalDays; i++) {
            $scope.calendar.weeks[weekIndex][dayIndex].number = i;
            if ($scope.calendarMovies[section] && $scope.calendarMovies[section][i]) {
                $scope.calendar.weeks[weekIndex][dayIndex].movies = $scope.calendarMovies[section][i];
            }
            dayIndex = (dayIndex + 1) % 7;
            if (dayIndex == 0) {
                weekIndex++;
                var newWeek = [];
                for (var j = 0; j < 7; j++) {
                    newWeek.push({
                        number: "",
                        movies: []
                    });
                }
                $scope.calendar.weeks.push(newWeek);
            }
        }
    }

    function sortMovies (a, b) {
        var nameA = a.date.toUpperCase(); // ignore upper and lowercase
        var nameB = b.date.toUpperCase(); // ignore upper and lowercase
        if (nameA < nameB) {
            return -1;
        }
        if (nameA > nameB) {
            return 1;
        }
        return 0;
    }

    function addCalendarItem(movie) {
        let section = movie.date.substr(0,7);
        section = Number(section.split('-')[0]) * 100 + Number(section.split('-')[1]);
        let day = Number(movie.date.substr(8,2));
        if(!$scope.calendarMovies[section]) {
            $scope.calendarMovies[section] = {};
        }
        if(!$scope.calendarMovies[section][day]) {
            $scope.calendarMovies[section][day] = [];
        }
        $scope.calendarMovies[section][day].push(movie);
    }

    function daysInMonth(year, month) {
        return new Date(year, month, 0).getDate();
    }

    $scope.selectDay = function(day, movies) {
        if(movies.length > 1){
            $scope.showtimeDayNum = day;
            var dayIndex = new Date($scope.calendar.year, $scope.calendar.month - 1, day).getDay();
            $scope.showtimeDay = $scope.dayNames[dayIndex];
            $scope.selectedDayMovies = movies;
            $scope.movieGrid = [];
            let index = 0;
            for(movie of movies) {
                if(!$scope.movieGrid[index]) {
                    $scope.movieGrid.push([]);
                }
                $scope.movieGrid[index].push(movie);
                if($scope.movieGrid[index].length >= 3) {
                    index++;
                }
            }
            $scope.enableShadow = true;
        } else if (movies.length > 0) {
            $scope.setTrailerURL(movies[0].title + ' ' + movies[0].date.split('-')[0]);
        }
    }

    $scope.incrementDate = function () {
        $scope.calendar.month++;
        if ($scope.calendar.month > 12) {
            $scope.calendar.month = 1;
            $scope.calendar.year++;
        }
        buildMonth();
    }

    $scope.decrementDate = function () {
        $scope.calendar.month--;
        if ($scope.calendar.month < 1) {
            $scope.calendar.month = 12;
            $scope.calendar.year--;
        }
        buildMonth();
    }

    $scope.checkIfToday = function (day) {
        if ($scope.today.day == day && $scope.today.month == $scope.calendar.month && $scope.today.year == $scope.calendar.year) {
            return true;
        }
        return false;
    }

    $scope.setTrailerURL = function (input) {
        let title = '';
        if(input instanceof Array) {
            title = input[0].title;
        } else {
            title = input;
        }
        if (title.endsWith(': Unlimited Screening')) {
            title = title.split(': Unlimited Screening')[0];
        } else if (title.endsWith(': Secret Unlimited Screening')) {
            title = title.split(': Secret Unlimited Screening')[0];
        }
        title += " movie";
        title = title.replace(/&/g, "and")
        $scope.selectedTrailer = $sce.trustAsResourceUrl("https://www.youtube.com/embed/?listType=search&list=" + encodeURI(title));
        $scope.enableYoutube = true;
    }

    $scope.pauseVideo = function () {
        var iframe = document.getElementsByTagName("iframe")[0].contentWindow;
        iframe.postMessage('{"event":"command","func":"' + 'pauseVideo' + '","args":""}', '*');
        $scope.enableYoutube = false;
    }
});
