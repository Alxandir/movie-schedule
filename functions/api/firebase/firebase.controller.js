const moment = require('moment');
var admin = require('firebase-admin');

var dbCredentials = {
    movieDB: 'movies',
    bookingDB: 'bookings',
    groupDB: 'groups',
    userDB: 'users'
};

var firestore;
var movieDB;
var bookingDB;
let groupDB;
let userDB;

const log = {
    lastChecked: 0,
    size: 0,
    all: []
}

const getBookingsByDate = async function (group, month, year, day = undefined) {
    let bookingRef;
    if (day !== undefined) {
        bookingRef = bookingDB.where('group', '==', group).where('day', '==', parseInt(day)).where('month', '==', parseInt(month)).where('year', '==', parseInt(year));
    } else {
        bookingRef = bookingDB.where('group', '==', group).where('month', '==', parseInt(month)).where('year', '==', parseInt(year));
    }
    const snapshot = await bookingRef.get();
    return getResults(snapshot);
}

const getBookingsByTitle = async function (group, titles) {
    for (title of titles) {
        if (!title.endsWith(': Unlimited Screening')) {
            titles.push(title + ': Unlimited Screening');
        }
    }
    let searches = titles.map(t => bookingDB.where('group', '==', group).where('title', '==', t).get().then(getResults));
    let results = [].concat.apply([], await Promise.all(searches));

    return results;
}

const getGroup = async function (id) {
    const doc = await groupDB.doc(id).get();
    return doc.data();
}

const getUser = async function (id) {
    const doc = await userDB.doc(id).get();
    return doc.data();
}

const getUserByField = async function (field, value) {
    const snapshot = await userDB.where(field, '==', value).get();
    return getResults(snapshot);
}

const verifyToken = function (token) {
    return admin.auth().verifyIdToken(token);
}


function getResults(results) {
    let output = [];
    results.forEach(doc => {
        let newOutput = doc.data();
        newOutput._id = doc.id;
        output.push(newOutput);
    });
    return output;
}

const listAllBookings = async function (group) {
    const snapshot = await bookingDB.where('group', '==', group).orderBy('timestamp', 'desc').get();
    return getResults(snapshot);
}

const ONE_DAY = 24 * 60 * 60 * 1000;

const listMovies = async function (size = 1, prevIndex = null) {
    if (log.size === 0 || log.lastChecked + ONE_DAY < moment().valueOf()) {
        await refreshMovieCache();
    }
    if (size === 'all') {
        return log.all;
    }
    const movies = [];
    for (let i = 0; i < size; i++) {
        let newIndex;
        do {
            newIndex = randomNumber(log.size);
        } while (newIndex === prevIndex || movies.find(p => p.offset === newIndex));
        const output = log.all[newIndex];
        output.offset = newIndex;
        movies.push(output);
    }
    return movies;
}

async function refreshMovieCache() {
    const snapshot = await movieDB.orderBy('score', 'desc').get();
    log.size = snapshot.size;
    log.lastChecked = moment().valueOf();
    let results = getResults(snapshot);
    log.all = results;
    return;
}

const addMovie = async function (newMovie) {
    setTimeout(refreshMovieCache, 3000);
    return addItem(movieDB, newMovie);
}

const addBooking = async function (newBooking) {
    return addItem(bookingDB, newBooking);
}

async function addItem(database, item) {
    const docRef = database.doc();
    docRef.set(item);
    return { success: true, message: 'Entity created successfully' };
}

function createUser(item) {
    return addItemRaw(userDB, item)
}

function createGroup(item) {
    return addItemRaw(groupDB, item)
}

function addItemRaw(database, item) {
    return database.add(item);
}

const removeBooking = async function (id) {
    await bookingDB.doc(id).delete();
    return { success: true, message: 'Booking removed' };
}

const updateMovie = async function (movie) {
    return updateItem(movieDB, movie)
}

const updateBooking = async function (booking) {
    return updateItem(bookingDB, booking)
}

async function updateItem(database, item) {
    const id = item._id;
    delete item._id;
    await database.doc(id).update(item);
    return { success: true, message: 'Entity updated', id }
}

const initDB = function () {
    var serviceAccount = require("../../movie-ranking-a85ed-e681893ea0c4.json");

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://movie-ranking-a6aa5.firebaseio.com"
    });
    firestore = admin.firestore();
    movieDB = firestore.collection(dbCredentials.movieDB);
    bookingDB = firestore.collection(dbCredentials.bookingDB);
    groupDB = firestore.collection(dbCredentials.groupDB);
    userDB = firestore.collection(dbCredentials.userDB);
    refreshMovieCache();
}

function getDBCredentialsUrl(jsonData) {
}

function randomNumber(max) {
    return Math.floor(Math.random() * (max));
}

module.exports = {
    initDB,
    getBookingsByDate,
    getBookingsByTitle,
    listAllBookings,
    listMovies,
    addMovie,
    addBooking,
    createGroup,
    createUser,
    updateBooking,
    updateMovie,
    removeBooking,
    getGroup,
    getUser,
    getUserByField,
    verifyToken
}
