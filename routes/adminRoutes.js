

import express from 'express';
import { 
  getAdminStats, 
  getUsers, 
  getUserById,
  updateUser,
  deleteUser,
  createUser,
  getAdminProjects,
  deleteProject,
  bulkUpdateProjects,
  getSettings,
  updateSettings
} from '../controllers/adminController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(protect, admin);

// Stats
router.get('/stats', getAdminStats);

// User management
router.get('/users', getUsers);
router.post('/users', createUser);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Project management
router.get('/projects', getAdminProjects);
router.delete('/projects/:id', deleteProject);
router.post('/projects/bulk-update', bulkUpdateProjects);

// Settings
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

export default router;