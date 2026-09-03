import express from 'express';
import { getAllTours, getTourById, getAllDestinations } from '../controllers/toursController.js';

const router = express.Router();

router.get('/', getAllTours);
router.get('/destinations', getAllDestinations);
router.get('/:id', getTourById);

export default router;
