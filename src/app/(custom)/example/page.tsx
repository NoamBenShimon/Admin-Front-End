import type { Metadata } from "next";
import { EcommerceMetrics } from "@/components/ecommerce/EcommerceMetrics";
import React from "react";
import MonthlyTarget from "@/components/ecommerce/MonthlyTarget";
import MonthlySalesChart from "@/components/ecommerce/MonthlySalesChart";
import StatisticsChart from "@/components/ecommerce/StatisticsChart";
import RecentOrders from "@/components/ecommerce/RecentOrders";
import DemographicCard from "@/components/ecommerce/DemographicCard";
import Breadcrumb from "@/components/common/Breadcrumb";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Example Dashboard | TailAdmin Template",
  description: "Example TailAdmin Dashboard for reference",
};

export default function ExampleDashboard() {
  return (
    <>
      <Breadcrumb pageTitle="Example Dashboard" />

      {/* Notice Banner */}
      <div className="mb-6 rounded-xl border border-warning-200 bg-warning-50 p-4 dark:border-warning-800 dark:bg-warning-500/10">
        <div className="flex items-start gap-3">
          <svg
            className="h-5 w-5 text-warning-500 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <h4 className="font-medium text-warning-800 dark:text-warning-200">
              Example Template
            </h4>
            <p className="mt-1 text-sm text-warning-700 dark:text-warning-300">
              This is the original TailAdmin template preserved for reference.
              Components and patterns here can be reused in the main application.
            </p>
            <Link
              href="/"
              className="mt-2 inline-flex items-center text-sm font-medium text-warning-700 hover:text-warning-800 dark:text-warning-300"
            >
              ← Return to main dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 space-y-6 xl:col-span-7">
          <EcommerceMetrics />
          <MonthlySalesChart />
        </div>

        <div className="col-span-12 xl:col-span-5">
          <MonthlyTarget />
        </div>

        <div className="col-span-12">
          <StatisticsChart />
        </div>

        <div className="col-span-12 xl:col-span-5">
          <DemographicCard />
        </div>

        <div className="col-span-12 xl:col-span-7">
          <RecentOrders />
        </div>
      </div>
    </>
  );
}

