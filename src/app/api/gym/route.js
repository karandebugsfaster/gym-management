import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Gym from '@/models/Gym';
import User from '@/models/User';
import { verifyAuth } from '@/lib/middleware';

export async function POST(request) {
  try {
    await dbConnect();

    // Verify authentication
    const { authenticated, user, error } = await verifyAuth(request);
    if (!authenticated) {
      return NextResponse.json(
        { success: false, message: error || 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, location } = body;

    // Validation
    if (!name || !location) {
      return NextResponse.json(
        { success: false, message: 'Gym name and location are required' },
        { status: 400 }
      );
    }

    // Create gym
    const gym = await Gym.create({
      name,
      location,
      owner: user._id,
    });

    // Add gym to user's ownedGyms
    await User.findByIdAndUpdate(user._id, {
      $push: { ownedGyms: gym._id },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Gym created successfully',
        gym: {
          id: gym._id,
          name: gym.name,
          location: gym.location,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create gym error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error occurred' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    await dbConnect();

    // Verify authentication
    const { authenticated, user, error } = await verifyAuth(request);
    if (!authenticated) {
      return NextResponse.json(
        { success: false, message: error || 'Unauthorized' },
        { status: 401 }
      );
    }

    let gyms = [];

    // If owner, get owned gyms
    if (user.role === 'owner') {
      gyms = await Gym.find({ owner: user._id, isActive: true }).select('-__v');
    } 
    // If manager, get managed gyms
    else if (user.role === 'manager') {
      gyms = await Gym.find({ managers: user._id, isActive: true }).select('-__v');
    }

    return NextResponse.json(
      {
        success: true,
        gyms,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get gyms error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error occurred' },
      { status: 500 }
    );
  }
}