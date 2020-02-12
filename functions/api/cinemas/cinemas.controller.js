const spelling = require('american-english');
const moment = require('moment');

var queries = require('../query');
var movieDB = require('../firebase/firebase.controller');

const cineworldService = require('./cineworld.service');
const posterService = require('../filmPosters/filmPosters.service');
const filmsService = require('../films/films.service');

const SECRET_SCREENING_IMG = 'app/images/secret-screening.jpg';
const PUNCTUATION_REGEX = /[!@#$%^&*()-=_+|;':",.<>?']/;

const getShowings = async function (req, res) {
    const group = req.user.group;
    if (!req.body || !req.body.year || !req.body.month || !req.body.day || !req.body.hour || !req.body.siteId) {
        return res.status(500).send('Bad request');
    }
    var date = new Date(req.body.year, req.body.month - 1, req.body.day);
    const currentDate = moment().startOf('day').valueOf();
    if (currentDate > date.getTime()) {
        try {
            const data = await movieDB.getBookingsByDate(group, req.body.month, req.body.year, req.body.day);
            return res.status(200).json(data);;
        } catch (err) {
            return res.status(500).send(error);;
        }
    }

    let featureData;
    let showtimes;
    try {
        featureData = await cineworldService.getFeatures('SHOWING');
        showtimes = await cineworldService.getShowtimes(req.body.siteId, date);
    } catch (err) {
        console.log(err);
        return res.status(500).send(err);
    }
    if (!showtimes.body || !showtimes.body.films || showtimes.body.films.length === 0) {
        return res.status(200).send('No Showings Found');
    }
    let { movies, titles } = buildMoviesList(featureData, showtimes.body.films, showtimes.body.events, req.body.hour);
    let existingBookings = await movieDB.getBookingsByTitle(group, titles);
    movies = movies.map(movie => {
        let booked = existingBookings.find(p => p.title === movie.title || p.title + ': Unlimited Screening' === movie.title || p.title === movie.title + ': Unlimited Screening');
        if (booked) {
            if (booked.timestamp <= moment().valueOf()) {
                movie.seen = true;
            } else {
                movie.bookingExists = true;
            }
        }
        return movie;
    });
    movies = movies.filter(p => !p.seen && !p.bookingExists).concat(movies.filter(p => p.bookingExists), movies.filter(p => p.seen))

    return res.status(200).send(movies);
}

function buildMoviesList(featureData, movies, events, minHour = false) {
    const titles = [];
    const output = [];
    for (var item of movies) {
        var movie = {};
        movie.title = item.name;
        titles.push(item.name);
        if (item.name.endsWith(': Unlimited Screening')) {
            titles.push(item.name.split(': Unlimited Screening')[0]);
        }
        movie.posterURL = cineworldService.buildPosterURL(item.id);
        movie.duration = item.length;
        movie.showtimes = {};
        const movieFeature = featureData.find(p => p.title === item.name);
        if (movieFeature) {
            movie.releaseDate = movieFeature.date;
        }
        const { twoD, threeD } = buildShowtimeArrays(events, item.id, minHour);
        if (twoD.length > 0) {
            movie.showtimes.D2 = twoD;
        }
        if (threeD.length > 0) {
            movie.showtimes.D3 = threeD;
        }
        if (threeD.length + twoD.length > 0) {
            output.push(movie);
        }
    }
    if (output.length === 0 && minHour !== false) {
        return buildMoviesList(featureData, movies, events);
    }
    output.sort(function (a, b) {
        a = new Date(a.releaseDate);
        b = new Date(b.releaseDate);
        return a > b ? -1 : a < b ? 1 : 0;
    });
    output.map(p => p.releaseDate = moment(p.releaseDate).format('Do MMMM YYYY'))
    return { movies: output, titles };
}

function buildShowtimeArrays(events, movieId, minHour) {
    const threeD = [];
    const twoD = [];
    for (var event of events) {
        var showtime = {};
        if (event.filmId === movieId) {
            showtime.time = event.eventDateTime.split('T')[1];
            showtime.screen = 0;
            if (minHour !== false && parseInt(showtime.time.split(':')[0]) < minHour) {
                continue;
            }
            if (showtime.time.split(':').length > 2) {
                showtime.time = showtime.time.substr(0, showtime.time.lastIndexOf(':'));
            }
            if (event.attributeIds.includes('3d')) {
                showtime.format = '3D';
                threeD.push(showtime);
            } else {
                showtime.format = '2D';
                twoD.push(showtime);
            }
        }
    }
    return {
        twoD,
        threeD
    }
}

const addBooking = async function (req, res) {
    const group = req.user.group;
    if (!req.body || !req.body.title || !req.body.showtime || !req.body.year || !req.body.month || !req.body.day || !req.body.timestamp || !req.body.posterURL) {
        return res.status(500).send('Bad request');
    }
    var newBooking = {
        title: req.body.title,
        showtime: req.body.showtime,
        year: req.body.year,
        screen: req.body.screen,
        posterURL: req.body.posterURL,
        month: req.body.month,
        day: req.body.day,
        timestamp: req.body.timestamp,
        group
    }
    if (req.body.duration) {
        newBooking.duration = req.body.duration;
    }
    if (req.body.releaseDate) {
        newBooking.releaseDate = req.body.releaseDate;
    }

    var searchTitle = newBooking.title;
    if (searchTitle === 'Secret Unlimited Screening') {
        newBooking.posterURL = SECRET_SCREENING_IMG;
        try {
            const data = await movieDB.addBooking(newBooking);
            return res.status(200).json(data);
        } catch (err) {
            return res.status(500).json(err);
        }
    }
    if (searchTitle.endsWith(': Unlimited Screening')) {
        searchTitle = searchTitle.split(': Unlimited Screening')[0];
    }
    searchTitle = searchTitle.replace('&', 'and');
    searchTitle = searchTitle.replace('SubM4J ', '');
    searchTitle = searchTitle.replace('M4J ', '');
    searchTitle = searchTitle.replace('(4DX) ', '');
    searchTitle = searchTitle.replace('(SS) ', '');
    searchTitle = searchTitle.replace('(4DX 3D) ', '');
    searchTitle = searchTitle.replace('(Korean)', '');
    searchTitle = searchTitle.replace('Classic Movie Monday ', '');
    searchTitle = searchTitle.split(' + ')[0];
    searchTitle = americaniseSentence(searchTitle);
    try {
        const poster = await posterService.getPoster(searchTitle, req.body.year);
        newBooking.posterURL = poster.posterURL;
        newBooking.backgroundURL = poster.backgroundURL;
        filmsService.addMovie(poster);
        const data = await movieDB.addBooking(newBooking);
        return res.status(200).send(data);
    } catch (err) {
        return res.status(500).json(err);
    }
}

const removeBooking = async function (req, res) {
    try {
        const data = await movieDB.removeBooking(req.params.id);
        return res.status(200).json(data);
    } catch (err) {
        res.status(500).json(err);
    }
}

const getAllBookings = async function (req, res) {
    const group = req.user.group;
    if (req._parsedUrl.query != null) {
        var query = queries.parseQuery(req._parsedUrl.query);
        const group = req.user.group;
        try {
            const bookings = await movieDB.getBookingsByDate(group, query.month, query.year, query.day);
            const validDates = await cineworldService.getValidDates(query.siteId);
            return res.status(200).json({ bookings, validDates });
        } catch (err) {
            return res.status(500).send(err);
        }
    }
    try {
        const data = await movieDB.listAllBookings(group);
        return res.status(200).json(data);
    } catch (err) {
        return res.status(500).send(err);
    }
}

const getFeatures = async function (req, res) {
    if (req._parsedUrl.query != null) {
        var query = queries.parseQuery(req._parsedUrl.query);
        try {
            let movies = await cineworldService.getFeatures(query.type);
            if (movies.length < 1) {
                return res.status(200).send('No Features Found');
            }
            return res.status(200).send(movies);
        } catch (err) {
            console.log(err);
            res.status(500).send('An unexpected error occured while getting featured movies');
        }
    } else {
        res.status(500).send('Movie type not provided. (?type=1/2)');
    }
}

const getValidDates = async function (req, res) {
    try {
        var query = queries.parseQuery(req._parsedUrl.query);
        let result = await cineworldService.getValidDates(query.siteId);
        res.status(200).send(result);
    } catch (err) {
        console.log('err', err);
        res.status(500).send({ message: 'Failed to get valid dates', error: err });
    }
}

const getCinemas = async function (req, res) {
    try {
        let result = await cineworldService.getCinemas();
        res.status(200).send(result);
    } catch (err) {
        console.log('err', err);
        res.status(500).send({ message: 'Failed to get cinemas', error: err });
    }
}

function americaniseSentence(input) {
    return input.split(' ').map(p => {
        return americaniseWord(p) ? americaniseWord(p) : p
    }).join(' ');
}

function removePunctuation(input) {
    const punctuationMatch = input.match(PUNCTUATION_REGEX);
    if (punctuationMatch) {
        let punctuation = punctuationMatch[0];
        let clean = input.substr(0, punctuationMatch.index);
        return {
            clean,
            punctuation
        };
    }
    return null;
}

function americaniseWord(input) {
    const result = removePunctuation(input);
    let punctuation = '';
    let word = input;
    if (result) {
        punctuation = result.punctuation;
        word = result.clean;
    }
    const american = spelling.toUS(word);
    if (american === 'word_not_found') {
        return null;
    } else {
        return american + punctuation;
    }
}

module.exports = {
    getAllBookings,
    addBooking,
    removeBooking,
    getShowings,
    getFeatures,
    getValidDates,
    getCinemas
}
