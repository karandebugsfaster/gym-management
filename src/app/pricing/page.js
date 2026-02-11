"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { usePlanLimits } from "@/hooks/usePlanLimits";

export default function PricingPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [billingCycle, setBillingCycle] = useState("monthly");
  const { selectedGym } = useAuth();
  const { currentPlan } = usePlanLimits();
  const [processingPayment, setProcessingPayment] = useState(false);

  const handleSelectPlan = async (plan) => {
    if (!selectedGym) {
      alert("Please select a gym first");
      return;
    }

    if (plan.id === currentPlan) {
      alert("You are already on this plan");
      return;
    }

    setProcessingPayment(true);

    try {
      const amount = billingCycle === "monthly" ? plan.price : plan.yearlyPrice;
      const token = localStorage.getItem("token");

      // Create order
      const orderRes = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount,
          plan: plan.id,
          billingCycle,
          gymId: selectedGym.id || selectedGym._id,
        }),
      });

      const orderData = await orderRes.json();

      if (!orderData.success) {
        throw new Error(orderData.message);
      }

      // Initialize Razorpay
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Gym Management SaaS",
        description: `${plan.name} Plan - ${billingCycle === "monthly" ? "Monthly" : "Yearly"}`,
        order_id: orderData.orderId,
        handler: async function (response) {
          // Verify payment
          const verifyRes = await fetch("/api/payment/verify", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(response),
          });

          const verifyData = await verifyRes.json();

          if (verifyData.success) {
            // Update subscription
            const subRes = await fetch("/api/subscription", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                gymId: selectedGym.id || selectedGym._id,
                plan: plan.id,
                paymentId: verifyData.paymentId,
                orderId: verifyData.orderId,
                billingCycle,
              }),
            });

            const subData = await subRes.json();

            if (subData.success) {
              alert("Payment successful! Your plan has been upgraded.");
              window.location.reload();
            }
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.dialCode + user.phoneNumber,
        },
        theme: {
          color: "#9333EA",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Payment error:", error);
      alert("Payment failed. Please try again.");
    } finally {
      setProcessingPayment(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
    } else if (!authLoading && user?.role === "manager") {
      router.push("/manager");
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  const plans = [
    {
      id: "basic",
      name: "Basic",
      price: 999,
      yearlyPrice: 9990,
      color: "from-blue-500 to-cyan-500",
      popular: false,
      description: "Perfect for small gyms just getting started",
      features: [
        { text: "Up to 50 Members", included: true },
        { text: "1 Gym Location", included: true },
        { text: "Basic Analytics", included: true },
        { text: "Member Management", included: true },
        { text: "Plan Management", included: true },
        { text: "Email Support", included: true },
        { text: "WhatsApp Notifications", included: false },
        { text: "Staff Management", included: false },
        { text: "Advanced Reports", included: false },
        { text: "Invoice Generation", included: false },
        { text: "Custom Branding", included: false },
        { text: "Priority Support", included: false },
      ],
    },
    {
      id: "pro",
      name: "Pro",
      price: 1499,
      yearlyPrice: 14990,
      color: "from-purple-500 to-pink-500",
      popular: true,
      description: "Best for growing gyms with multiple trainers",
      features: [
        { text: "Up to 200 Members", included: true },
        { text: "Up to 3 Gym Locations", included: true },
        { text: "Advanced Analytics", included: true },
        { text: "Member Management", included: true },
        { text: "Plan Management", included: true },
        { text: "Staff Management", included: true },
        { text: "WhatsApp Notifications", included: true },
        { text: "Email Notifications", included: true },
        { text: "Invoice Generation", included: true },
        { text: "Advanced Reports", included: true },
        { text: "Custom Branding", included: false },
        { text: "Priority Support", included: false },
      ],
    },
    {
      id: "premium",
      name: "Premium",
      price: 1999,
      yearlyPrice: 19990,
      color: "from-orange-500 to-red-500",
      popular: false,
      description: "For large gyms that need everything",
      features: [
        { text: "Unlimited Members", included: true },
        { text: "Unlimited Gym Locations", included: true },
        { text: "Advanced Analytics", included: true },
        { text: "Member Management", included: true },
        { text: "Plan Management", included: true },
        { text: "Staff Management", included: true },
        { text: "WhatsApp Notifications", included: true },
        { text: "Email Notifications", included: true },
        { text: "Invoice Generation", included: true },
        { text: "Advanced Reports", included: true },
        { text: "Custom Branding", included: true },
        { text: "Priority Support (24/7)", included: true },
        { text: "Dedicated Account Manager", included: true },
        { text: "API Access", included: true },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 pb-12">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 safe-top">
        <div className="flex items-center justify-between px-3 sm:px-4 py-3">
          <button
            onClick={() => router.push("/dashboard")}
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <h1 className="text-lg sm:text-xl font-bold text-gray-900">
            Choose Your Plan
          </h1>

          <div className="w-10"></div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="text-center px-4 pt-8 sm:pt-12 pb-6 sm:pb-8">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4"
        >
          Simple, Transparent Pricing
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto"
        >
          Choose the perfect plan for your gym. Upgrade, downgrade, or cancel
          anytime.
        </motion.p>

        {/* Billing Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center bg-white rounded-full p-1 shadow-md"
        >
          <button
            onClick={() => setBillingCycle("monthly")}
            className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-full font-medium text-sm sm:text-base transition ${
              billingCycle === "monthly"
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle("yearly")}
            className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-full font-medium text-sm sm:text-base transition relative ${
              billingCycle === "yearly"
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Yearly
            <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
              Save 17%
            </span>
          </button>
        </motion.div>
      </div>

      {/* Pricing Cards - Mobile First */}
      <div className="px-3 sm:px-4 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative bg-white rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden ${
                plan.popular
                  ? "ring-4 ring-purple-500 transform lg:scale-105"
                  : ""
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 sm:px-6 py-1.5 sm:py-2 rounded-bl-2xl text-xs sm:text-sm font-bold">
                  MOST POPULAR
                </div>
              )}

              {/* Card Content */}
              <div className="p-6 sm:p-8">
                {/* Plan Name & Icon */}
                <div
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${plan.color} mb-4 sm:mb-6 flex items-center justify-center`}
                >
                  <svg
                    className="w-7 h-7 sm:w-8 sm:h-8 text-white"
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

                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 min-h-[40px]">
                  {plan.description}
                </p>

                {/* Price */}
                <div className="mb-6 sm:mb-8">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl sm:text-5xl font-bold text-gray-900">
                      ₹
                      {billingCycle === "monthly"
                        ? plan.price
                        : Math.round(plan.yearlyPrice / 12)}
                    </span>
                    <span className="text-gray-600">/month</span>
                  </div>
                  {billingCycle === "yearly" && (
                    <p className="text-sm text-gray-500 mt-1">
                      ₹{plan.yearlyPrice} billed annually
                    </p>
                  )}
                </div>

                <button
                  onClick={() => handleSelectPlan(plan)}
                  disabled={processingPayment || plan.id === currentPlan}
                  className={`w-full py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg transition transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                    plan.popular
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg hover:shadow-xl"
                      : "bg-gray-900 text-white hover:bg-gray-800"
                  }`}
                >
                  {processingPayment
                    ? "Processing..."
                    : plan.id === currentPlan
                      ? "Current Plan"
                      : "Get Started"}
                </button>

                {/* Features List */}
                <div className="mt-6 sm:mt-8 space-y-3 sm:space-y-4">
                  <div className="text-xs sm:text-sm font-semibold text-gray-900 mb-3 sm:mb-4">
                    What's included:
                  </div>
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div
                        className={`flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center ${
                          feature.included ? "bg-green-100" : "bg-gray-100"
                        }`}
                      >
                        {feature.included ? (
                          <svg
                            className="w-3 h-3 sm:w-4 sm:h-4 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        )}
                      </div>
                      <span
                        className={`text-sm sm:text-base ${
                          feature.included
                            ? "text-gray-900"
                            : "text-gray-400 line-through"
                        }`}
                      >
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto px-4 mt-12 sm:mt-16">
        <h3 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8">
          Frequently Asked Questions
        </h3>
        <div className="space-y-4">
          <FAQItem
            question="Can I change my plan later?"
            answer="Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate your payment."
          />
          <FAQItem
            question="What payment methods do you accept?"
            answer="We accept all major credit/debit cards, UPI, net banking, and digital wallets through Razorpay."
          />
          <FAQItem
            question="Is there a free trial?"
            answer="Yes! All new users get a 7-day free trial of the Premium plan. No credit card required."
          />
          <FAQItem
            question="Can I cancel anytime?"
            answer="Absolutely! You can cancel your subscription at any time. You'll continue to have access until the end of your billing period."
          />
        </div>
      </div>

      {/* Trust Badges */}
      <div className="max-w-4xl mx-auto px-4 mt-12 sm:mt-16">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
            <div className="text-3xl sm:text-4xl font-bold text-blue-600 mb-1">
              500+
            </div>
            <div className="text-xs sm:text-sm text-gray-600">
              Gyms Trust Us
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
            <div className="text-3xl sm:text-4xl font-bold text-green-600 mb-1">
              50K+
            </div>
            <div className="text-xs sm:text-sm text-gray-600">
              Members Managed
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
            <div className="text-3xl sm:text-4xl font-bold text-purple-600 mb-1">
              99.9%
            </div>
            <div className="text-xs sm:text-sm text-gray-600">Uptime</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
            <div className="text-3xl sm:text-4xl font-bold text-orange-600 mb-1">
              24/7
            </div>
            <div className="text-xs sm:text-sm text-gray-600">Support</div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .safe-top {
          padding-top: env(safe-area-inset-top);
        }
      `}</style>
    </div>
  );
}

function FAQItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between text-left hover:bg-gray-50 transition"
      >
        <span className="font-semibold text-gray-900 text-sm sm:text-base pr-4">
          {question}
        </span>
        <svg
          className={`w-5 h-5 text-gray-500 transform transition-transform flex-shrink-0 ${
            isOpen ? "rotate-180" : ""
          }`}
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
      {isOpen && (
        <div className="px-4 sm:px-6 pb-4 sm:pb-5 text-sm sm:text-base text-gray-600">
          {answer}
        </div>
      )}
    </div>
  );
}
