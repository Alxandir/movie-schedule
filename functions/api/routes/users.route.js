var express = require('express');
var controller = require('../users/users.controller');

const authService = require('../authentication/auth.service');

var router = express.Router();

router.get('', authService.authenticate, controller.getCurrentUser);
router.post('', controller.createUser);

module.exports = router;