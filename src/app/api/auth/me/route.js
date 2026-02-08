import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/middleware';

export async function GET(request) {
  try {
    const { authenticated, user, error } = await verifyAuth(request);

    if (!authenticated) {
      return NextResponse.json(
        { success: false, message: error || 'Unauthorized' },
        { status: 401 }
      );
    }

    // Return user data
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      dialCode: user.dialCode,
      phoneNumber: user.phoneNumber,
      role: user.role,
      ownedGyms: user.ownedGyms,
      managedGyms: user.managedGyms,
    };

    return NextResponse.json(
      {
        success: true,
        user: userData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error occurred' },
      { status: 500 }
    );
  }
}