var fs = require('fs');

var dbCredentials = {
    movieDB: 'my_sample_db',
    bookingDB: 'bookings'
};

var cloudant;
var movieDB;
var bookingDB;

exports.listBookings = function (month, year, callback, error) {
    var query = {
        "selector": {
            "month": {
                "$eq": parseInt(month)
            },
            "year": {
                "$eq": parseInt(year)
            }
        },
        "fields": [
            "_id",
            "_rev",
            "title",
            "showtime",
            "year",
            "month",
            "day",
            "screen",
            "posterURL",
            "timestamp"
        ]
    };
    bookingDB.find(query, function (err, result) {
        callback(result.docs, err);
    });
}

exports.listAllBookings = function (callback) {
    var query = {
        "selector": {
            "_id": {
                "$gt": -1
            }
        },
        "fields": [
            "_id",
            "_rev",
            "title",
            "showtime",
            "year",
            "month",
            "day",
            "screen",
            "posterURL",
            "timestamp"
        ],
        "sort": [
            {
                "timestamp": "asc"
            }
        ]
    };
    bookingDB.find(query, function (err, result) {
        if (!err) {
            var output = result.docs;
            output.sort(function (a, b) {
                return b.timestamp - a.timestamp;
            });
            callback(output, err);
        } else {
            callback(null, err);
        }
    });
}

exports.listMovies = function (callback, error) {
    var query = {
        "selector": {
            "score": {
                "$gt": -1
            }
        },
        "fields": [
            "_id",
            "_rev",
            "title",
            "score",
            "year",
            "posterURL",
            "backgroundURL"
        ],
        "sort": [
            {
                "score": "desc"
            }
        ]
    };
    movieDB.find(query, function (err, result) {
        if (!err) {
            callback(result.docs);
        } else {
            error(err);
        }
    });
}

exports.addMovie = function (newMovie, callback) {
    movieDB.insert(newMovie, function (err, result) {
        callback(result, err);
    });
}

exports.addBooking = function (newBooking, callback) {
    bookingDB.insert(newBooking, function (err, result) {
        callback(result, err);
    });
}

exports.removeBooking = function (timestamp, title, time, callback) {
    var query = {
        "selector": {
            "timestamp": {
                "$eq": parseInt(timestamp)
            },
            "title": {
                "$eq": title
            },
            "showtime": {
                "$eq": time
            }
        },
        "fields": [
            "_id",
            "_rev"
        ]
    };
    bookingDB.find(query, function (err, result) {
        if (!err) {
            if (result.docs[0] != null) {
                bookingDB.destroy(result.docs[0]._id, result.docs[0]._rev, function (err1, result1) {
                    callback(result1, err1);
                });
            } else {
                callback(null, "Attempted to delete invalid booking");
            }
        } else {
            callback(null, err)
        }
    });
}

exports.updateMovie = function (movie, callback) {
    movieDB.insert(movie, function (err, result) {
        callback(result, err);
    });
}

exports.updateBooking = function (booking, callback) {
    bookingDB.insert(booking, function (err, result) {
        callback(result, err);
    });
}

exports.initDB = function () {
    //When running on Bluemix, this variable will be set to a json object
    //containing all the service credentials of all the bound services
    if (process.env.VCAP_SERVICES) {
        dbCredentials.url = getDBCredentialsUrl(process.env.VCAP_SERVICES);
    } else { //When running locally, the VCAP_SERVICES will not be set

        // When running this app locally you can get your Cloudant credentials
        // from Bluemix (VCAP_SERVICES in "cf env" output or the Environment
        // Variables section for an app in the Bluemix console dashboard).
        // Once you have the credentials, paste them into a file called vcap-local.json.
        // Alternately you could point to a local database here instead of a
        // Bluemix service.
        // url will be in this format: https://username:password@xxxxxxxxx-bluemix.cloudant.com
        dbCredentials.url = getDBCredentialsUrl(fs.readFileSync("public/vcap-local.json", "utf-8"));
    }

    cloudant = require('cloudant')(dbCredentials.url);
    movieDB = cloudant.use(dbCredentials.movieDB);
    bookingDB = cloudant.use(dbCredentials.bookingDB);
}

function getDBCredentialsUrl(jsonData) {
    var vcapServices = JSON.parse(jsonData);
    // Pattern match to find the first instance of a Cloudant service in
    // VCAP_SERVICES. If you know your service key, you can access the
    // service credentials directly by using the vcapServices object.
    for (var vcapService in vcapServices) {
        if (vcapService.match(/cloudant/i)) {
            return vcapServices[vcapService][0].credentials.url;
        }
    }
}
