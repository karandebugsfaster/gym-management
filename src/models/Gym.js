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
      required: [true, 'Gym location is required'],
      trim: true,
    },
    // Owner of this gym
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Managers assigned to this gym
    managers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    // Additional gym settings
    settings: {
      currency: {
        type: String,
        default: '₹',
      },
      timezone: {
        type: String,
        default: 'Asia/Kolkata',
      },
      language: {
        type: String,
        default: 'en',
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

// Indexes for performance
GymSchema.index({ owner: 1 });
GymSchema.index({ managers: 1 });

export default mongoose.models.Gym || mongoose.model('Gym', GymSchema);