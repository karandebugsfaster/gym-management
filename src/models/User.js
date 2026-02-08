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
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    dialCode: {
      type: String,
      required: [true, 'Dial code is required'],
      default: '91', // India default
    },
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    role: {
      type: String,
      enum: ['owner', 'manager'],
      default: 'owner',
    },
    // Gyms owned by this user (only for owners)
    ownedGyms: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Gym',
      },
    ],
    // Gyms managed by this user (only for managers)
    managedGyms: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Gym',
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// Indexes for performance
UserSchema.index({ email: 1 });
UserSchema.index({ phoneNumber: 1, dialCode: 1 });

export default mongoose.models.User || mongoose.model('User', UserSchema);