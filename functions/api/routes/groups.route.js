var express = require('express');
var controller = require('../groups/groups.controller');

var router = express.Router();

router.get('', controller.getCurrentUserGroup);

module.exports = router;