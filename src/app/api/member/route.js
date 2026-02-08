import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Member from '@/models/Member';
import Plan from '@/models/Plan';
import Gym from '@/models/Gym';
import Transaction from '@/models/Transaction';
import MembershipHistory from '@/models/MembershipHistory';
import { verifyAuth } from '@/lib/middleware';
import { calculateEndDate } from '@/lib/utils';

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
    const {
      gymId,
      name,
      phoneNumber,
      gender,
      batch,
      email,
      height,
      weight,
      address,
      notes,
      dateOfBirth,
      image,
      joiningDate,
      planId,
      discount,
      amountCollected,
      paymentMode,
      sendInvoice,
    } = body;

    // Validation
    if (!gymId || !name || !phoneNumber || !gender || !batch || !joiningDate) {
      return NextResponse.json(
        { success: false, message: 'Required fields are missing' },
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

    // Get plan details if plan is selected
    let plan = null;
    let membershipStartDate = null;
    let membershipEndDate = null;
    let planPrice = 0;
    let finalPrice = 0;
    let dueAmount = 0;

    if (planId) {
      plan = await Plan.findById(planId);
      if (!plan) {
        return NextResponse.json(
          { success: false, message: 'Plan not found' },
          { status: 404 }
        );
      }

      membershipStartDate = new Date(joiningDate);
      membershipEndDate = calculateEndDate(
        membershipStartDate,
        plan.duration.value,
        plan.duration.unit
      );
      planPrice = plan.price;
      finalPrice = planPrice - (discount || 0);
      dueAmount = finalPrice - (amountCollected || 0);
    }

    // Create member
    const member = await Member.create({
      gym: gymId,
      name,
      phoneNumber,
      gender,
      batch,
      email: email || '',
      height: height || null,
      weight: weight || null,
      address: address || '',
      notes: notes || '',
      dateOfBirth: dateOfBirth || null,
      image: image || '',
      joiningDate,
      currentPlan: planId || null,
      membershipStartDate,
      membershipEndDate,
      membershipStatus: planId ? 'active' : 'active',
      planPrice,
      discount: discount || 0,
      finalPrice,
      amountPaid: amountCollected || 0,
      dueAmount,
    });

    // Create transaction if payment was made
    if (planId && amountCollected > 0) {
      await Transaction.create({
        gym: gymId,
        member: member._id,
        transactionType: 'admission',
        amount: amountCollected,
        paymentMode: paymentMode || 'cash',
        plan: planId,
        planName: plan.name,
        planDuration: `${plan.duration.value} ${plan.duration.unit}`,
        discount: discount || 0,
        invoiceSent: sendInvoice || false,
        processedBy: user._id,
        transactionDate: new Date(),
      });
    }

    // Create membership history
    if (planId) {
      await MembershipHistory.create({
        gym: gymId,
        member: member._id,
        plan: planId,
        planName: plan.name,
        startDate: membershipStartDate,
        endDate: membershipEndDate,
        planPrice,
        discount: discount || 0,
        finalPrice,
        amountPaid: amountCollected || 0,
        dueAmount,
        paymentMode: paymentMode || 'cash',
        renewalType: 'new',
        processedBy: user._id,
      });
    }

    // Populate member data
    const populatedMember = await Member.findById(member._id).populate('currentPlan');

    return NextResponse.json(
      {
        success: true,
        message: 'Member added successfully',
        member: populatedMember,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create member error:', error);
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
    const status = searchParams.get('status'); // active, expired, all
    const batch = searchParams.get('batch');

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

    // Build query
    const query = { gym: gymId, isActive: true };

    if (status && status !== 'all') {
      query.membershipStatus = status;
    }

    if (batch) {
      query.batch = batch;
    }

    // Get members
    const members = await Member.find(query)
      .populate('currentPlan')
      .sort({ createdAt: -1 });

    return NextResponse.json(
      {
        success: true,
        members,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get members error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error occurred' },
      { status: 500 }
    );
  }
}