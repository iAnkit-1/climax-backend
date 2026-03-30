import express from 'express';
import { createTransaction, getUserTransactions } from '../controllers/transactionController.js';

const router = express.Router();

router.route('/').post(createTransaction);
router.route('/user/:userId').get(getUserTransactions);

export default router;
