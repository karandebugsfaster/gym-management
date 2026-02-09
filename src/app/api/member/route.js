import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { verifyAuth } from '@/lib/middleware';
import Member from '@/models/Member';
import Plan from '@/models/Plan';
import Transaction from '@/models/Transaction';
import MembershipHistory from '@/models/MembershipHistory';
import { calculateEndDate } from '@/lib/utils';

// GET - Fetch members
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
    const status = searchParams.get('status');
    const batch = searchParams.get('batch');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 50;
    const skip = (page - 1) * limit;

    if (!gymId) {
      return NextResponse.json(
        { success: false, message: 'Gym ID is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    const query = { gym: gymId, isActive: true };
    
    if (status === 'active') {
      query.membershipStatus = 'active';
    } else if (status === 'expired') {
      query.membershipStatus = 'expired';
    }
    
    if (batch) {
      query.batch = batch;
    }

    // Parallel queries for total count and paginated data
    const [members, totalCount] = await Promise.all([
      Member.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('currentPlan', 'name price duration')
        .select('-__v')
        .lean(),
      Member.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      members,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: skip + members.length < totalCount,
      },
    });
  } catch (error) {
    console.error('Error fetching members:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

// POST - Create new member
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
    
    // Destructure ALL fields from body
    const {
      gymId,
      memberId,
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

    // Validation - Check required fields
    if (
      !gymId ||
      !memberId ||
      !name ||
      !phoneNumber ||
      !gender ||
      !batch ||
      !joiningDate
    ) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Required fields are missing. Please provide: gymId, memberId, name, phoneNumber, gender, batch, and joiningDate' 
        },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if memberId already exists in this gym
    const existingMember = await Member.findOne({ memberId, gym: gymId });
    if (existingMember) {
      return NextResponse.json(
        { success: false, message: 'Member ID already exists in this gym. Please use a different ID.' },
        { status: 400 }
      );
    }

    // If plan is assigned, fetch plan details
    let planDetails = null;
    let membershipStartDate = null;
    let membershipEndDate = null;
    let finalPrice = 0;
    let dueAmount = 0;

    if (planId) {
      planDetails = await Plan.findById(planId);
      
      if (!planDetails) {
        return NextResponse.json(
          { success: false, message: 'Plan not found' },
          { status: 404 }
        );
      }

      // Calculate membership dates
      membershipStartDate = new Date(joiningDate);
      membershipEndDate = calculateEndDate(membershipStartDate, planDetails.durationInDays);

      // Calculate pricing
      const planPrice = planDetails.price;
      const discountAmount = discount || 0;
      finalPrice = planPrice - discountAmount;
      const amountPaid = amountCollected || 0;
      dueAmount = finalPrice - amountPaid;
    }

    // Create member object
    const memberData = {
      gym: gymId,
      memberId,
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
      planPrice: planDetails ? planDetails.price : 0,
      discount: discount || 0,
      finalPrice,
      amountPaid: amountCollected || 0,
      dueAmount,
      isActive: true,
    };

    // Create member
    const member = await Member.create(memberData);

// If plan is assigned, create transaction and membership history
if (planId && amountCollected > 0) {
  // Create transaction
  await Transaction.create({
    gym: gymId,
    member: member._id,
    plan: planId,
    planName: planDetails.name,
    transactionType: 'admission',
    amount: amountCollected,
    paymentMode: paymentMode || 'cash',
    transactionDate: new Date(),
    invoiceSent: sendInvoice || false,
  });

  // Create membership history - NOW WITH ALL REQUIRED FIELDS
  await MembershipHistory.create({
    gym: gymId,
    member: member._id,
    plan: planId,
    planName: planDetails.name,          // ✅ ADDED
    planPrice: planDetails.price,        // ✅ ADDED
    startDate: membershipStartDate,
    endDate: membershipEndDate,
    renewalType: 'new',
    amountPaid: amountCollected,
    discount: discount || 0,
    finalPrice: finalPrice,              // ✅ ADDED
    paymentMode: paymentMode || 'cash',
  });
}

    // Populate plan details before returning
    const populatedMember = await Member.findById(member._id)
      .populate('currentPlan', 'name price duration')
      .lean();

    return NextResponse.json({
      success: true,
      message: 'Member created successfully',
      member: populatedMember,
    });

  } catch (error) {
    console.error('Create member error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}

// PUT - Update member
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
    const { memberId, ...updateData } = body;

    if (!memberId) {
      return NextResponse.json(
        { success: false, message: 'Member ID is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    const member = await Member.findByIdAndUpdate(
      memberId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('currentPlan', 'name price duration');

    if (!member) {
      return NextResponse.json(
        { success: false, message: 'Member not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Member updated successfully',
      member,
    });

  } catch (error) {
    console.error('Update member error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

// DELETE - Soft delete member
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
    const memberId = searchParams.get('memberId');

    if (!memberId) {
      return NextResponse.json(
        { success: false, message: 'Member ID is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    const member = await Member.findByIdAndUpdate(
      memberId,
      { $set: { isActive: false } },
      { new: true }
    );

    if (!member) {
      return NextResponse.json(
        { success: false, message: 'Member not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Member deleted successfully',
    });

  } catch (error) {
    console.error('Delete member error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}