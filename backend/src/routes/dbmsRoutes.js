import express from 'express';
import { 
  getDatabaseSchema, 
  getTableData, 
  executeSqlQuery, 
  getAnalytics 
} from '../controllers/dbmsController.js';

const router = express.Router();

router.get('/schema', getDatabaseSchema);
router.get('/table/:tableName', getTableData);
router.post('/query', executeSqlQuery);
router.get('/analytics', getAnalytics);

export default router;
