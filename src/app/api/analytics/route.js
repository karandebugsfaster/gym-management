import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { verifyAuth } from '@/lib/middleware';
import Member from '@/models/Member';
import Transaction from '@/models/Transaction';

// Cache analytics for 5 minutes
const CACHE_TIME = 5 * 60 * 1000;
const analyticsCache = new Map();

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

    // Check cache
    const cacheKey = `analytics-${gymId}`;
    const cached = analyticsCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TIME) {
      return NextResponse.json(cached.data);
    }

    await dbConnect();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Parallel queries for better performance
    const [
      totalMembers,
      activeMembers,
      expiredMembers,
      todayTransactions,
      recentTransactions,
    ] = await Promise.all([
      Member.countDocuments({ gym: gymId, isActive: true }),
      Member.countDocuments({ 
        gym: gymId, 
        isActive: true, 
        membershipStatus: 'active' 
      }),
      Member.countDocuments({ 
        gym: gymId, 
        isActive: true, 
        membershipStatus: 'expired' 
      }),
      Transaction.find({
        gym: gymId,
        transactionDate: { $gte: today, $lt: tomorrow }
      }).lean(),
      Transaction.find({ gym: gymId })
        .sort({ transactionDate: -1 })
        .limit(10)
        .populate('member', 'name memberId')
        .populate('plan', 'name')
        .lean(),
    ]);

    // Calculate revenue
    let moneyCollectedToday = 0;
    let cashToday = 0;
    let onlineToday = 0;
    let todayAdmissions = 0;

    todayTransactions.forEach(t => {
      moneyCollectedToday += t.amount;
      if (t.paymentMode === 'cash') cashToday += t.amount;
      if (t.paymentMode === 'online') onlineToday += t.amount;
      if (t.transactionType === 'admission') todayAdmissions++;
    });

    const result = {
      success: true,
      stats: {
        totalMembers,
        activeMembers,
        expiredMembers,
      },
      revenue: {
        moneyCollectedToday,
        paymentModes: {
          cash: cashToday,
          online: onlineToday,
        },
        todayAdmissions,
      },
      recentTransactions,
    };

    // Cache the result
    analyticsCache.set(cacheKey, {
      data: result,
      timestamp: Date.now(),
    });

    // Clean old cache entries (simple cleanup)
    if (analyticsCache.size > 100) {
      const firstKey = analyticsCache.keys().next().value;
      analyticsCache.delete(firstKey);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}