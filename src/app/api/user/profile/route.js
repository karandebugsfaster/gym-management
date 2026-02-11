import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { verifyAuth } from '@/lib/middleware';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

// GET - Get user profile
export async function GET(req) {
  try {
    const authResult = await verifyAuth(req);
    if (!authResult.authenticated) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    const user = await User.findById(authResult.userId)
      .select('-password')
      .populate('ownedGyms', 'name location')
      .populate('managedGyms', 'name location');

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

// PUT - Update user profile
export async function PUT(req) {
  try {
    const authResult = await verifyAuth(req);
    if (!authResult.authenticated) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { name, phoneNumber, dialCode, currentPassword, newPassword } = body;

    await dbConnect();

    const user = await User.findById(authResult.userId);

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Update basic fields
    if (name) user.name = name;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (dialCode) user.dialCode = dialCode;

    // Update password if provided
    if (currentPassword && newPassword) {
      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      
      if (!isValidPassword) {
        return NextResponse.json(
          { success: false, message: 'Current password is incorrect' },
          { status: 400 }
        );
      }

      if (newPassword.length < 6) {
        return NextResponse.json(
          { success: false, message: 'New password must be at least 6 characters' },
          { status: 400 }
        );
      }

      // Hash new password
      user.password = await bcrypt.hash(newPassword, 10);
    }

    await user.save();

    // Return user without password
    const updatedUser = await User.findById(user._id)
      .select('-password')
      .populate('ownedGyms', 'name location')
      .populate('managedGyms', 'name location');

    // Update localStorage
    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete user account
export async function DELETE(req) {
  try {
    const authResult = await verifyAuth(req);
    if (!authResult.authenticated) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const confirmDelete = searchParams.get('confirm');

    if (confirmDelete !== 'true') {
      return NextResponse.json(
        { success: false, message: 'Please confirm account deletion' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Soft delete - deactivate account
    await User.findByIdAndUpdate(authResult.userId, {
      $set: { isActive: false },
    });

    return NextResponse.json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}