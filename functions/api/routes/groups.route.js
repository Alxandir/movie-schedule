var express = require('express');
var controller = require('../groups/groups.controller');

const authService = require('../authentication/auth.service');

var router = express.Router();

router.get('', authService.authenticate, controller.getCurrentUserGroup);
router.get('/:id', controller.getUserGroup);

module.exports = router;