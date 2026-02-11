"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import AddMemberModal from "@/components/manager/AddMemberModal";
import PlansTab from "@/components/manager/PlansTab";
import EditableProfile from "@/components/EditableProfile";

export default function DashboardPage() {
  const router = useRouter();
  const {
    user,
    loading: authLoading,
    selectedGym,
    selectGym,
    logout,
  } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showAddPlanModal, setShowAddPlanModal] = useState(false);
  const [showGymSwitcher, setShowGymSwitcher] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [gyms, setGyms] = useState([]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
    } else if (!authLoading && user?.role === "manager") {
      router.push("/manager");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && user.role === "owner") {
      fetchGyms();
    }
  }, [user]);

  useEffect(() => {
    if (selectedGym) {
      fetchAnalytics();
    }
  }, [selectedGym]);

  const fetchGyms = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/gym", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setGyms(data.gyms);
      }
    } catch (error) {
      console.error("Error fetching gyms:", error);
    }
  };

  const fetchAnalytics = async () => {
    if (!selectedGym) return;

    try {
      setLoadingAnalytics(true);
      const token = localStorage.getItem("token");

      // Fetch analytics
      const analyticsRes = await fetch(
        `/api/analytics?gymId=${selectedGym.id || selectedGym._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const analyticsData = await analyticsRes.json();

      if (analyticsData.success) {
        setAnalytics(analyticsData);
      }

      // Fetch all members to calculate expired count
      const membersRes = await fetch(
        `/api/member?gymId=${selectedGym.id || selectedGym._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const membersData = await membersRes.json();

      if (membersData.success) {
        // Calculate expired members
        const now = new Date();
        const expiredCount = membersData.members.filter((member) => {
          if (!member.membershipEndDate) return false;
          return new Date(member.membershipEndDate) < now;
        }).length;

        // Update analytics with expired count
        setAnalytics((prev) => ({
          ...prev,
          stats: {
            ...prev.stats,
            expiredMembers: expiredCount,
          },
        }));
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const handleGymSwitch = (gym) => {
    selectGym(gym);
    setShowGymSwitcher(false);
  };

  //     const fetchAnalytics = async () => {
  //     try {
  //       setLoading(true);
  //       const token = localStorage.getItem("token");
  //       const res = await fetch(
  //         `/api/analytics?gymId=${selectedGym.id || selectedGym._id}`,
  //         {
  //           headers: { Authorization: `Bearer ${token}` },
  //         },
  //       );
  //       const data = await res.json();

  //       if (data.success) {
  //         setAnalytics(data);
  //       }
  //     } catch (error) {
  //       console.error("Error fetching analytics:", error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  if (authLoading || !user || user.role !== "owner") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!selectedGym) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            No Gym Selected
          </h2>
          <p className="text-gray-600 mb-6">
            Please select or create a gym to continue
          </p>
          <button
            onClick={() => router.push("/gym-info")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Create Gym
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 safe-top">
        <div className="flex items-center justify-between px-3 sm:px-4 py-3">
          {/* Hamburger Menu */}
          <button
            onClick={() => setShowMenu(true)}
            className="p-2 hover:bg-gray-100 rounded-lg transition active:scale-95"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {/* Gym Name & Location */}
          <div className="flex-1 text-center">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
              {selectedGym.name}
            </h1>
            <button
              onClick={() => setShowGymSwitcher(true)}
              className="flex items-center gap-1 text-xs sm:text-sm text-gray-600 hover:text-gray-900 transition mx-auto"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span className="truncate max-w-[200px]">
                {selectedGym.location}
              </span>
            </button>
          </div>

          {/* Profile Icon */}
          <button
            onClick={() => setShowProfile(true)}
            className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-base hover:scale-110 transition"
          >
            {user.name.charAt(0).toUpperCase()}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-3 sm:p-4 max-w-7xl mx-auto">
        {/* Quick Stats */}
        <div className="mb-4 sm:mb-6">
          <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
            Tap below cards for details
          </p>

          {loadingAnalytics ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6">
              {/* Today Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border-l-4 border-blue-500"
              >
                <div className="text-xs sm:text-sm text-gray-600 mb-1">
                  Admission
                </div>
                <div className="text-xs text-gray-500 mb-2">Today</div>
                <div className="text-3xl sm:text-4xl font-bold text-blue-600">
                  {analytics?.revenue?.todayAdmissions || 0}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border-l-4 border-green-500"
              >
                <div className="text-xs sm:text-sm text-gray-600 mb-1">
                  Renewal
                </div>
                <div className="text-xs text-gray-500 mb-2">Today</div>
                <div className="text-3xl sm:text-4xl font-bold text-green-600">
                  0
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border-l-4 border-purple-500"
              >
                <div className="text-xs sm:text-sm text-gray-600 mb-1">
                  Enquiry
                </div>
                <div className="text-xs text-gray-500 mb-2">Today</div>
                <div className="text-3xl sm:text-4xl font-bold text-purple-600">
                  0
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border-l-4 border-orange-500"
              >
                <div className="text-xs sm:text-sm text-gray-600 mb-1">
                  Due Paid
                </div>
                <div className="text-xs text-gray-500 mb-2">Today</div>
                <div className="text-3xl sm:text-4xl font-bold text-orange-600">
                  0
                </div>
              </motion.div>
            </div>
          )}
        </div>

        {/* Member Stats */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl p-4 sm:p-6 border-2 border-red-100"
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 sm:w-7 sm:h-7 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
              {analytics?.stats?.expiredMembers || 0}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">
              Expired Members
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-4 sm:p-6 border-2 border-blue-100"
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
              {analytics?.stats?.totalMembers || 0}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">
              Total Members
            </div>
          </motion.div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <motion.button
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            onClick={() => router.push("/manager")}
            className="bg-gradient-to-br from-purple-500 to-blue-500 text-white rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all active:scale-95"
          >
            <div className="flex flex-col items-center justify-center gap-2 sm:gap-3">
              <svg
                className="w-6 h-6 sm:w-7 sm:h-7"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <span className="text-sm sm:text-base font-semibold">
                Manager
              </span>
            </div>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            onClick={() => router.push("/finance")}
            className="bg-gradient-to-br from-blue-500 to-purple-500 text-white rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all active:scale-95"
          >
            <div className="flex flex-col items-center justify-center gap-2 sm:gap-3">
              <svg
                className="w-6 h-6 sm:w-7 sm:h-7"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-sm sm:text-base font-semibold">
                Finance
              </span>
            </div>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            onClick={() => router.push("/staff")}
            className="bg-gradient-to-br from-green-500 to-teal-500 text-white rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all active:scale-95"
          >
            <div className="flex flex-col items-center justify-center gap-2 sm:gap-3">
              <svg
                className="w-6 h-6 sm:w-7 sm:h-7"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              <span className="text-sm sm:text-base font-semibold">Staff</span>
            </div>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 }}
            onClick={() => router.push("/reports")}
            className="bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all active:scale-95"
          >
            <div className="flex flex-col items-center justify-center gap-2 sm:gap-3">
              <svg
                className="w-6 h-6 sm:w-7 sm:h-7"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <span className="text-sm sm:text-base font-semibold">
                Reports
              </span>
            </div>
          </motion.button>
        </div>
      </div>

      {/* Navigation - Mobile Bottom Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-bottom z-30 sm:hidden">
        <div className="grid grid-cols-5 h-16">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex flex-col items-center justify-center gap-1 text-blue-600"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            <span className="text-xs font-medium">Home</span>
          </button>

          <button
            onClick={() => router.push("/manager")}
            className="flex flex-col items-center justify-center gap-1 text-gray-600"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <span className="text-xs font-medium">Manager</span>
          </button>

          <button
            onClick={() => router.push("/pricing")}
            className="flex flex-col items-center justify-center gap-1 text-gray-600"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            <span className="text-xs font-medium">Plans</span>
          </button>

          <button
            onClick={() => setShowGymSwitcher(true)}
            className="flex flex-col items-center justify-center gap-1 text-gray-600"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            <span className="text-xs font-medium">Gyms</span>
          </button>

          <button
            onClick={() => setShowMenu(true)}
            className="flex flex-col items-center justify-center gap-1 text-gray-600"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
            <span className="text-xs font-medium">Menu</span>
          </button>
        </div>
      </nav>

      {/* Recent Transactions - Mobile optimized */}
      <div className="px-3 sm:px-4 mt-4 sm:mt-6 mb-6">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-2.5 sm:mb-3">
          Recent Transactions
        </h2>
        {loadingAnalytics ? (
          <div className="bg-white rounded-xl p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent mx-auto"></div>
          </div>
        ) : analytics?.recentTransactions?.length > 0 ? (
          <div className="space-y-2.5 sm:space-y-3">
            {analytics.recentTransactions.map((transaction) => (
              <div
                key={transaction._id}
                className="bg-white rounded-xl p-3 sm:p-4 border-l-4 border-green-500 shadow-sm"
              >
                <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                  <div className="flex-1 min-w-0 pr-3">
                    <div className="font-semibold text-gray-900 capitalize text-sm sm:text-base truncate">
                      {transaction.transactionType}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 truncate">
                      {transaction.member?.name || "N/A"}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-bold text-green-600 text-sm sm:text-base">
                      +₹{transaction.amount}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(transaction.transactionDate).toLocaleDateString()} -{" "}
                  {transaction.planName || transaction.plan?.name || "N/A"}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-8 text-center text-gray-500 text-sm sm:text-base">
            No transactions yet
          </div>
        )}
      </div>

      {/* Floating Action Button - Mobile optimized with safe area */}
      <button
        onClick={() => setShowAddMenu(!showAddMenu)}
        className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-transform z-30"
      >
        <svg
          className={`w-7 h-7 transition-transform ${showAddMenu ? "rotate-45" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
      </button>

      {/* Add Menu Modal - Mobile optimized */}
      <AnimatePresence>
        {showAddMenu && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setShowAddMenu(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl p-4 sm:p-6 z-50 shadow-2xl safe-bottom max-h-[80vh] overflow-y-auto"
            >
              <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4 sm:mb-6"></div>
              <div className="space-y-2 sm:space-y-3">
                <button
                  onClick={() => {
                    setShowAddMenu(false);
                    router.push("/manager?tab=members&action=add");
                  }}
                  className="w-full flex items-center gap-3 sm:gap-4 p-3 sm:p-4 hover:bg-gray-50 active:bg-gray-100 rounded-xl transition"
                >
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                    />
                  </svg>
                  <span className="font-medium text-gray-900 text-sm sm:text-base">
                    Add Member
                  </span>
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 ml-auto flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>

                <button
                  onClick={() => {
                    setShowAddMenu(false);
                    router.push("/manager?tab=plans&action=add");
                  }}
                  className="w-full flex items-center gap-3 sm:gap-4 p-3 sm:p-4 hover:bg-gray-50 active:bg-gray-100 rounded-xl transition"
                >
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  <span className="font-medium text-gray-900 text-sm sm:text-base">
                    Add Plan
                  </span>
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 ml-auto flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>

                <button className="w-full flex items-center gap-3 sm:gap-4 p-3 sm:p-4 hover:bg-gray-50 active:bg-gray-100 rounded-xl transition">
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="font-medium text-gray-900 text-sm sm:text-base">
                    Add Enquiry
                  </span>
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 ml-auto flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>

                <button className="w-full flex items-center gap-3 sm:gap-4 p-3 sm:p-4 hover:bg-gray-50 active:bg-gray-100 rounded-xl transition">
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                  <span className="font-medium text-gray-900 text-sm sm:text-base">
                    Add Expense
                  </span>
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 ml-auto flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>

                <button className="w-full flex items-center gap-3 sm:gap-4 p-3 sm:p-4 hover:bg-gray-50 active:bg-gray-100 rounded-xl transition">
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                  <span className="font-medium text-gray-900 text-sm sm:text-base">
                    Add Outlet
                  </span>
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 ml-auto flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>

                <button className="w-full flex items-center gap-3 sm:gap-4 p-3 sm:p-4 hover:bg-gray-50 active:bg-gray-100 rounded-xl transition">
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span className="font-medium text-gray-900 text-sm sm:text-base">
                    Add Staff / Admin Login
                  </span>
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 ml-auto flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Hamburger Menu Modal */}
      <AnimatePresence>
        {showMenu && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setShowMenu(false)}
            />
            <motion.div
              initial={{ opacity: 0, x: -300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -300 }}
              className="fixed left-0 top-0 bottom-0 w-full sm:w-80 bg-white z-50 shadow-2xl overflow-y-auto safe-top"
            >
              <div className="p-4 sm:p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                    Menu
                  </h2>
                  <button
                    onClick={() => setShowMenu(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* Current Plan Card */}
                <div className="mb-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-4 sm:p-5 text-white">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-xs opacity-90 mb-1">
                        Current Plan
                      </div>
                      <div className="text-xl sm:text-2xl font-bold capitalize">
                        {selectedGym?.subscription?.plan || "Trial"}
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <div className="opacity-90 mb-1">Expires on</div>
                      <div className="font-semibold">
                        {selectedGym?.subscription?.endDate
                          ? new Date(
                              selectedGym.subscription.endDate,
                            ).toLocaleDateString("en-IN")
                          : "N/A"}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="opacity-90 mb-1">Days Left</div>
                      <div className="font-bold text-lg">
                        {(() => {
                          if (!selectedGym?.subscription?.endDate) return "0";
                          const now = new Date();
                          const end = new Date(
                            selectedGym.subscription.endDate,
                          );
                          const diffTime = end - now;
                          const diffDays = Math.ceil(
                            diffTime / (1000 * 60 * 60 * 24),
                          );
                          return Math.max(0, diffDays);
                        })()}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-white border-opacity-20">
                    <div className="text-xs opacity-90 mb-1">Status</div>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          selectedGym?.subscription?.status === "active"
                            ? "bg-green-400"
                            : "bg-yellow-400"
                        }`}
                      />
                      <span className="font-medium capitalize">
                        {selectedGym?.subscription?.status || "Trial"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Upgrade Plan Button */}
                <button
                  onClick={() => {
                    setShowMenu(false);
                    router.push("/pricing");
                  }}
                  className="w-full mb-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition shadow-lg flex items-center justify-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  <span>Upgrade Plan</span>
                </button>

                {/* Menu Options */}
                <div className="space-y-2">
                  <MenuOption
                    icon={<DashboardIcon />}
                    label="Dashboard"
                    onClick={() => {
                      setShowMenu(false);
                      router.push("/dashboard");
                    }}
                  />

                  <MenuOption
                    icon={<ManagerIcon />}
                    label="Manager"
                    onClick={() => {
                      setShowMenu(false);
                      router.push("/manager");
                    }}
                  />

                  <MenuOption
                    icon={<FinanceIcon />}
                    label="Finance"
                    onClick={() => {
                      setShowMenu(false);
                      router.push("/finance");
                    }}
                  />

                  <MenuOption
                    icon={<StaffIcon />}
                    label="Staff"
                    onClick={() => {
                      setShowMenu(false);
                      router.push("/staff");
                    }}
                  />

                  <MenuOption
                    icon={<ReportsIcon />}
                    label="Reports"
                    onClick={() => {
                      setShowMenu(false);
                      router.push("/reports");
                    }}
                  />

                  <MenuOption
                    icon={<ManagersIcon />}
                    label="Manage Managers"
                    onClick={() => {
                      setShowMenu(false);
                      router.push("/managers");
                    }}
                  />

                  <div className="border-t border-gray-200 my-3 sm:my-4"></div>

                  <MenuOption
                    icon={<ProfileIcon />}
                    label="Profile"
                    onClick={() => {
                      setShowMenu(false);
                      setShowProfile(true);
                    }}
                  />

                  <MenuOption
                    icon={<SettingsIcon />}
                    label="Settings"
                    onClick={() => {
                      setShowMenu(false);
                    }}
                  />

                  <MenuOption
                    icon={<HelpIcon />}
                    label="Help & Support"
                    onClick={() => {
                      setShowMenu(false);
                    }}
                  />

                  <div className="border-t border-gray-200 my-3 sm:my-4"></div>

                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 p-3 text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Gym Switcher Modal */}
      <AnimatePresence>
        {showGymSwitcher && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowGymSwitcher(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full max-w-md rounded-2xl p-4 sm:p-6 max-h-[80vh] overflow-y-auto"
            >
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
                Switch Gym
              </h3>
              <div className="space-y-3">
                {gyms.map((gym) => (
                  <button
                    key={gym._id}
                    onClick={() => handleGymSwitch(gym)}
                    className={`w-full p-4 rounded-xl text-left transition ${
                      selectedGym?._id === gym._id ||
                      selectedGym?.id === gym._id
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                    }`}
                  >
                    <div className="font-semibold mb-1">{gym.name}</div>
                    <div className="text-sm opacity-90">{gym.location}</div>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Modal */}
      <AnimatePresence>
        {showProfile && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setShowProfile(false)}
            />
            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              className="fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-white z-50 shadow-2xl overflow-y-auto"
            >
              <EditableProfile
                user={user}
                selectedGym={selectedGym}
                onClose={() => setShowProfile(false)}
                onUpdate={(updatedUser) => {
                  // Update user state if needed
                  localStorage.setItem("user", JSON.stringify(updatedUser));
                }}
                onLogout={logout}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modals */}
      <AddMemberModal
        isOpen={showAddMemberModal}
        onClose={() => setShowAddMemberModal(false)}
        onSuccess={fetchAnalytics}
      />

      {/* <AddPlanModal
        isOpen={showAddPlanModal}
        onClose={() => setShowAddPlanModal(false)}
        onSuccess={() => {}}
      /> */}

      <style jsx>{`
        .safe-top {
          padding-top: env(safe-area-inset-top);
        }
        .safe-bottom {
          padding-bottom: env(safe-area-inset-bottom);
        }
      `}</style>
    </div>
  );
}

// Menu Option Component
function MenuOption({ icon, label, onClick, badge }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition text-left"
    >
      <div className="text-gray-600">{icon}</div>
      <span className="flex-1 font-medium text-gray-900">{label}</span>
      {badge && (
        <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs font-semibold rounded-full">
          {badge}
        </span>
      )}
      <svg
        className="w-5 h-5 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5l7 7-7 7"
        />
      </svg>
    </button>
  );
}

// Menu Icons
const DashboardIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
    />
  </svg>
);

const ManagerIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
    />
  </svg>
);

const FinanceIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const StaffIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
    />
  </svg>
);

const ReportsIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
    />
  </svg>
);

const ManagersIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
    />
  </svg>
);

const ProfileIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
  </svg>
);

const SettingsIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

const HelpIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);
