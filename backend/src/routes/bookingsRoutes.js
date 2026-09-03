import express from 'express';
import { getAllBookings, createBooking, cancelBooking } from '../controllers/bookingsController.js';

const router = express.Router();

router.get('/', getAllBookings);
router.post('/', createBooking);
router.put('/:id/cancel', cancelBooking);

export default router;
