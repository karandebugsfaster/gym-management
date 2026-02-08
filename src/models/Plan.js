import mongoose from 'mongoose';

const PlanSchema = new mongoose.Schema(
  {
    gym: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gym',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Plan name is required'],
      trim: true,
      // e.g., "1 Year", "6 Months", "3 Months"
    },
    duration: {
      value: {
        type: Number,
        required: true,
      },
      unit: {
        type: String,
        enum: ['days', 'months', 'years'],
        required: true,
      },
    },
    // Duration in days (calculated field for easy querying)
    durationInDays: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: [true, 'Plan price is required'],
      min: 0,
    },
    description: {
      type: String,
      default: '',
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
PlanSchema.index({ gym: 1, isActive: 1 });

export default mongoose.models.Plan || mongoose.model('Plan', PlanSchema);