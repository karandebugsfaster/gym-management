"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardPage() {
  const router = useRouter();
  const {
    user,
    loading: authLoading,
    selectedGym,
    selectGym,
    logout,
  } = useAuth();

  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showGymSwitch, setShowGymSwitch] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [gyms, setGyms] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
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

        if (!selectedGym && data.gyms.length > 0) {
          selectGym(data.gyms[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching gyms:", error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(
        `/api/analytics?gymId=${selectedGym.id || selectedGym._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();

      if (data.success) {
        setAnalytics(data);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user) {
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
          <p className="text-gray-600 mb-4">No gym selected</p>
          <button
            onClick={() => router.push("/gym-info")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create Gym
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header - Mobile optimized */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 safe-top">
        <div className="flex items-center justify-between px-3 sm:px-4 py-3">
          {/* Hamburger Menu */}
          <button
            onClick={() => setShowMenu(!showMenu)}
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

          {/* Gym Name */}
          <div className="flex-1 text-center px-2">
            <button
              onClick={() => setShowGymSwitch(!showGymSwitch)}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 hover:bg-gray-100 rounded-lg transition active:scale-95"
            >
              <h1 className="text-base sm:text-lg font-bold text-gray-900 truncate max-w-[150px] sm:max-w-none">
                {selectedGym.name}
              </h1>
              <svg
                className="w-4 h-4 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            <div className="text-xs text-gray-500 bg-gray-800 text-white px-2 py-0.5 rounded inline-block mt-1">
              {user.role === "owner" ? "Admin" : "Manager"}
            </div>
          </div>

          {/* Profile Icon */}
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition active:scale-95"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base">
              {user.name.charAt(0).toUpperCase()}
            </div>
          </button>
        </div>

        {/* Location - Mobile optimized */}
        <div className="px-3 sm:px-4 pb-2.5 sm:pb-3 flex items-center gap-2 text-xs sm:text-sm text-gray-600 overflow-x-auto">
          <div className="flex items-center gap-1 bg-purple-100 px-2.5 sm:px-3 py-1 rounded-full whitespace-nowrap">
            <svg
              className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0"
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
            <span className="truncate max-w-[180px] sm:max-w-none">
              {selectedGym.location}
            </span>
          </div>
          <button className="p-1 hover:bg-gray-100 rounded flex-shrink-0">
            <svg
              className="w-3.5 h-3.5 sm:w-4 sm:h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>
          <button className="ml-auto p-1 hover:bg-gray-100 rounded flex-shrink-0">
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
        </div>
      </header>

      {/* Tutorial Video Banner - Mobile optimized */}
      <div className="mx-3 sm:mx-4 mt-3 sm:mt-4 bg-white border border-gray-200 rounded-xl p-3 sm:p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <span className="font-medium text-gray-800 text-sm sm:text-base truncate">
            Watch Tutorial Video
          </span>
        </div>
        <button className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition flex-shrink-0">
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400"
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

      {/* Today's Revenue Card - Mobile optimized */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-3 sm:mx-4 mt-3 sm:mt-4 bg-gradient-to-br from-blue-50 via-purple-50 to-blue-50 rounded-2xl p-4 sm:p-6 border-2 border-blue-100 shadow-lg"
      >
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600"
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
          <span className="text-sm font-medium text-gray-600">Today</span>
        </div>
        <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
          ₹{loading ? "..." : analytics?.revenue?.moneyCollectedToday || 0}
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div>
            <div className="text-xs text-gray-600 mb-1">Online</div>
            <div className="text-base sm:text-lg font-bold text-gray-900">
              ₹{loading ? "..." : analytics?.revenue?.paymentModes?.online || 0}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-600 mb-1">Cash</div>
            <div className="text-base sm:text-lg font-bold text-gray-900">
              ₹{loading ? "..." : analytics?.revenue?.paymentModes?.cash || 0}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats Grid - Mobile optimized */}
      <div className="px-3 sm:px-4 mt-3 sm:mt-4">
        <p className="text-xs sm:text-sm text-gray-600 mb-2.5 sm:mb-3">
          Tap below cards for details
        </p>
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
          {/* Admission Today */}
          <div className="bg-white rounded-xl p-3 sm:p-4 border-l-4 border-blue-500 shadow-sm">
            <div className="text-xs text-gray-600 mb-0.5">Admission</div>
            <div className="text-xs text-gray-500 mb-1.5 sm:mb-2">Today</div>
            <div className="flex items-center justify-between">
              <div className="text-xl sm:text-2xl font-bold text-blue-600">
                {loading ? "..." : analytics?.revenue?.todayAdmissions || 0}
              </div>
              <svg
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400"
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
            </div>
          </div>

          {/* Renewal Today */}
          <div className="bg-white rounded-xl p-3 sm:p-4 border-l-4 border-green-500 shadow-sm">
            <div className="text-xs text-gray-600 mb-0.5">Renewal</div>
            <div className="text-xs text-gray-500 mb-1.5 sm:mb-2">Today</div>
            <div className="flex items-center justify-between">
              <div className="text-xl sm:text-2xl font-bold text-green-600">
                0
              </div>
              <svg
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400"
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
            </div>
          </div>

          {/* Enquiry Today */}
          <div className="bg-white rounded-xl p-3 sm:p-4 border-l-4 border-purple-500 shadow-sm">
            <div className="text-xs text-gray-600 mb-0.5">Enquiry</div>
            <div className="text-xs text-gray-500 mb-1.5 sm:mb-2">Today</div>
            <div className="flex items-center justify-between">
              <div className="text-xl sm:text-2xl font-bold text-purple-600">
                0
              </div>
              <svg
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400"
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
            </div>
          </div>

          {/* Due Paid Today */}
          <div className="bg-white rounded-xl p-3 sm:p-4 border-l-4 border-orange-500 shadow-sm">
            <div className="text-xs text-gray-600 mb-0.5">Due Paid</div>
            <div className="text-xs text-gray-500 mb-1.5 sm:mb-2">Today</div>
            <div className="flex items-center justify-between">
              <div className="text-xl sm:text-2xl font-bold text-orange-600">
                0
              </div>
              <svg
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400"
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
            </div>
          </div>
        </div>
      </div>

      {/* Member Stats - Mobile optimized */}
      <div className="px-3 sm:px-4 mt-4 sm:mt-6 grid grid-cols-2 gap-3 sm:gap-4">
        {/* Expired Members */}
        <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl p-4 sm:p-6 text-center shadow-sm">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-full mx-auto mb-2.5 sm:mb-3 flex items-center justify-center">
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6 text-red-600"
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
          <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
            {loading ? "..." : analytics?.stats?.expiredMembers || 0}
          </div>
          <div className="text-xs sm:text-sm text-gray-600">
            Expired Members
          </div>
        </div>

        {/* Total Members */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-4 sm:p-6 text-center shadow-sm">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full mx-auto mb-2.5 sm:mb-3 flex items-center justify-center">
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600"
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
          <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
            {loading ? "..." : analytics?.stats?.totalMembers || 0}
          </div>
          <div className="text-xs sm:text-sm text-gray-600">Total Members</div>
        </div>
      </div>

      {/* Action Buttons - Updated with all features */}
      <div className="px-3 sm:px-4 mt-4 sm:mt-6 grid grid-cols-2 gap-3 sm:gap-4">
        <button
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
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            <span className="text-sm sm:text-base font-semibold">Manager</span>
          </div>
        </button>

        <button
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
            <span className="text-sm sm:text-base font-semibold">Finance</span>
          </div>
        </button>

        <button
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
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <span className="text-sm sm:text-base font-semibold">Staff</span>
          </div>
        </button>

        <button
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
            <span className="text-sm sm:text-base font-semibold">Reports</span>
          </div>
        </button>
      </div>

      {/* Recent Transactions - Mobile optimized */}
      <div className="px-3 sm:px-4 mt-4 sm:mt-6 mb-6">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-2.5 sm:mb-3">
          Recent Transactions
        </h2>
        {loading ? (
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

      {/* Profile Modal - Mobile optimized */}
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
              className="fixed right-0 top-0 bottom-0 w-full sm:w-80 bg-white z-50 shadow-2xl overflow-y-auto"
            >
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                    Profile
                  </h2>
                  <button
                    onClick={() => setShowProfile(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg active:scale-95"
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

                <div className="text-sm text-gray-600 mb-4 sm:mb-6">
                  Here's your profile information.
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-2">
                      Name
                    </label>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <svg
                        className="w-5 h-5 text-gray-400 flex-shrink-0"
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
                      <span className="text-gray-900 text-sm sm:text-base truncate">
                        {user.name}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-2">
                      Gym Name
                    </label>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <svg
                        className="w-5 h-5 text-gray-400 flex-shrink-0"
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
                      <span className="text-gray-900 text-sm sm:text-base truncate">
                        {selectedGym.name}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-2">
                      Email
                    </label>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <svg
                        className="w-5 h-5 text-gray-400 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="text-gray-900 text-sm sm:text-base truncate">
                        {user.email}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-2">
                      Phone Number
                    </label>
                    <div className="grid grid-cols-3 gap-2 sm:gap-3">
                      <div className="flex items-center justify-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-900 text-sm sm:text-base">
                          {user.dialCode}
                        </span>
                      </div>
                      <div className="col-span-2 flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <svg
                          className="w-5 h-5 text-gray-400 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                        <span className="text-gray-900 text-sm sm:text-base truncate">
                          {user.phoneNumber}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button className="w-full p-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition text-sm sm:text-base active:scale-95">
                    Update Profile
                  </button>

                  <button className="w-full p-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition flex items-center justify-center gap-2 text-sm sm:text-base active:scale-95">
                    <span className="text-2xl">🇬🇧</span>
                    <span>English</span>
                    <svg
                      className="w-4 h-4 ml-auto"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  <button className="w-full p-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition text-sm sm:text-base active:scale-95">
                    Update Terms & Conditions
                  </button>

                  <button className="w-full p-3 border-2 border-red-500 text-red-500 rounded-lg font-medium hover:bg-red-50 transition flex items-center justify-center gap-2 text-sm sm:text-base active:scale-95">
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
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Delete My Account
                  </button>

                  <button
                    onClick={logout}
                    className="w-full p-3 text-gray-600 rounded-lg font-medium hover:bg-gray-100 transition flex items-center justify-center gap-2 text-sm sm:text-base active:scale-95"
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
                    Logout
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Gym Switch Modal - Mobile optimized */}
      <AnimatePresence>
        {showGymSwitch && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setShowGymSwitch(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md mx-4 bg-white rounded-2xl p-4 sm:p-6 z-50 shadow-2xl max-h-[80vh] overflow-y-auto"
            >
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">
                Switch Gym
              </h2>
              <div className="space-y-2 mb-4">
                {gyms.map((gym) => (
                  <button
                    key={gym._id}
                    onClick={() => {
                      selectGym(gym);
                      setShowGymSwitch(false);
                    }}
                    className={`w-full p-3 sm:p-4 rounded-xl text-left transition active:scale-95 ${
                      selectedGym?._id === gym._id ||
                      selectedGym?.id === gym._id
                        ? "bg-blue-50 border-2 border-blue-500"
                        : "bg-gray-50 hover:bg-gray-100 border-2 border-transparent"
                    }`}
                  >
                    <div className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                      {gym.name}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 truncate">
                      {gym.location}
                    </div>
                  </button>
                ))}
              </div>
              <button
                onClick={() => {
                  setShowGymSwitch(false);
                  router.push("/gym-info");
                }}
                className="w-full p-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition text-sm sm:text-base active:scale-95"
              >
                + Add New Gym
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Add safe area CSS */}
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
