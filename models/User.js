import mongoose from 'mongoose';

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { 
    type: String, 
    required: true, 
    enum: ['buyer', 'seller', 'auditor', 'admin'],
    default: 'buyer'
  },
  status: { 
    type: String, 
    required: true, 
    enum: ['active', 'pending', 'suspended'],
    default: 'active'
  },
  joinedDate: { type: Date, default: Date.now }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;
