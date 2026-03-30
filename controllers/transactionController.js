import Transaction from '../models/Transaction.js';
import Project from '../models/Project.js';

// @desc    Create a transaction (Buy credits)
// @route   POST /api/transactions
// @access  Public
export const createTransaction = async (req, res) => {
  try {
    const { projectId, buyerId, creditsToBuy } = req.body;

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
      buyer: buyerId,
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
// @route   GET /api/transactions/user/:userId
// @access  Public
export const getUserTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ buyer: req.params.userId })
      .populate('project', 'title type location')
      .populate('seller', 'name');
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
