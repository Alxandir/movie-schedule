var movieDB = require('../firebase/firebase.controller');
const filmsService = require('./films.service');
var queries = require('../query');

const addMovie = async function (req, res) {
    if (!req.body || !req.body.title || !req.body.year) {
        res.status(500).send('Bad request');
    } else {
        var newMovie = req.body;
        try {
            const data = await filmsService.addMovie(newMovie);
            return res.status(200).send(data);
        } catch(err) {
            res.status(500).send(err);
        }
    }
}

const getAllMovies = function (req, res) {
    var query = queries.parseQuery(req._parsedUrl.query);
    const prevStart = query.prev ? Number(query.prev) : null;
    let size = query.size || 1;
    if(!isNaN(size)) {
        size = Number(size);
    }
    movieDB.listMovies(size, prevStart).then(data => {
        res.status(200).json(data);
    }).catch(err => {
        res.status(500).send(err);
    });
}

module.exports = {
    getAllMovies,
    addMovie
}
