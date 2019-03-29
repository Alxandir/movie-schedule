var movieDB = require('../firebase/firebase.controller');

const addMovie = async (movie) => {
    const existing = await getMovie(movie.title, movie.year);
    if(existing.length > 0) {
        console.log('Movie already exists');
        return;
    }
    movie.score = 0;
    const result = await movieDB.addMovie(movie);
    console.log('NEW MOVIE', result);
    return result;
};

const getMovie = (title, year) => {
    return movieDB.getMovieByTitle(title, year);
}

const updateScore = async (reviewedMovies) => {
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
    addMovie,
    getMovie,
    updateScore
};
