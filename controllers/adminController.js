import User from '../models/User.js';
import Project from '../models/Project.js';
import Transaction from '../models/Transaction.js';
import generateToken from '../utils/generateToken.js';

// @desc    Get admin statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({});
    const activeProjects = await Project.countDocuments({ status: 'verified' });
    
    // Calculate total transactions
    const transactions = await Transaction.find({ status: 'completed' });
    const totalVolume = transactions.reduce((acc, curr) => acc + curr.amount, 0);

    const stats = {
      totalUsers,
      activeProjects,
      totalVolume,
      monthlyGrowth: "+12.5%" // Mocked trend
    };
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create admin user
// @route   POST /api/admin/users
// @access  Private/Admin
export const createAdminUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password: password || 'Admin123!', // fallback password for directly created admins
      role: role || 'admin'
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
