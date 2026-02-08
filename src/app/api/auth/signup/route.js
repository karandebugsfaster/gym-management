import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { hashPassword } from '@/lib/auth';
import { generateToken } from '@/lib/jwt';

export async function POST(request) {
  try {
    await dbConnect();

    const body = await request.json();
    const { name, email, password, dialCode, phoneNumber } = body;

    // Validation
    if (!name || !email || !password || !dialCode || !phoneNumber) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'Email already registered' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      dialCode,
      phoneNumber,
      role: 'owner', // Default role
    });

    // Generate JWT token
    const token = generateToken({ userId: user._id, email: user.email, role: user.role });

    // Return user data (without password) and token
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      dialCode: user.dialCode,
      phoneNumber: user.phoneNumber,
      role: user.role,
    };

    return NextResponse.json(
      {
        success: true,
        message: 'Account created successfully',
        token,
        user: userData,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error occurred' },
      { status: 500 }
    );
  }
}