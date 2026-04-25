import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Project from './models/Project.js';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('Connected to MongoDB for update script');
  
  const result = await Project.updateMany(
    { credits: 0 },
    { $set: { credits: 1500, pricePerCredit: 850 } }
  );
  
  console.log(`Updated ${result.modifiedCount} projects to have 1500 credits.`);
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
