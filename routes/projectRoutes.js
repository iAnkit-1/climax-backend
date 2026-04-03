import express from 'express';
import { 
  getProjects, 
  getProjectById, 
  createProject, 
  updateProjectStatus,
  getMyProjects
} from '../controllers/projectController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.route('/').get(getProjects).post(protect, upload.array('documents', 5), createProject);
router.route('/myprojects').get(protect, getMyProjects);
router.route('/:id').get(getProjectById);
router.route('/:id/status').put(protect, updateProjectStatus);

export default router;
