import express from 'express';
import { getAdminStats, createAdminUser } from '../controllers/adminController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/stats').get(protect, admin, getAdminStats);
router.route('/users').post(protect, admin, createAdminUser);

export default router;
