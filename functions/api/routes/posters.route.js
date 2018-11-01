var express = require('express');
var bodyParser = require('body-parser');

var controller = require('../filmPosters/filmPosters.controller');

var router = express.Router();

router.post('', controller.getPosters);
router.get(':?', controller.getPoster);

module.exports = router;