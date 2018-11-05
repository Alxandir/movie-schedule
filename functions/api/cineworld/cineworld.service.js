const request = require('request-promise');
const moment = require('moment');

const getFeatures = async function (type) {
    var url = buildOverviewURL(type);
    const options = {
        method: 'GET',
        uri: url,
        json: true
    };
    let response = await request(options);
    const output = [];
    if (response.body && response.body.posters) {
        for (const poster of response.body.posters) {
            var movie = {};
            movie.title = poster.featureTitle;
            movie.posterURL = "http://www.cineworld.co.uk/xmedia-cw/repo/feats/posters/" + poster.code.toUpperCase() + "-lg.jpg";
            //movie.youtubeURL = result.movieUrl;
            movie.date = poster.dateStarted;
            movie.weight = poster.weight;
            output.push(movie);
        }
    }
    return output;
}

const getValidDates = async function (siteId) {
    const dateString = moment().add(1, 'year').format('YYYY-MM-DD');
    const options = {
        uri: buildValidDatesURL(dateString, siteId),
        method: 'GET',
        json: true
    }
    const data = await request(options);
    return data.body.dates;
}

const getCinemas = async function () {
    const dateString = moment().add(1, 'year').format('YYYY-MM-DD');
    const options = {
        uri: buildCinemasURL(dateString),
        method: 'GET',
        json: true
    }
    const data = await request(options);
    return data.body.cinemas;
}

const getShowtimes = function(siteId, date) {
    const options = {
        method: 'GET',
        uri: buildShowtimesURL(date, siteId),
        json: true
    };
    return request(options);
}

function buildShowtimesURL(date = new Date(), siteId) {
    var month = String(date.getMonth() + 1);
    if (month.length < 2) {
        month = '0' + month;
    }
    var day = String(date.getDate());
    if (day.length < 2) {
        day = '0' + day;
    }
    var url = `https://www.cineworld.co.uk/uk/data-api-service/v1/quickbook/10108/film-events/in-cinema/${siteId}/at-date/${date.getFullYear()}-${month}-${day}?attr=&lang=en_GB`;
    return url;
}

function buildOverviewURL(type) {
    return `https://www.cineworld.co.uk/uk/data-api-service/v1/poster/10108/by-showing-type/${type}?lang=en_GB`;
}

function buildValidDatesURL(dateString = '2019-11-01', siteId) {
    return ` https://www.cineworld.co.uk/uk/data-api-service/v1/quickbook/10108/dates/in-cinema/${siteId}/until/${dateString}?attr=&lang=en_GB`;
}

const buildPosterURL = function(id) {
    return "http://www.cineworld.co.uk/xmedia-cw/repo/feats/posters/" + id.toUpperCase() + "-lg.jpg";
}

const buildCinemasURL = function(date) {
    return `https://www.cineworld.co.uk/uk/data-api-service/v1/quickbook/10108/cinemas/with-event/until/${date}?attr=&lang=en_GB`
}

module.exports = {
    getFeatures,
    getShowtimes,
    getValidDates,
    buildPosterURL,
    getCinemas
}