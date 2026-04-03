import express from 'express';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/', upload.single('document'), (req, res) => {
  res.send(`/${req.file.path.replace(/\\/g, '/')}`); // return standard path
});

// For multiple files if needed
router.post('/multiple', upload.array('documents', 5), (req, res) => {
  const paths = req.files.map(file => `/${file.path.replace(/\\/g, '/')}`);
  res.send(paths);
});

export default router;
