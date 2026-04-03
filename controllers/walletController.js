import Transaction from '../models/Transaction.js';
import User from '../models/User.js';
import crypto from 'crypto';

// @desc    Get user wallet balances
// @route   GET /api/wallet/balance
// @access  Private
export const getWalletBalance = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      inrBalance: user.inrBalance,
      creditBalance: user.creditBalance
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create a wallet transaction (topup, withdraw, retire)
// @route   POST /api/wallet/transaction
// @access  Private
export const createWalletTransaction = async (req, res) => {
  try {
    const { type, amount, quantity, projectName } = req.body;
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let transactionData = {
      buyer: req.user._id,
      type,
      amount: amount || 0,
      status: 'completed'
    };

    if (type === 'topup') {
      user.inrBalance += amount;
    } else if (type === 'withdraw') {
      if (user.inrBalance < amount) {
        return res.status(400).json({ message: 'Insufficient INR balance' });
      }
      user.inrBalance -= amount;
      transactionData.status = 'processing';
    } else if (type === 'retire') {
      if (user.creditBalance < quantity) {
        return res.status(400).json({ message: 'Insufficient Carbon Credits' });
      }
      user.creditBalance -= quantity;
      transactionData.credits = quantity;
      
      // Generate secure mock blockchain hash
      transactionData.blockchainHash = '0x' + crypto.randomBytes(20).toString('hex');
      transactionData.blockchainNetwork = 'Solana-Mock'; // Preparing for real solana network later
    }

    await user.save();
    
    const transaction = await Transaction.create(transactionData);
    
    // Using simple formatting for response
    const populated = await Transaction.findById(transaction._id).populate('project', 'title');
    
    res.status(201).json(populated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all transactions for the wallet history view
// @route   GET /api/wallet/transactions
// @access  Private
export const getWalletTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ buyer: req.user._id })
      .populate('project', 'title')
      .sort({ createdAt: -1 });
      
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Verify mock blockchain hash
// @route   GET /api/wallet/verify/:hash
// @access  Public
export const verifyTransactionHash = async (req, res) => {
  try {
    const { hash } = req.params;
    const transaction = await Transaction.findOne({ blockchainHash: hash }).populate('project');

    if (!transaction) {
      return res.status(404).json({ message: 'Certificate not found' });
    }

    res.json({
      valid: true,
      hash: transaction.blockchainHash,
      projectName: transaction.project ? transaction.project.title : "ClimaX Direct Issue",
      creditType: "Voluntary Carbon Credit",
      quantity: transaction.credits || 0,
      vintage: transaction.project ? transaction.project.vintage : new Date().getFullYear().toString(),
      registry: "ClimaX Ledger",
      country: transaction.project?.location?.state || "India",
      status: transaction.status,
      issuanceDate: new Date(transaction.createdAt).toLocaleDateString(),
      retirementDate: transaction.type === "retire" ? new Date(transaction.createdAt).toLocaleDateString() : undefined
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};
