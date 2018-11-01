var request = require('request-promise');

const getPoster = async function (title, year) {
    console.log('IN poster service');
    title = title.replace("&", "and");
    const options = {
        uri: buildPosterURL(title, year),
        method: 'GET',
        json: true
    }
    
    const response = await request(options);
    
    if (response.results[0] != null) {
        return {
            posterURL: 'https://image.tmdb.org/t/p/w300_and_h450_bestv2' + response.results[0].poster_path,
            backgroundURL: 'https://image.tmdb.org/t/p/original/' + response.results[0].backdrop_path
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
            posterURL: 'https://image.tmdb.org/t/p/w300_and_h450_bestv2' + previousYear.results[0].poster_path,
            backgroundURL: 'https://image.tmdb.org/t/p/original/' + previousYear.results[0].backdrop_path
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
            posterURL: 'https://image.tmdb.org/t/p/w300_and_h450_bestv2' + unknownYear.results[0].poster_path,
            backgroundURL: 'https://image.tmdb.org/t/p/original/' + unknownYear.results[0].backdrop_path
        }
    }
    
    throw new Error('Unable to find movie poster');
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
    buildPosterURL
}