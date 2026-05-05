import User from '../models/User.js';
import Project from '../models/Project.js';
import Transaction from '../models/Transaction.js';

// @desc    Get admin statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getAdminStats = async (req, res) => {
  try {
    console.log('Fetching admin stats...');
    
    // Get all counts
    const totalUsers = await User.countDocuments({});
    const totalProjects = await Project.countDocuments({});
    const pendingProjects = await Project.countDocuments({ status: 'pending' });
    const verifiedProjects = await Project.countDocuments({ status: 'verified' });
    const rejectedProjects = await Project.countDocuments({ status: 'rejected' });
    const flaggedProjects = await Project.countDocuments({ status: 'flagged' });
    
    // User role counts
    const admins = await User.countDocuments({ role: 'admin' });
    const auditors = await User.countDocuments({ role: 'auditor' });
    const sellers = await User.countDocuments({ role: 'seller' });
    const buyers = await User.countDocuments({ role: 'buyer' });
    
    // User status counts
    const activeUsers = await User.countDocuments({ status: 'active' });
    const pendingUsers = await User.countDocuments({ status: 'pending' });
    const suspendedUsers = await User.countDocuments({ status: 'suspended' });
    
    // Transaction volume
    let totalVolume = 0;
    let recentTransactions = [];
    try {
      const completedTransactions = await Transaction.find({ status: 'completed' });
      totalVolume = completedTransactions.reduce((acc, curr) => acc + (curr.amount || 0), 0);
      
      recentTransactions = await Transaction.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('user', 'name email');
    } catch (err) {
      console.log('Transaction error:', err.message);
    }
    
    // Total credits issued
    const verifiedProjectsData = await Project.find({ status: 'verified' });
    const totalCreditsIssued = verifiedProjectsData.reduce((acc, curr) => acc + (curr.credits || 0), 0);
    
    // Recent projects
    const recentProjects = await Project.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('seller', 'name email');
    
    const stats = {
      totalUsers,
      totalProjects,
      pendingProjects,
      verifiedProjects,
      rejectedProjects,
      flaggedProjects,
      userBreakdown: { 
        admins, 
        auditors, 
        sellers, 
        buyers,
        userStatus: { activeUsers, pendingUsers, suspendedUsers }
      },
      totalVolume,
      totalCreditsIssued,
      recentActivities: {
        projects: recentProjects,
        transactions: recentTransactions
      }
    };
    
    res.status(200).json(stats);
    
  } catch (error) {
    console.error('Error in getAdminStats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all users with filtering
// @route   GET /api/admin/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
  try {
    const { role, status, search } = req.query;
    let query = {};
    
    if (role && role !== 'all') {
      query.role = role;
    }
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    console.error('Error in getUsers:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single user
// @route   GET /api/admin/users/:id
// @access  Private/Admin
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get user's projects if seller
    let projects = [];
    if (user.role === 'seller') {
      projects = await Project.find({ seller: user._id });
    }
    
    // Get user's transactions
    let transactions = [];
    try {
      transactions = await Transaction.find({ user: user._id }).limit(10);
    } catch (err) {
      console.log('Transaction fetch error:', err.message);
    }
    
    res.status(200).json({ user, projects, transactions });
  } catch (error) {
    console.error('Error in getUserById:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
export const updateUser = async (req, res) => {
  try {
    const { name, email, role, status, phone, organization } = req.body;
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (status) user.status = status;
    if (phone) user.phone = phone;
    if (organization) user.organization = organization;
    
    const updatedUser = await user.save();
    
    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      status: updatedUser.status,
      phone: updatedUser.phone,
      organization: updatedUser.organization
    });
  } catch (error) {
    console.error('Error in updateUser:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Don't allow deleting self
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }
    
    await user.deleteOne();
    res.status(200).json({ message: 'User removed successfully' });
  } catch (error) {
    console.error('Error in deleteUser:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create user (admin)
// @route   POST /api/admin/users
// @access  Private/Admin
export const createUser = async (req, res) => {
  try {
    const { name, email, password, role, phone, organization } = req.body;
    
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    const user = await User.create({
      name,
      email,
      password: password || 'Welcome123!',
      role: role || 'buyer',
      status: 'active',
      phone: phone || '',
      organization: organization || ''
    });
    
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status
    });
  } catch (error) {
    console.error('Error in createUser:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all projects (admin view)
// @route   GET /api/admin/projects
// @access  Private/Admin
export const getAdminProjects = async (req, res) => {
  try {
    const { status, projectType, search } = req.query;
    let query = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (projectType && projectType !== 'all') {
      query.projectType = projectType;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const projects = await Project.find(query)
      .populate('seller', 'name email')
      .populate('selectedAuditor', 'name email')
      .sort({ createdAt: -1 });
    
    res.status(200).json(projects);
  } catch (error) {
    console.error('Error in getAdminProjects:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete project
// @route   DELETE /api/admin/projects/:id
// @access  Private/Admin
export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    await project.deleteOne();
    res.status(200).json({ message: 'Project removed successfully' });
  } catch (error) {
    console.error('Error in deleteProject:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Bulk update project status
// @route   POST /api/admin/projects/bulk-update
// @access  Private/Admin
export const bulkUpdateProjects = async (req, res) => {
  try {
    const { projectIds, status } = req.body;
    
    if (!projectIds || !projectIds.length) {
      return res.status(400).json({ message: 'No projects selected' });
    }
    
    await Project.updateMany(
      { _id: { $in: projectIds } },
      { status, auditorFeedback: `Bulk updated by admin to ${status}` }
    );
    
    res.status(200).json({ message: `${projectIds.length} projects updated successfully` });
  } catch (error) {
    console.error('Error in bulkUpdateProjects:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get platform settings
// @route   GET /api/admin/settings
// @access  Private/Admin
export const getSettings = async (req, res) => {
  try {
    const settings = {
      platformFee: 2.5,
      minCreditPrice: 10,
      maxCreditPrice: 1000,
      auditDeadlineDays: 14,
      requireAuditor: true,
      enableReferrals: true,
      registrationOpen: true
    };
    
    res.status(200).json(settings);
  } catch (error) {
    console.error('Error in getSettings:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update platform settings
// @route   PUT /api/admin/settings
// @access  Private/Admin
export const updateSettings = async (req, res) => {
  try {
    const updatedSettings = req.body;
    res.status(200).json({ message: 'Settings updated successfully', settings: updatedSettings });
  } catch (error) {
    console.error('Error in updateSettings:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};