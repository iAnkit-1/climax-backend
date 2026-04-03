import mongoose from 'mongoose';

const transactionSchema = mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: false },
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  type: { 
    type: String, 
    required: true, 
    enum: ['buy', 'sell', 'retire', 'topup', 'withdraw'],
    default: 'buy'
  },
  credits: { type: Number, required: false },
  amount: { type: Number, required: true },
  status: { type: String, required: true, default: 'completed' },
  blockchainHash: { type: String, required: false },
  blockchainNetwork: { type: String, required: false }
}, { timestamps: true });

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;
