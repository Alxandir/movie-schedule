var queries = require('../query');
var request = require('request-promise');
// var movieDB = require('../cloudant/cloudant.controller');
var movieDB = require('../firebase/firebase.controller');
var filmsController = require('../films/films.controller');
const posterService = require('./filmPosters.service');

var allMovies;

const getPoster = async function (req, res) {
    if (req._parsedUrl.query != null) {
        var query = queries.parseQuery(req._parsedUrl.query);
        url = posterService.buildPosterURL(query.title, query.year);
        const options = {
            method: 'GET',
            uri: url,
            json: true
        };
        const response = await request(options);
        if (response.results[0] != null) {
            var output = {
                title: response.results[0].title,
                posterURL: "https://image.tmdb.org/t/p/w300_and_h450_bestv2" + response.results[0].poster_path,
                backgroundURL: "https://image.tmdb.org/t/p/original" + response.results[0].backdrop_path
            }
            res.status(200).send(output);
        } else {
            res.status(200).send("Movie not found");
        }
    } else {
        res.status(500).send("Empty query. Example: ?title=Wonder%20Woman&year=2017");
    }
}

/* Respond to any get on Get All page with all devices stored on database. HTTP code 200 */
const getPosters = async function (req, res) {
    if (req.body && req.body.better && req.body.worse) {
        filmsController.updateScore(req.body, function (data, err) {
            if (err) {
                res.status(500).send(error);
            } else {
                getAllMovies().then(data => {
                    res.status(200).json(data);
                }).catch(err => {
                    res.status(500).send(error);
                });
            }
        });
    } else {
        getAllMovies().then(data => {
            res.status(200).json(data);
        }).catch(err => {
            res.status(500).send(error);
        });
    }
};

const getAllMovies = async function () {
    const data = await movieDB.listMovies();
    allMovies = data;
    var index1 = Math.floor(Math.random() * allMovies.length);
    var index2 = 0;
    do {
        index2 = Math.floor(Math.random() * allMovies.length);
    } while (index2 == index1);
    films = [
        allMovies[index1],
        allMovies[index2]
    ];
    return films;
}

module.exports = {
    getAllMovies,
    getPosters,
    getPoster
}
