import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Project from './models/Project.js';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const projects = await Project.find({});
  console.log(projects.map(p => ({ id: p._id, title: p.title, credits: p.credits })));
  process.exit();
});
