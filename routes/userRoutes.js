import express from 'express';
import { 
  getUsers, 
  getUserById, 
  registerUser, 
  authUser,
  getUserProfile 
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.route('/').post(upload.single('document'), registerUser).get(protect, admin, getUsers);
router.post('/login', authUser);
router.route('/profile').get(protect, getUserProfile);
router.route('/:id').get(protect, admin, getUserById);

export default router;
