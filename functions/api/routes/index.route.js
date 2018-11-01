const path = require('path');
const express = require('express');

const router = express.Router();

router.use('/api/filmPosters', require('./posters.route'));
router.use('/api/films', require('./films.route'));
router.use('/api/cineworld', require('./cineworld.route'));

router.get('/*', function (req, res) {
    res.sendFile(path.resolve('../public/index.html'));
});

module.exports = router;