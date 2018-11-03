const path = require('path');
const express = require('express');

const router = express.Router();

const authService = require('../authentication/auth.service');

router.use('/api/filmPosters', require('./posters.route'));
router.use('/api/films', require('./films.route'));
router.use('/api/cineworld', authService.authenticate, require('./cineworld.route'));
router.use('/api/groups', authService.authenticate, require('./groups.route'));
router.use('/api/users', authService.authenticate, require('./users.route'));

router.get('/*', function (req, res) {
    res.sendFile(path.resolve('../public/index.html'));
});

module.exports = router;