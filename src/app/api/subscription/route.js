import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { verifyAuth } from '@/lib/middleware';
import Gym from '@/models/Gym';
import Subscription from '@/models/Subscription';

// GET - Get current subscription
export async function GET(req) {
  try {
    const authResult = await verifyAuth(req);
    if (!authResult.authenticated) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const gymId = searchParams.get('gymId');

    if (!gymId) {
      return NextResponse.json(
        { success: false, message: 'Gym ID is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    const gym = await Gym.findById(gymId);

    if (!gym) {
      return NextResponse.json(
        { success: false, message: 'Gym not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      subscription: gym.subscription,
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

// POST - Create/Update subscription (after payment)
export async function POST(req) {
  try {
    const authResult = await verifyAuth(req);
    if (!authResult.authenticated) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { gymId, plan, paymentId, orderId, billingCycle } = body;

    if (!gymId || !plan || !paymentId) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    await dbConnect();

    const gym = await Gym.findById(gymId);

    if (!gym) {
      return NextResponse.json(
        { success: false, message: 'Gym not found' },
        { status: 404 }
      );
    }

    // Verify gym belongs to user
    if (gym.owner.toString() !== authResult.userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Calculate subscription dates
    const startDate = new Date();
    const endDate = new Date();
    
    if (billingCycle === 'yearly') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    // Update gym subscription
    gym.subscription = {
      plan,
      status: 'active',
      startDate,
      endDate,
      trialUsed: true,
    };

    await gym.save();

    // Create subscription record
    const planPrices = {
      basic: { monthly: 999, yearly: 9990 },
      pro: { monthly: 1499, yearly: 14990 },
      premium: { monthly: 1999, yearly: 19990 },
    };

    const price = billingCycle === 'yearly' 
      ? planPrices[plan].yearly 
      : planPrices[plan].monthly;

    await Subscription.create({
      user: authResult.userId,
      gym: gymId,
      plan,
      status: 'active',
      startDate,
      endDate,
      price,
      paymentId,
      orderId,
      autoRenew: false,
      isTrial: false,
    });

    return NextResponse.json({
      success: true,
      message: 'Subscription activated successfully',
      subscription: gym.subscription,
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}