"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Breadcrumb from "@/components/common/Breadcrumb";
import Link from "next/link";
import * as api from "@/services/api";
import type { School } from "@/types/api";

export default function HomePage() {
  const { user } = useAuth();
  const [schools, setSchools] = useState<School[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const schoolsData = await api.getSchools();
        setSchools(schoolsData);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <>
      <Breadcrumb pageTitle="Dashboard" />

      {/* Welcome Section */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90 mb-2">
          Welcome back, {user?.username || "Admin"}!
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Manage school equipment lists and inventories from this dashboard.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        {/* Schools Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Schools
              </p>
              <h3 className="mt-1 text-3xl font-semibold text-gray-800 dark:text-white/90">
                {isLoading ? "..." : schools.length}
              </h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-500/10">
              <svg
                className="h-6 w-6 text-brand-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
          </div>
          <Link
            href="/schools"
            className="mt-4 inline-flex items-center text-sm font-medium text-brand-500 hover:text-brand-600"
          >
            View all schools
            <svg
              className="ml-1 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>

        {/* Classes Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Quick Actions
              </p>
              <h3 className="mt-1 text-lg font-semibold text-gray-800 dark:text-white/90">
                Manage Equipment
              </h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success-50 dark:bg-success-500/10">
              <svg
                className="h-6 w-6 text-success-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Select a school to view and edit class equipment lists.
          </p>
        </div>

        {/* Info Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Need Help?
              </p>
              <h3 className="mt-1 text-lg font-semibold text-gray-800 dark:text-white/90">
                Documentation
              </h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning-50 dark:bg-warning-500/10">
              <svg
                className="h-6 w-6 text-warning-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            View the example template for component reference.
          </p>
        </div>
      </div>

      {/* Recent Schools */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
          Schools Overview
        </h3>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="inline-block w-6 h-6 border-2 border-gray-300 border-t-brand-500 rounded-full animate-spin"></div>
            <span className="ml-2 text-gray-500">Loading...</span>
          </div>
        ) : schools.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 py-4">
            No schools found. Contact an administrator to add schools.
          </p>
        ) : (
          <div className="grid gap-3">
            {schools.slice(0, 5).map((school) => (
              <Link
                key={school.id}
                href={`/schools/${school.id}/classes`}
                className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-brand-200 hover:bg-gray-50 dark:border-gray-800 dark:hover:border-brand-800 dark:hover:bg-white/[0.02] transition-colors"
              >
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-white/90">
                    {school.name}
                  </h4>
                  {school.address && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {school.address}
                    </p>
                  )}
                </div>
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

