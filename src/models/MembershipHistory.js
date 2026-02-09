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
      default: '',
    },
    planPrice: {
      type: Number,
      default: 0,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    renewalType: {
      type: String,
      enum: ['new', 'renewal', 'upgrade', 'downgrade'],
      default: 'new',
    },
    amountPaid: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    finalPrice: {
      type: Number,
      default: 0,
    },
    paymentMode: {
      type: String,
      enum: ['cash', 'online', 'card', 'upi'],
      default: 'cash',
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
MembershipHistorySchema.index({ gym: 1, member: 1 });
MembershipHistorySchema.index({ gym: 1, startDate: -1 });
MembershipHistorySchema.index({ member: 1, startDate: -1 });

// Pre-save hook to calculate finalPrice if not provided
MembershipHistorySchema.pre('save', function() {
  // Calculate final price if not already set
  if (!this.finalPrice || this.finalPrice === 0) {
    this.finalPrice = (this.planPrice || 0) - (this.discount || 0);
  }
});

export default mongoose.models.MembershipHistory || mongoose.model('MembershipHistory', MembershipHistorySchema);