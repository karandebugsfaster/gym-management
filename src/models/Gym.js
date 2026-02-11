import mongoose from 'mongoose';

const GymSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Gym name is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Subscription details
    subscription: {
      plan: {
        type: String,
        enum: ['trial', 'basic', 'pro', 'premium'],
        default: 'trial',
      },
      status: {
        type: String,
        enum: ['active', 'expired', 'cancelled', 'trial'],
        default: 'trial',
      },
      startDate: {
        type: Date,
        default: Date.now,
      },
      endDate: {
        type: Date,
        default: function() {
          // 7 days trial by default
          const date = new Date();
          date.setDate(date.getDate() + 7);
          return date;
        },
      },
      trialUsed: {
        type: Boolean,
        default: false,
      },
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

// Indexes
GymSchema.index({ owner: 1 });
GymSchema.index({ 'subscription.status': 1, 'subscription.endDate': 1 });

export default mongoose.models.Gym || mongoose.model('Gym', GymSchema);