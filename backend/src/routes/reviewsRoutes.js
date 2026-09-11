import express from 'express';
import { addReview, getAllReviews } from '../controllers/reviewsController.js';

const router = express.Router();

router.get('/', getAllReviews);
router.post('/', addReview);

export default router;

