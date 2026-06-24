"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import Breadcrumb from "@/components/common/Breadcrumb";
import Button from "@/components/ui/button/Button";

// Inlined at build time; reflects whether the app is talking to the live backend.
const USING_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS !== "false";

export default function ProfilePage() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <>
      <Breadcrumb pageTitle="Profile" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Profile Info */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-500/10">
              <svg
                className="h-8 w-8 text-brand-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
                {user?.username || "Admin User"}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {user?.role || "admin"}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between py-3 border-b border-gray-100 dark:border-gray-800">
              <span className="text-gray-500 dark:text-gray-400">User ID</span>
              <span className="font-medium text-gray-800 dark:text-white/90">
                {user?.userid || "—"}
              </span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-100 dark:border-gray-800">
              <span className="text-gray-500 dark:text-gray-400">Username</span>
              <span className="font-medium text-gray-800 dark:text-white/90">
                {user?.username || "—"}
              </span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-100 dark:border-gray-800">
              <span className="text-gray-500 dark:text-gray-400">Role</span>
              <span className="font-medium text-gray-800 dark:text-white/90 capitalize">
                {user?.role || "—"}
              </span>
            </div>
          </div>

          <div className="mt-6">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleLogout}
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Sign Out
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
            Quick Info
          </h3>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                System Status
              </p>
              <p className="mt-1 font-medium text-success-500">Online</p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Data source
              </p>
              <p className={`mt-1 font-medium ${USING_MOCKS ? "text-warning-500" : "text-success-500"}`}>
                {USING_MOCKS ? "Using mock data" : "Live backend"}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                {USING_MOCKS
                  ? "Set NEXT_PUBLIC_USE_MOCKS=false to use the live backend."
                  : "Connected to the backend API."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

