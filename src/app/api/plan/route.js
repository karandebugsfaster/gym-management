import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Plan from '@/models/Plan';
import Gym from '@/models/Gym';
import { verifyAuth } from '@/lib/middleware';
import { convertToDays } from '@/lib/utils';

export async function POST(request) {
  try {
    await dbConnect();

    const { authenticated, user, error } = await verifyAuth(request);
    if (!authenticated) {
      return NextResponse.json(
        { success: false, message: error || 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { gymId, name, duration, price, description } = body;

    // Validation
    if (!gymId || !name || !duration || !price) {
      return NextResponse.json(
        { success: false, message: 'All required fields must be provided' },
        { status: 400 }
      );
    }

    // Verify gym access
    const gym = await Gym.findById(gymId);
    if (!gym) {
      return NextResponse.json(
        { success: false, message: 'Gym not found' },
        { status: 404 }
      );
    }

    // Check if user has access to this gym
    const hasAccess =
      gym.owner.toString() === user._id.toString() ||
      gym.managers.some((m) => m.toString() === user._id.toString());

    if (!hasAccess) {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }

    // Calculate duration in days
    const durationInDays = convertToDays(duration.value, duration.unit);

    // Create plan
    const plan = await Plan.create({
      gym: gymId,
      name,
      duration,
      durationInDays,
      price,
      description: description || '',
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Plan created successfully',
        plan,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create plan error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error occurred' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    await dbConnect();

    const { authenticated, user, error } = await verifyAuth(request);
    if (!authenticated) {
      return NextResponse.json(
        { success: false, message: error || 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const gymId = searchParams.get('gymId');

    if (!gymId) {
      return NextResponse.json(
        { success: false, message: 'Gym ID is required' },
        { status: 400 }
      );
    }

    // Verify gym access
    const gym = await Gym.findById(gymId);
    if (!gym) {
      return NextResponse.json(
        { success: false, message: 'Gym not found' },
        { status: 404 }
      );
    }

    const hasAccess =
      gym.owner.toString() === user._id.toString() ||
      gym.managers.some((m) => m.toString() === user._id.toString());

    if (!hasAccess) {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }

    // Get all active plans for this gym
    const plans = await Plan.find({ gym: gymId, isActive: true }).sort({ price: 1 });

    return NextResponse.json(
      {
        success: true,
        plans,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get plans error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error occurred' },
      { status: 500 }
    );
  }
}