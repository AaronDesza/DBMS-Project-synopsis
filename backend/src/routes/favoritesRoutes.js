import express from 'express';
import {
  addFavorite,
  getFavoritesByUser,
  removeFavorite
} from '../controllers/favoritesController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All favorites routes require authentication
router.post('/',                    authenticateToken, addFavorite);
router.get('/:userId',              authenticateToken, getFavoritesByUser);
router.delete('/:placeId',          authenticateToken, removeFavorite);

export default router;
