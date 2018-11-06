var express = require('express');

var controller = require('../cinemas/cinemas.controller');
const authService = require('../authentication/auth.service');

var router = express.Router();

router.post('', authService.authenticate, controller.getShowings);

router.get('/bookings:?', authService.authenticate, controller.getAllBookings);
router.put('/bookings', authService.authenticate, controller.addBooking);
router.delete('/bookings/:id', authService.authenticate, controller.removeBooking);

router.get('/featured:?', authService.authenticate, controller.getFeatures);
router.get('/valid:?', authService.authenticate, controller.getValidDates);
router.get('/venues', controller.getCinemas);

module.exports = router;