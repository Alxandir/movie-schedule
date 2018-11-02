var request = require('request-promise');

var movieDB = require('../firebase/firebase.controller');

const getPoster = async function (title, year) {
    title = title.replace('&', 'and');
    const options = {
        uri: buildPosterURL(title, year),
        method: 'GET',
        json: true
    }
    
    const response = await request(options);
    
    if (response.results[0] != null) {
        return {
            posterURL: buildPosterImageURL(response.results[0].poster_path),
            backgroundURL: buildBackgroundImageURL(response.results[0].backdrop_path)
        }
    }

    const lastYearOptions = {
        url: buildPosterURL(title, year - 1),
        method: 'GET',
        json: true
    };
    const previousYear = await request(lastYearOptions);
    if (previousYear.results[0] != null) {
        return {
            posterURL: buildPosterImageURL(previousYear.results[0].poster_path),
            backgroundURL: buildBackgroundImageURL(previousYear.results[0].backdrop_path)
        }
    }

    const UnknownYearOptions = {
        uri: buildPosterURL(title),
        method: 'GET',
        json: true
    }
    const unknownYear = await request(UnknownYearOptions);
    if (unknownYear.results[0] != null) {
        return {
            posterURL: buildPosterImageURL(unknownYear.results[0].poster_path),
            backgroundURL: buildBackgroundImageURL(unknownYear.results[0].backdrop_path)
        }
    }
    
    throw new Error('Unable to find movie poster');
}

const getMovieComparison = async function () {
    const data = await movieDB.listMovies();
    allMovies = data;
    var index1 = Math.floor(Math.random() * allMovies.length);
    var index2 = 0;
    do {
        index2 = Math.floor(Math.random() * allMovies.length);
    } while (index2 == index1);
    
    return [
        allMovies[index1],
        allMovies[index2]
    ];
}

const buildPosterImageURL = function(path) {
    return 'https://image.tmdb.org/t/p/w300_and_h450_bestv2' + path;
}

const buildBackgroundImageURL = function(path) {
    return 'https://image.tmdb.org/t/p/original/' + path
}

const buildPosterURL = function (title, year) {
    var output;
    if (title.indexOf('%20') > -1) {
        output = "https://api.themoviedb.org/3/search/movie?api_key=a61378de1a54223c07bfff9bda899476&language=en-US&query=" + title + "&page=1&include_adult=false";
    } else {
        output = "https://api.themoviedb.org/3/search/movie?api_key=a61378de1a54223c07bfff9bda899476&language=en-US&query=" + encodeURI(title) + "&page=1&include_adult=false";
    }
    if (year != null) {
        output += "&primary_release_year=" + year;
    }
    return output;
}

module.exports = {
    getPoster,
    buildPosterURL,
    buildPosterImageURL,
    buildBackgroundImageURL,
    getMovieComparison
}