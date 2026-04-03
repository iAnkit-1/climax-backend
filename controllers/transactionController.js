import Transaction from '../models/Transaction.js';
import Project from '../models/Project.js';

// @desc    Create a transaction (Buy credits)
// @route   POST /api/transactions
// @access  Private
export const createTransaction = async (req, res) => {
  try {
    const { projectId, creditsToBuy } = req.body;

    const project = await Project.findById(projectId);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.credits < creditsToBuy) {
      return res.status(400).json({ message: 'Not enough credits available' });
    }

    // Calculate total price
    const totalPrice = creditsToBuy * project.pricePerCredit;

    const transaction = await Transaction.create({
      project: projectId,
      buyer: req.user._id,
      seller: project.seller,
      credits: creditsToBuy,
      price: totalPrice,
      status: 'completed'
    });

    // Deduct credits from project
    project.credits -= creditsToBuy;
    if (project.credits === 0) {
      project.status = 'retired';
    }
    await project.save();

    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get user transactions
// @route   GET /api/transactions/mytransactions
// @access  Private
export const getUserTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ buyer: req.user._id })
      .populate('project', 'title projectType location')
      .populate('seller', 'name email');
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
