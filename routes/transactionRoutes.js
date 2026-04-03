import express from 'express';
import { createTransaction, getUserTransactions } from '../controllers/transactionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, createTransaction);
router.route('/mytransactions').get(protect, getUserTransactions);

export default router;
