import express from 'express';
import { getWalletBalance, createWalletTransaction, getWalletTransactions, verifyTransactionHash } from '../controllers/walletController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/balance').get(protect, getWalletBalance);
router.route('/transactions').get(protect, getWalletTransactions);
router.route('/transaction').post(protect, createWalletTransaction);
router.route('/verify/:hash').get(verifyTransactionHash);

export default router;
