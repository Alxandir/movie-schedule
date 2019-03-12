var express = require('express');
var controller = require('../films/films.controller');

var router = express.Router();

router.post('', controller.addMovie);
router.get(':?', controller.getAllMovies);

module.exports = router;