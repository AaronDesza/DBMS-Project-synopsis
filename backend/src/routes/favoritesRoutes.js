import express from 'express';
import {
  getAllFavorites,
  addFavorite,
  getFavoritesByUser,
  removeFavorite
} from '../controllers/favoritesController.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', optionalAuth, getAllFavorites);
router.post('/', authenticateToken, addFavorite);
router.get('/:userId', optionalAuth, getFavoritesByUser);
router.delete('/:placeId', authenticateToken, removeFavorite);

export default router;

