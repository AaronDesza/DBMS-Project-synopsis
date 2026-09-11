import express from 'express';
import {
  getAllPlaces,
  getPlaceById,
  createPlace,
  updatePlace,
  deletePlace
} from '../controllers/placesController.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Public
router.get('/',     getAllPlaces);
router.get('/:id',  getPlaceById);

// Protected (admin only — JWT required)
router.post('/',        authenticateToken, createPlace);
router.put('/:id',      authenticateToken, updatePlace);
router.delete('/:id',   authenticateToken, deletePlace);

export default router;
