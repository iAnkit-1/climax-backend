import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: false },
  organization: { type: String, required: false },
  inrBalance: { type: Number, default: 0 },
  creditBalance: { type: Number, default: 0 },
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
  },  isActive: { type: Boolean, default: true },

  joinedDate: { type: Date, default: Date.now }
}, { timestamps: true });

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Encrypt password using bcrypt
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);
export default User;
