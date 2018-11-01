var queries = require('../query');
const request = require('request-promise');
const spelling = require('american-english');
const moment = require('moment');
var movieDB = require('../firebase/firebase.controller');

const cineworldService = require('./cineworld.service');
const posterService = require('../filmPosters/filmPosters.service');

const getShowings = async function (req, res) {
    if (!req.body || !req.body.year || !req.body.month || !req.body.day || !req.body.hour) {
        return res.status(500).send("Bad request");
    }
    var date = new Date(req.body.year, req.body.month - 1, req.body.day);
    const currentDate = moment().startOf('day').valueOf();
    if (currentDate > date.getTime()) {
        try {
            const data = await movieDB.getBookingsByDate(req.body.month, req.body.year, req.body.day);
            return res.status(200).json(data);;
        } catch (err) {
            return res.status(500).send(error);;
        }
    }
    
    let featureData;
    let movies;
    try {
        const options = {
            method: 'GET',
            uri: buildURL(date),
            json: true
        };
        featureData = await cineworldService.getFeatures('SHOWING');
        movies = await request(options);
    } catch(err) {
        return res.status(500).send(err);
    }
    let titles = [];
    if (!movies.body || !movies.body.films || movies.body.films.length === 0) {
        return res.status(200).send("No Showings Found");
    }
    var output = [];
    for (var item of movies.body.films) {
        var movie = {};
        movie.title = item.name;
        titles.push(item.name);
        if (item.name.endsWith(': Unlimited Screening')) {
            titles.push(item.name.split(': Unlimited Screening')[0]);
        }
        movie.posterURL = "http://www.cineworld.co.uk/xmedia-cw/repo/feats/posters/" + item.id.toUpperCase() + "-lg.jpg";
        movie.duration = item.length;
        movie.showtimes = {};
        const movieFeature = featureData.find(p => p.title === item.name);
        if (movieFeature) {
            movie.releaseDate = movieFeature.date;
        }

        for (var event of movies.body.events) {
            var showtime = {};
            if (event.filmId === item.id) {
                showtime.time = event.eventDateTime.split('T')[1];
                showtime.screen = 0;
                if (parseInt(showtime.time.split(':')[0]) < req.body.hour) {
                    continue;
                }
                if (showtime.time.split(':').length > 2) {
                    showtime.time = showtime.time.substr(0, showtime.time.lastIndexOf(':'));
                }
                if (event.attributeIds.indexOf('3d') > -1) {
                    showtime.format = '3D';
                    if (movie.showtimes.D3 == null) movie.showtimes.D3 = [];
                    movie.showtimes.D3.push(showtime);
                } else {
                    showtime.format = '2D';
                    if (movie.showtimes.D2 == null) movie.showtimes.D2 = [];
                    movie.showtimes.D2.push(showtime);
                }
            }
        }
        if (movie.showtimes.D2 != null || movie.showtimes.D3 != null) {
            output.push(movie);
        }
    }
    output.sort(function(a, b) {
        a = new Date(a.releaseDate);
        b = new Date(b.releaseDate);
        return a>b ? -1 : a<b ? 1 : 0;
    });
    output.map(p => p.releaseDate = moment(p.releaseDate).format("Do MMMM YYYY"))
    let existingBookings = await movieDB.getBookingsByTitle(titles);
    output = output.map(movie => {
        let booked = existingBookings.find(p => p.title === movie.title);
        if (booked) {
            if (booked.timestamp <= moment().valueOf()) {
                movie.seen = true;
            } else {
                movie.bookingExists = true;
            }
        }
        return movie;
    })

    return res.status(200).send(output);
}

