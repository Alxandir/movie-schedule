var queries = require('../query');
var http = require('https');
// var movieDB = require('../cloudant/cloudant.controller');
var movieDB = require('../firebase/firebase.controller');

exports.addMovie = function(req,res){
    if(!req.body || !req.body.title || !req.body.year) {
        res.status(500).send("Bad request");
    } else {
        var newMovie = req.body;
        newMovie.score = 0;
        movieDB.addMovie(newMovie, function(output, err){
           if(!err){
               res.status(200).send(output);
           }  else {
               res.status(500).send(err);
           }
        });
    }
}

exports.getAllMovies = function(req, res){
    movieDB.listMovies().then(data => {
        res.status(200).json(data);
    }).catch(err => {
        res.status(500).send(err);
    });
}

exports.updateScore = function(reviewedMovies, callback){
    if(reviewedMovies.worse.score == 0){
        reviewedMovies.better.score++;
    } else {
        if(reviewedMovies.better.score == 0){
            reviewedMovies.better.score = 1;
        }
        reviewedMovies.better.score += reviewedMovies.worse.score;
    }
    movieDB.updateMovie(reviewedMovies.better, function(data, err){
       if(err){
           callback(null, err);
       } else {
           movieDB.updateMovie(reviewedMovies.worse, function(data, err){
               callback(data, err);
           });
       }
    });
}
