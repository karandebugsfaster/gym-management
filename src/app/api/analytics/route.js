import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Member from '@/models/Member';
import Transaction from '@/models/Transaction';
import Gym from '@/models/Gym';
import { verifyAuth } from '@/lib/middleware';
import { getTodayDateRange, isExpiringToday, isExpiringSoon, isBirthdayToday } from '@/lib/utils';

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

    // Get all members for this gym
    const allMembers = await Member.find({ gym: gymId, isActive: true });

    // Calculate statistics
    const stats = {
      // Due members (members who haven't paid full amount)
      dueMembers: allMembers.filter((m) => m.dueAmount > 0).length,

      // Expiring today
      expiringToday: allMembers.filter((m) => m.membershipEndDate && isExpiringToday(m.membershipEndDate)).length,

      // Expiring soon (within 7 days)
      expiringSoon: allMembers.filter((m) => m.membershipEndDate && isExpiringSoon(m.membershipEndDate, 7)).length,

      // Birthday today
      birthdayToday: allMembers.filter((m) => m.dateOfBirth && isBirthdayToday(m.dateOfBirth)).length,

      // Active members
      activeMembers: allMembers.filter((m) => m.membershipStatus === 'active').length,

      // Expired members
      expiredMembers: allMembers.filter((m) => m.membershipStatus === 'expired').length,

      // Total members
      totalMembers: allMembers.length,
    };

    // Get today's date range
    const { start, end } = getTodayDateRange();

    // Today's transactions
    const todayTransactions = await Transaction.find({
      gym: gymId,
      transactionDate: { $gte: start, $lte: end },
    });

    // Revenue overview
    const revenue = {
      // Total money collected today
      moneyCollectedToday: todayTransactions.reduce((sum, t) => sum + t.amount, 0),

      // Today's sales (total amount from transactions)
      todaySales: todayTransactions.reduce((sum, t) => sum + t.amount, 0),

      // Today's admissions (new members)
      todayAdmissions: todayTransactions.filter((t) => t.transactionType === 'admission').length,

      // Payment mode breakdown
      paymentModes: {
        cash: todayTransactions.filter((t) => t.paymentMode === 'cash').reduce((sum, t) => sum + t.amount, 0),
        online: todayTransactions.filter((t) => t.paymentMode === 'online').reduce((sum, t) => sum + t.amount, 0),
      },
    };

    // Recent transactions (last 10)
    const recentTransactions = await Transaction.find({ gym: gymId })
      .populate('member', 'name memberId')
      .populate('plan', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    return NextResponse.json(
      {
        success: true,
        stats,
        revenue,
        recentTransactions,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error occurred' },
      { status: 500 }
    );
  }
}