const addBooking = async function (req, res) {
    if (!req.body || !req.body.title || !req.body.showtime || !req.body.year || !req.body.month || !req.body.day || !req.body.timestamp || !req.body.posterURL) {
        return res.status(500).send("Bad request");
    }
    var newBooking = {
        "title": req.body.title,
        "showtime": req.body.showtime,
        "year": req.body.year,
        "screen": req.body.screen,
        "posterURL": req.body.posterURL,
        "month": req.body.month,
        "day": req.body.day,
        "timestamp": req.body.timestamp
    }
    if (req.body.duration) {
        newBooking.duration = req.body.duration;
    }
    if (req.body.releaseDate) {
        newBooking.releaseDate = req.body.releaseDate;
    }

    var searchTitle = newBooking.title;
    if (searchTitle === 'Secret Unlimited Screening') {
        newBooking.posterURL = "app/images/secret-screening.jpg";
        try {
            const data = await movieDB.addBooking();
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
    searchTitle = searchTitle.replace('Classic Movie Monday ', '');
    searchTitle = searchTitle.split(' + ')[0];
    searchTitle = americaniseSentence(searchTitle);
    try {
        console.log(searchTitle, req.body.year);
        const poster = await posterService.getPoster(searchTitle, req.body.year);
        console.log(poster);
        newBooking.posterURL = poster.posterURL;
        newBooking.backgroundURL = poster.backgroundURL;
        const data = await movieDB.addBooking(newBooking);
        console.log(data);
        return res.status(200).send(data);
    } catch (err) {
        return res.status(500).json(err);
    }
}

const removeBooking = async function (req, res) {
    if (!req.body || !req.body.title || !req.body.showtime || !req.body.year || !req.body.month || !req.body.day) {
        return res.status(500).send("Bad request");
    }
    try {
        const data = await movieDB.removeBooking(req.body);
        return res.status(200).json(data);
    } catch (err) {
        res.status(500).json(err);
    }
}

function buildURL(date, siteID = '10108') {
    var month = String(date.getMonth() + 1);
    if (month.length < 2) {
        month = '0' + month;
    }
    var day = String(date.getDate());
    if (day.length < 2) {
        day = '0' + day;
    }
    var url = `https://www.cineworld.co.uk/uk/data-api-service/v1/quickbook/${siteID}/film-events/in-cinema/8104/at-date/${date.getFullYear()}-${month}-${day}?attr=&lang=en_GB`;
    return url;
}

const getAllBookings = async function (req, res) {
    if (req._parsedUrl.query != null) {
        var query = queries.parseQuery(req._parsedUrl.query);
        try {
            const bookings = await movieDB.getBookingsByDate(query.month, query.year, query.day);
            const validDates = await cineworldService.getValidDates();
            return res.status(200).json({ bookings, validDates });
        } catch (err) {
            return res.status(500).send(err);
        }
    }
    try {
        const data = await movieDB.listAllBookings();
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
                return res.status(200).send("No Features Found");
            }
            return res.status(200).send(movies);
        } catch (err) {
            console.log(err);
            res.status(500).send('An unexpected error occured while getting featured movies');
        }
    } else {
        res.status(500).send("Movie type not provided. (?type=1/2)");
    }
}

const queryBookings = async function (req, res) {
    if (!req.body.title) {
        res.status(400).send('No titles given in query');
    }
    let titles = req.body.title;
    try {
        let result = await movieDB.getBookingsByTitle(titles);
        res.status(200).send(result);
    } catch (err) {
        res.status(500).send(err);
    }
}

const getValidDates = async function (req, res) {
    try {
        let result = await cineworldService.getValidDates();
        res.status(200).send(result);
    } catch (err) {
        console.log('err', err);
        res.status(500).send({message: 'Failed to get valid dates', error: err});
    }
}

function americaniseSentence(input) {
    return input.split(' ').map(p => {
        return americaniseWord(p) ? americaniseWord(p) : p
    }).join(' ');
}

function removePunctuation(input) {
    if (input.match(/[!@#$%^&*()-=_+|;':",.<>?']/)) {
        let result = input.match(/[!@#$%^&*()-=_+|;':",.<>?']/);
        let punctuation = result[0];
        let clean = input.substr(0, result.index);
        return {
            clean,
            punctuation
        };
    }
    return null;
}

function americaniseWord(input) {
    let result = removePunctuation(input);
    let punctuation = '';
    let word = input;
    if (result) {
        punctuation = result.punctuation;
        word = result.clean;
    }
    let american = spelling.toUS(word);
    if (american === 'word_not_found') {
        return null;
    } else {
        return american + punctuation;
    }
}

module.exports = {
    getAllBookings,
    queryBookings,
    addBooking,
    removeBooking,
    getShowings,
    getFeatures,
    getValidDates,
}
