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

const getValidDates = async function () {
    const dateString = moment().add(1, 'year').format('YYYY-MM-DD');
    const options = {
        uri: buildValidDatesURL(dateString),
        method: 'GET',
        json: true
    }
    const data = await request(options);
    return data.body.dates;
}

const getShowtimes = function(date) {
    const options = {
        method: 'GET',
        uri: buildShowtimesURL(date),
        json: true
    };
    return request(options);
}

function buildShowtimesURL(date = new Date(), siteId = '10108') {
    var month = String(date.getMonth() + 1);
    if (month.length < 2) {
        month = '0' + month;
    }
    var day = String(date.getDate());
    if (day.length < 2) {
        day = '0' + day;
    }
    var url = `https://www.cineworld.co.uk/uk/data-api-service/v1/quickbook/${siteId}/film-events/in-cinema/8104/at-date/${date.getFullYear()}-${month}-${day}?attr=&lang=en_GB`;
    return url;
}

function buildOverviewURL(type, siteId = 10108) {
    return `https://www.cineworld.co.uk/uk/data-api-service/v1/poster/${siteId}/by-showing-type/${type}?lang=en_GB`;
}

function buildValidDatesURL(dateString = '2019-11-01', siteId = 10108) {
    return ` https://www.cineworld.co.uk/uk/data-api-service/v1/quickbook/${siteId}/dates/in-cinema/8104/until/${dateString}?attr=&lang=en_GB`;
}

module.exports = {
    getFeatures,
    getShowtimes,
    getValidDates
}