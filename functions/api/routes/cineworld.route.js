var express = require('express');

var controller = require('../cineworld/cineworld.controller');
const authService = require('../authentication/auth.service');

var router = express.Router();

router.post('', authService.authenticate, controller.getShowings);
router.post('/bookings/search', authService.authenticate, controller.queryBookings);
router.put('/bookings', authService.authenticate, controller.addBooking);
router.post('/bookings', authService.authenticate, controller.removeBooking);
router.get(':?', authService.authenticate, controller.getAllBookings);
router.get('/featured:?', authService.authenticate, controller.getFeatures);
router.get('/valid:?', authService.authenticate, controller.getValidDates);
router.get('/cinemas', controller.getCinemas);

module.exports = router;