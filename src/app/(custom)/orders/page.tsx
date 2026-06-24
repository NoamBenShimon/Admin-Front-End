"use client";

import React, { useCallback, useEffect, useState } from "react";
import Breadcrumb from "@/components/common/Breadcrumb";
import { Modal } from "@/components/ui/modal";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import * as api from "@/services/api";
import type { Order, OrderFilters, School } from "@/types/api";
import { formatCurrency, formatDateTime } from "@/lib/format";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const selectClasses =
  "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [schoolId, setSchoolId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [selected, setSelected] = useState<Order | null>(null);

  const loadOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const filters: OrderFilters = {};
      if (schoolId) filters.schoolId = schoolId;
      if (from) filters.from = from;
      if (to) filters.to = `${to}T23:59:59Z`;
      setOrders(await api.getOrders(filters));
    } catch (err) {
      console.error("Failed to load orders:", err);
      setError("Could not load orders. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [schoolId, from, to]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Schools list for the filter dropdown (loaded once).
  useEffect(() => {
    api.getSchools().then(setSchools).catch(() => setSchools([]));
  }, []);

  const clearFilters = () => {
    setSchoolId("");
    setFrom("");
    setTo("");
  };

  const hasFilters = Boolean(schoolId || from || to);

  return (
    <>
      <Breadcrumb pageTitle="Orders" />

      {/* Filters */}
      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:items-end">
          <div>
            <Label>School</Label>
            <select value={schoolId} onChange={(e) => setSchoolId(e.target.value)} className={selectClasses}>
              <option value="">All schools</option>
              {schools.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>From</Label>
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div>
            <Label>To</Label>
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <div>
            <Button variant="outline" size="sm" onClick={clearFilters} disabled={!hasFilters}>
              Clear filters
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="border-b border-gray-200 px-6 py-5 dark:border-gray-800">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Order history</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Completed purchases. Click a row to see the items and prices paid.
          </p>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-600 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-400">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-brand-500" />
              <span className="ml-3 text-gray-500">Loading orders…</span>
            </div>
          ) : orders.length === 0 ? (
            <div className="py-12 text-center">
              <h3 className="text-lg font-medium text-gray-800 dark:text-white/90">No orders found</h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {hasFilters ? "Try widening your filters." : "Orders will appear here once parents start buying."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-gray-800">
                  <TableRow>
                    <TableCell isHeader className="px-5 py-3 text-start text-sm font-medium text-gray-500 dark:text-gray-400">Order</TableCell>
                    <TableCell isHeader className="px-5 py-3 text-start text-sm font-medium text-gray-500 dark:text-gray-400">Date</TableCell>
                    <TableCell isHeader className="px-5 py-3 text-start text-sm font-medium text-gray-500 dark:text-gray-400">Parent</TableCell>
                    <TableCell isHeader className="px-5 py-3 text-start text-sm font-medium text-gray-500 dark:text-gray-400">School / Grade</TableCell>
                    <TableCell isHeader className="px-5 py-3 text-end text-sm font-medium text-gray-500 dark:text-gray-400">Total</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {orders.map((order) => (
                    <TableRow
                      key={order.id}
                      className="cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                      onClick={() => setSelected(order)}
                    >
                      <TableCell className="px-5 py-4 text-start font-medium text-gray-800 dark:text-white/90">#{order.id}</TableCell>
                      <TableCell className="px-5 py-4 text-start text-sm text-gray-500 dark:text-gray-400">{formatDateTime(order.purchaseDate)}</TableCell>
                      <TableCell className="px-5 py-4 text-start text-sm text-gray-700 dark:text-gray-300">{order.username ?? `User ${order.userId}`}</TableCell>
                      <TableCell className="px-5 py-4 text-start text-sm text-gray-500 dark:text-gray-400">
                        {order.schoolName ?? "—"}
                        {order.gradeName ? ` · ${order.gradeName}` : ""}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-end text-sm font-semibold text-gray-800 dark:text-white/90">{formatCurrency(order.totalAmount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>

      {/* Order detail */}
      <Modal isOpen={Boolean(selected)} onClose={() => setSelected(null)} className="max-w-[560px] p-6 lg:p-8">
        {selected && (
          <div className="space-y-5">
            <div>
              <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">Order #{selected.id}</h4>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {formatDateTime(selected.purchaseDate)} · {selected.username ?? `User ${selected.userId}`}
                {selected.schoolName ? ` · ${selected.schoolName}` : ""}
                {selected.gradeName ? ` · ${selected.gradeName}` : ""}
              </p>
            </div>
            <div className="overflow-hidden rounded-xl border border-gray-100 dark:border-gray-800">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-gray-800">
                  <TableRow>
                    <TableCell isHeader className="px-4 py-2 text-start text-xs font-medium text-gray-500 dark:text-gray-400">Item</TableCell>
                    <TableCell isHeader className="px-4 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400">Qty</TableCell>
                    <TableCell isHeader className="px-4 py-2 text-end text-xs font-medium text-gray-500 dark:text-gray-400">Price paid</TableCell>
                    <TableCell isHeader className="px-4 py-2 text-end text-xs font-medium text-gray-500 dark:text-gray-400">Line</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {selected.items.map((item) => (
                    <TableRow key={item.equipmentId}>
                      <TableCell className="px-4 py-2 text-start text-sm text-gray-800 dark:text-white/90">{item.equipmentName}</TableCell>
                      <TableCell className="px-4 py-2 text-center text-sm text-gray-500 dark:text-gray-400">{item.quantity}</TableCell>
                      <TableCell className="px-4 py-2 text-end text-sm text-gray-500 dark:text-gray-400">{formatCurrency(item.priceAtPurchase)}</TableCell>
                      <TableCell className="px-4 py-2 text-end text-sm font-medium text-gray-800 dark:text-white/90">{formatCurrency(item.priceAtPurchase * item.quantity)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-800">
              <span className="text-sm text-gray-500 dark:text-gray-400">Order total</span>
              <span className="text-lg font-semibold text-gray-800 dark:text-white/90">{formatCurrency(selected.totalAmount)}</span>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
