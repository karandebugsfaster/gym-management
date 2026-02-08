import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema(
  {
    gym: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gym',
      required: true,
    },
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
      required: true,
    },
    transactionType: {
      type: String,
      enum: ['admission', 'renewal', 'due_payment', 'refund'],
      required: true,
    },
    // Payment details
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMode: {
      type: String,
      enum: ['cash', 'online', 'card', 'upi'],
      default: 'cash',
    },
    // Plan details at time of transaction
    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plan',
      default: null,
    },
    planName: {
      type: String,
      default: '',
    },
    planDuration: {
      type: String,
      default: '',
    },
    // Discount applied
    discount: {
      type: Number,
      default: 0,
    },
    // Invoice
    invoiceSent: {
      type: Boolean,
      default: false,
    },
    invoiceNumber: {
      type: String,
      default: '',
    },
    // Transaction metadata
    description: {
      type: String,
      default: '',
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    transactionDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
TransactionSchema.index({ gym: 1, transactionDate: -1 });
TransactionSchema.index({ member: 1, transactionDate: -1 });
TransactionSchema.index({ gym: 1, transactionType: 1, transactionDate: -1 });

export default mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);