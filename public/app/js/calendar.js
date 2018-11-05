angular.module('myApp').controller('CalendarController', function ($scope, $rootScope, $sce, apiService) {
    $scope.enableShadow = false;
    $scope.enableYoutube = false;
    $scope.init = false;
    $scope.showtimeMovies = [];
    $scope.showtimeDay = "";
    $scope.showtimeDayNum = 0;
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
    $scope.validDates = [];

    $scope.showPlayIcon = [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false];

    $scope.monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    $scope.dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday",
        "Saturday"
    ];
    $scope.$on('getCalendar', function (e) {
        $scope.getCalendar();
    });

    $scope.getCalendar = function () {
        if (!$rootScope.siteId) {
            return apiService.get('api/groups').then(group => {
                $rootScope.siteId = group.siteId;
                getCalendarInner();
            }).catch(err => {
                console.error(err);
            });
        }
        getCalendarInner();
    }

    function getCalendarInner() {
        const totalDays = daysInMonth($scope.calendar.year, $scope.calendar.month);
        const dayOne = new Date($scope.calendar.year, $scope.calendar.month - 1, 1);
        let dayIndex = dayOne.getDay();
        $scope.calendar.weeks = generateEmptyCalendar($scope.calendar.year, $scope.calendar.month);
        let weekIndex = 0;

        apiService.get(`api/cineworld?month=${$scope.calendar.month}&year=${$scope.calendar.year}&siteId=${$rootScope.siteId}`)
            .then(response => {
                const bookings = response.bookings;
                $scope.validDates = response.validDates;
                $scope.calendar.bookings = bookings;
                for (var i = 1; i <= totalDays; i++) {
                    $scope.calendar.weeks[weekIndex][dayIndex].number = i;
                    $scope.calendar.weeks[weekIndex][dayIndex].showtimesAvailable = checkDateValidity(i);
                    const booking = bookings.find(p => p.day === i);
                    if (booking) {
                        $scope.calendar.weeks[weekIndex][dayIndex].movie = booking.posterURL;
                    }
                    dayIndex = (dayIndex + 1) % 7;
                    if (dayIndex == 0) {
                        weekIndex++;
                    }
                }
            }).catch(err => {
                console.log(err);
            });
    }

    function generateEmptyCalendar(year, month) {
        const days = daysInMonth(year, month);
        const weeks = [];
        var dayOne = new Date($scope.calendar.year, $scope.calendar.month - 1, 1);
        var dayIndex = dayOne.getDay();
        weeks.push(emptyWeek());
        for (let i = 0; i < days; i++) {
            dayIndex = (dayIndex + 1) % 7;
            if (dayIndex === 0) {
                weeks.push(emptyWeek());
            }
        }
        return weeks;
    }

    function emptyWeek() {
        const output = [];
        for (var i = 0; i < 7; i++) {
            output.push({
                number: "",
                movie: ""
            });
        }
        return output;
    }

    function daysInMonth(year, month) {
        return new Date(year, month, 0).getDate();
    }

    $scope.incrementDate = function () {
        $scope.calendar.month++;
        if ($scope.calendar.month > 12) {
            $scope.calendar.month = 1;
            $scope.calendar.year++;
        }
        $scope.getCalendar();
    }

    $scope.decrementDate = function () {
        $scope.calendar.month--;
        if ($scope.calendar.month < 1) {
            $scope.calendar.month = 12;
            $scope.calendar.year--;
        }
        $scope.getCalendar();
    }

    $scope.lookupShowTimes = function (dayObj) {
        const day = dayObj.number;
        if (day != '' && dayObj.showtimesAvailable) {
            $scope.showtimeDayNum = day;
            var dayIndex = new Date($scope.calendar.year, $scope.calendar.month - 1, day).getDay();
            $scope.showtimeDay = $scope.dayNames[dayIndex];

            var data = {
                year: $scope.calendar.year,
                month: $scope.calendar.month,
                day,
                hour: 15,
                siteId: $rootScope.siteId
            }
            apiService.post('api/cineworld', data)
                .then(showtimes => {
                    if (showtimes === 'No Showings Found') {
                        console.log(`No showtimes available for date: ${data.day}/${data.month}/${data.year}`)
                    } else {
                        $scope.showtimeMovies = showtimes;
                        $scope.enableShadow = true;
                    }
                }).catch(err => {
                    console.log(err);
                });
        }
    }

    $scope.checkIfToday = function (day) {
        if ($scope.today.day == day && $scope.today.month == $scope.calendar.month && $scope.today.year == $scope.calendar.year) {
            return true;
        }
        return false;
    }

    function checkDateValidity(day) {
        day = String(day);
        if (!day || day.length === 0) {
            return false;
        }
        if (day.length === 1) {
            day = '0' + day;
        }
        const month = String($scope.calendar.month);
        if (month.length === 1) {
            month = '0' + month;
        }
        const date = `${$scope.calendar.year}-${month}-${day}`;
        return $scope.validDates.includes(date);
    }

    $scope.bookShowtime = function (movie, showtime, screen) {
        var hour = parseInt(showtime.split(':')[0]);
        var minutes = parseInt(showtime.split(':')[1]);
        var d = new Date($scope.calendar.year, $scope.calendar.month - 1, $scope.showtimeDayNum, hour, minutes, 0);
        var data = {
            showtime,
            title: movie.title,
            posterURL: movie.posterURL,
            year: $scope.calendar.year,
            month: $scope.calendar.month,
            day: $scope.showtimeDayNum,
            screen: screen,
            timestamp: d.getTime(),
            duration: movie.duration,
            releaseDate: movie.releaseDate
        }
        var currentlyBooked = $scope.currentlyBooked(movie, showtime);
        if (currentlyBooked !== false) {
            data._id = currentlyBooked;
            apiService.post('api/cineworld/bookings', data)
                .then(refreshCalendar)
                .catch(err => {
                    console.log(err);
                })
        } else {
            apiService.put('api/cineworld/bookings', data)
                .then(refreshCalendar)
                .catch(err => {
                    console.log(err);
                });
        }
    }

    function refreshCalendar() {
        $scope.getCalendar();
        $scope.enableShadow = false;
    }

    $scope.currentlyBooked = function (movie, showtime) {
        for (var i = 0; i < $scope.calendar.bookings.length; i++) {
            var booking = $scope.calendar.bookings[i];
            if (movie.title == booking.title && showtime == booking.showtime && booking.day == $scope.showtimeDayNum) {
                return booking._id;
            }
        }
        return false;
    }

    $scope.setTrailerURL = function (title) {
        if (title.endsWith(': Unlimited Screening')) {
            title = title.split(': Unlimited Screening')[0];
        }
        title += " movie";
        title = title.replace("&", "and")
        $scope.selectedTrailer = $sce.trustAsResourceUrl("https://www.youtube.com/embed/?listType=search&list=" + encodeURI(title));
        $scope.enableYoutube = true;
    }

    $scope.pauseVideo = function () {
        var iframe = document.getElementsByTagName("iframe")[0].contentWindow;
        iframe.postMessage('{"event":"command","func":"' + 'pauseVideo' + '","args":""}', '*');
        $scope.enableYoutube = false;
    }
});
