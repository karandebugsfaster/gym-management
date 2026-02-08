import mongoose from 'mongoose';

const MembershipHistorySchema = new mongoose.Schema(
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
    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plan',
      required: true,
    },
    planName: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    planPrice: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      default: 0,
    },
    finalPrice: {
      type: Number,
      required: true,
    },
    amountPaid: {
      type: Number,
      default: 0,
    },
    dueAmount: {
      type: Number,
      default: 0,
    },
    paymentMode: {
      type: String,
      enum: ['cash', 'online', 'card', 'upi'],
      default: 'cash',
    },
    renewalType: {
      type: String,
      enum: ['new', 'renewal', 'early_renewal'],
      default: 'new',
    },
    // Reference to transaction
    transaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction',
      default: null,
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
MembershipHistorySchema.index({ member: 1, createdAt: -1 });
MembershipHistorySchema.index({ gym: 1, isActive: 1 });

export default mongoose.models.MembershipHistory || mongoose.model('MembershipHistory', MembershipHistorySchema);