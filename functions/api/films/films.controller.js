var movieDB = require('../firebase/firebase.controller');

const addMovie = function (req, res) {
    if (!req.body || !req.body.title || !req.body.year) {
        res.status(500).send('Bad request');
    } else {
        var newMovie = req.body;
        newMovie.score = 0;
        movieDB.addMovie(newMovie).then(data => {
            res.status(200).send(data);
        }).catch(err => {
            res.status(500).send(err);

        });
    }
}

const getAllMovies = function (req, res) {
    movieDB.listMovies().then(data => {
        res.status(200).json(data);
    }).catch(err => {
        res.status(500).send(err);
    });
}

const updateScore = async function (reviewedMovies) {
    if (reviewedMovies.worse.score == 0) {
        reviewedMovies.better.score++;
    } else {
        if (reviewedMovies.better.score == 0) {
            reviewedMovies.better.score = 1;
        }
        reviewedMovies.better.score += reviewedMovies.worse.score;
    }
    await movieDB.updateMovie(reviewedMovies.better);
    return await movieDB.updateMovie(reviewedMovies.worse);
}

module.exports = {
    updateScore,
    getAllMovies,
    addMovie
}
