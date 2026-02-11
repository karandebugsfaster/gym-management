import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
    },
    dialCode: {
      type: String,
      default: '91',
    },
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
    },
    role: {
      type: String,
      enum: ['owner', 'manager'],
      default: 'owner',
    },
    // For owners
    ownedGyms: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Gym',
      },
    ],
    // For managers
    managedGyms: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Gym',
      },
    ],
    // Manager-specific fields
    assignedBy: {
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

// Indexes
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ assignedBy: 1 });

export default mongoose.models.User || mongoose.model('User', UserSchema);