import mongoose from 'mongoose';

const MemberSchema = new mongoose.Schema(
  {
    // Member ID - REQUIRED INPUT from user
    memberId: {
      type: String,
      required: [true, 'Member ID is required'],
      unique: true,
      trim: true,
    },
    gym: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gym',
      required: true,
    },
    // Step 1: Basic Details
    name: {
      type: String,
      required: [true, 'Member name is required'],
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      required: true,
    },
    batch: {
      type: String,
      enum: ['Morning', 'Noon', 'Evening', 'Night'],
      required: true,
    },
    // Step 2: Additional Details
    email: {
      type: String,
      lowercase: true,
      trim: true,
      default: '',
    },
    height: {
      type: Number, // in cm
      default: null,
    },
    weight: {
      type: Number, // in kg
      default: null,
    },
    address: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
    dateOfBirth: {
      type: Date,
      default: null,
    },
    image: {
      type: String, // URL or base64
      default: '',
    },
    // Step 3: Plan Assignment
    joiningDate: {
      type: Date,
      required: true,
    },
    currentPlan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plan',
      default: null,
    },
    // Current membership details
    membershipStartDate: {
      type: Date,
      default: null,
    },
    membershipEndDate: {
      type: Date,
      default: null,
    },
    membershipStatus: {
      type: String,
      enum: ['active', 'expired', 'frozen'],
      default: 'active',
    },
    // Payment tracking for current membership
    planPrice: {
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
    amountPaid: {
      type: Number,
      default: 0,
    },
    dueAmount: {
      type: Number,
      default: 0,
    },
    // Freeze functionality
    isFrozen: {
      type: Boolean,
      default: false,
    },
    frozenDate: {
      type: Date,
      default: null,
    },
    // Status
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance optimization
MemberSchema.index({ gym: 1, membershipStatus: 1 });
MemberSchema.index({ gym: 1, membershipEndDate: 1 });
MemberSchema.index({ gym: 1, dateOfBirth: 1 });
MemberSchema.index({ memberId: 1 }, { unique: true });
MemberSchema.index({ gym: 1, isActive: 1 });

// Pre-save hook for calculations (NO NEXT() NEEDED)
MemberSchema.pre('save', function() {
  // Calculate final price and due amount
  if (this.planPrice !== undefined && this.discount !== undefined) {
    this.finalPrice = this.planPrice - this.discount;
    this.dueAmount = this.finalPrice - (this.amountPaid || 0);
  }
});

export default mongoose.models.Member || mongoose.model('Member', MemberSchema);