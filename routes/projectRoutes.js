import express from 'express';
import { 
  getProjects, 
  getProjectById, 
  createProject, 
  updateProjectStatus 
} from '../controllers/projectController.js';

const router = express.Router();

router.route('/').get(getProjects).post(createProject);
router.route('/:id').get(getProjectById);
router.route('/:id/status').put(updateProjectStatus);

export default router;
