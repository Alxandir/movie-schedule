var express = require('express');
var controller = require('../users/users.controller');

var router = express.Router();

router.get('', controller.getCurrentUser);

module.exports = router;