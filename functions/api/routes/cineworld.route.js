var express = require('express');

var controller = require('../cineworld/cineworld.controller');

var router = express.Router();

router.post('', controller.getShowings);
router.post('/bookings/search', controller.queryBookings);
router.put('/bookings', controller.addBooking);
router.post('/bookings', controller.removeBooking);
router.get(':?', controller.getAllBookings);
router.get('/featured:?', controller.getFeatures);
router.get('/valid', controller.getValidDates);

module.exports = router;