import mongoose from 'mongoose';

const projectSchema = mongoose.Schema({
  title: { type: String, required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  projectType: { type: String, required: true },
  
  // Location
  location: {
    state: { type: String },
    district: { type: String },
    pincode: { type: String },
    address: { type: String }
  },

  // Baseline Emissions
  energyUse: { type: String },
  fuelType: { type: String },
  emissionFactor: { type: String },
  additionalityProof: { type: String },
  
  // IoT Config
  iotConnected: { type: Boolean, default: false },
  iotDeviceId: { type: String },
  
  // Auditor assigned
  selectedAuditor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // Marketplace Fields
  credits: { type: Number, default: 0 },
  pricePerCredit: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['pending', 'verified', 'rejected', 'flagged', 'retired'],
    default: 'pending'
  },
  vintage: { type: Number },
  verifier: { type: String },
  description: { type: String },
  methodology: { type: String },
  projectStart: { type: String },
  certificationDate: { type: String },
  monitoringPeriod: { type: String },
  additionalBenefits: [{ type: String }],
  auditorFeedback: { type: String },
  
  // Files / evidence
  documents: [{
    name: { type: String },
    url: { type: String },
    type: { type: String }
  }],
  imageUrl: { type: String }
}, { timestamps: true });

const Project = mongoose.model('Project', projectSchema);
export default Project;
