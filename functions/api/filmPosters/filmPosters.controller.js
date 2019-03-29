var queries = require('../query');
var filmsService = require('../films/films.service');
const posterService = require('./filmPosters.service');

const getPoster = async function (req, res) {
    if (req._parsedUrl.query != null) {
        var query = queries.parseQuery(req._parsedUrl.query);
        try {
            const poster = await posterService.getPoster(query.title, query.year);
            const existing = await filmsService.getMovie(poster.title, poster.year);
            poster.existing = existing.length > 0;
            res.status(200).send(poster);
        } catch(err) {
            res.status(200).send('Movie not found');
        }
    } else {
        res.status(500).send('Empty query. Example: ?title=Wonder%20Woman&year=2017');
    }
}

const getPosters = async function (req, res) {
    if (req.body && req.body.better && req.body.worse) {
        filmsService.updateScore(req.body).then(data => {
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
