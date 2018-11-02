var request = require('request-promise');

var queries = require('../query');
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
                posterURL: posterService.buildPosterImageURL(response.results[0].poster_path),
                backgroundURL: posterService.buildBackgroundImageURL(response.results[0].backdrop_path)
            }
            res.status(200).send(output);
        } else {
            res.status(200).send('Movie not found');
        }
    } else {
        res.status(500).send('Empty query. Example: ?title=Wonder%20Woman&year=2017');
    }
}

const getPosters = async function (req, res) {
    if (req.body && req.body.better && req.body.worse) {
        filmsController.updateScore(req.body).then(data => {
            posterService.getMovieComparison().then(data => {
                res.status(200).send(data);
            });
        }).catch(err => {
            res.status(500).send(err);
        });
    } else {
        posterService.getMovieComparison().then(data => {
            res.status(200).send(data);
        }).catch(err => {
            res.status(500).send(err);
        });
    }
};

module.exports = {
    getPosters,
    getPoster
}
