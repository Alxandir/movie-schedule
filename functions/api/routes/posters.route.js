var express = require('express');

var controller = require('../filmPosters/filmPosters.controller');

var router = express.Router();

router.post('', controller.getPosters);
router.get(':?', controller.getPoster);

module.exports = router;