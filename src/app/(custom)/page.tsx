"use client";

import React, { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";
import { useAuth } from "@/context/AuthContext";
import Breadcrumb from "@/components/common/Breadcrumb";
import * as api from "@/services/api";
import type { AnalyticsSummary } from "@/types/api";
import { formatCurrency } from "@/lib/format";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

function monthLabel(yyyymm: string): string {
  const date = new Date(`${yyyymm}-01T00:00:00`);
  return Number.isNaN(date.getTime())
    ? yyyymm
    : date.toLocaleString("en", { month: "short", year: "2-digit" });
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getAnalyticsSummary()
      .then(setSummary)
      .catch((err) => {
        console.error("Failed to load analytics:", err);
        setError("Could not load dashboard analytics.");
      })
      .finally(() => setIsLoading(false));
  }, []);

  const revenueChart = useMemo<{ options: ApexOptions; series: ApexAxisChartSeries }>(() => {
    const months = summary?.revenueByMonth ?? [];
    return {
      options: {
        colors: ["#465fff"],
        chart: { fontFamily: "Outfit, sans-serif", type: "area", height: 280, toolbar: { show: false } },
        stroke: { curve: "smooth", width: 2 },
        fill: { type: "gradient", gradient: { opacityFrom: 0.4, opacityTo: 0 } },
        dataLabels: { enabled: false },
        xaxis: { categories: months.map((m) => monthLabel(m.month)), axisBorder: { show: false }, axisTicks: { show: false } },
        yaxis: { labels: { formatter: (v) => formatCurrency(v) } },
        tooltip: { y: { formatter: (v) => formatCurrency(v) } },
        grid: { borderColor: "#e5e7eb", strokeDashArray: 4 },
      },
      series: [{ name: "Revenue", data: months.map((m) => Number(m.revenue.toFixed(2))) }],
    };
  }, [summary]);

  const topEquipmentChart = useMemo<{ options: ApexOptions; series: ApexAxisChartSeries }>(() => {
    const items = summary?.topEquipment ?? [];
    return {
      options: {
        colors: ["#12b76a"],
        chart: { fontFamily: "Outfit, sans-serif", type: "bar", height: 280, toolbar: { show: false } },
        plotOptions: { bar: { horizontal: true, borderRadius: 4, columnWidth: "45%" } },
        dataLabels: { enabled: false },
        xaxis: { categories: items.map((i) => i.name) },
        tooltip: { y: { formatter: (v) => formatCurrency(v) } },
        grid: { borderColor: "#e5e7eb", strokeDashArray: 4 },
      },
      series: [{ name: "Revenue", data: items.map((i) => Number(i.revenue.toFixed(2))) }],
    };
  }, [summary]);

  const schoolChart = useMemo<{ options: ApexOptions; series: number[] }>(() => {
    const schools = summary?.spendBySchool ?? [];
    return {
      options: {
        colors: ["#465fff", "#12b76a", "#f79009", "#f04438", "#7a5af8", "#06aed4"],
        chart: { fontFamily: "Outfit, sans-serif", type: "donut" },
        labels: schools.map((s) => s.schoolName),
        legend: { position: "bottom" },
        dataLabels: { enabled: false },
        tooltip: { y: { formatter: (v) => formatCurrency(v) } },
      },
      series: schools.map((s) => Number(s.revenue.toFixed(2))),
    };
  }, [summary]);

  return (
    <>
      <Breadcrumb pageTitle="Dashboard" />

      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <h1 className="mb-1 text-2xl font-semibold text-gray-800 dark:text-white/90">
          Welcome back, {user?.username || "Admin"}!
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          A snapshot of equipment ordering across Kiryat Motzkin.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-600 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-400">
          {error}
        </div>
      )}

      {/* Stat cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total revenue" value={summary ? formatCurrency(summary.totalRevenue) : "…"} loading={isLoading} />
        <StatCard label="Orders" value={summary ? String(summary.totalOrders) : "…"} loading={isLoading} />
        <StatCard label="Active carts" value={summary ? String(summary.activeCarts) : "…"} loading={isLoading} />
        <StatCard label="Catalog items" value={summary ? String(summary.catalogSize) : "…"} loading={isLoading} />
      </div>

      {/* Revenue over time */}
      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">Revenue over time</h3>
        {summary && summary.revenueByMonth.length > 0 ? (
          <ReactApexChart options={revenueChart.options} series={revenueChart.series} type="area" height={280} />
        ) : (
          <EmptyChart loading={isLoading} />
        )}
      </div>

      {/* Top equipment + spend by school */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">Top equipment by revenue</h3>
          {summary && summary.topEquipment.length > 0 ? (
            <ReactApexChart options={topEquipmentChart.options} series={topEquipmentChart.series} type="bar" height={280} />
          ) : (
            <EmptyChart loading={isLoading} />
          )}
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">Spend by school</h3>
          {summary && summary.spendBySchool.length > 0 ? (
            <ReactApexChart options={schoolChart.options} series={schoolChart.series} type="donut" height={280} />
          ) : (
            <EmptyChart loading={isLoading} />
          )}
        </div>
      </div>
    </>
  );
}

function StatCard({ label, value, loading }: { label: string; value: string; loading: boolean }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
      <h3 className="mt-2 text-2xl font-semibold text-gray-800 dark:text-white/90">{loading ? "…" : value}</h3>
    </div>
  );
}

function EmptyChart({ loading }: { loading: boolean }) {
  return (
    <div className="flex h-[280px] items-center justify-center text-sm text-gray-400">
      {loading ? "Loading…" : "No data to display yet."}
    </div>
  );
}
