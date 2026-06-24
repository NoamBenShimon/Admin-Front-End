"use client";

import React, { useCallback, useEffect, useState } from "react";
import Breadcrumb from "@/components/common/Breadcrumb";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import * as api from "@/services/api";
import type { BalanceResponse, StripePayment } from "@/types/api";
import { formatCurrency, formatDateTime, formatMoney } from "@/lib/format";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

/** Colour a Stripe charge status like a badge. */
function statusClasses(status: string): string {
  switch (status) {
    case "succeeded":
      return "bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-400";
    case "pending":
      return "bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-warning-400";
    case "refunded":
      return "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300";
    default:
      return "bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-400";
  }
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<StripePayment[]>([]);
  const [balance, setBalance] = useState<BalanceResponse | null>(null);
  const [configured, setConfigured] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [refundTarget, setRefundTarget] = useState<StripePayment | null>(null);
  const [isRefunding, setIsRefunding] = useState(false);
  const [refundError, setRefundError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [paymentsRes, balanceRes] = await Promise.all([
        api.getPayments(),
        api.getStripeBalance(),
      ]);
      setConfigured(paymentsRes.configured);
      setPayments(paymentsRes.payments);
      setBalance(balanceRes);
    } catch (err) {
      console.error("Failed to load payments:", err);
      setError("Could not load payments from Stripe. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const confirmRefund = async () => {
    if (!refundTarget) return;
    try {
      setIsRefunding(true);
      setRefundError(null);
      await api.refundPayment(refundTarget.id);
      // Reflect the refund locally without a full reload.
      setPayments((prev) =>
        prev.map((p) =>
          p.id === refundTarget.id
            ? { ...p, refunded: true, amountRefunded: p.amount, status: "refunded" }
            : p,
        ),
      );
      setRefundTarget(null);
      load(); // refresh balance
    } catch (err) {
      console.error("Refund failed:", err);
      setRefundError(err instanceof Error ? err.message : "Refund failed. Please try again.");
    } finally {
      setIsRefunding(false);
    }
  };

  return (
    <>
      <Breadcrumb pageTitle="Payments" />

      {/* Stripe not configured */}
      {!isLoading && !configured && (
        <div className="mb-6 rounded-2xl border border-warning-200 bg-warning-50 px-5 py-4 text-sm text-warning-700 dark:border-warning-500/30 dark:bg-warning-500/10 dark:text-warning-400">
          <p className="font-medium">Stripe is not connected yet.</p>
          <p className="mt-1">
            Add <code className="rounded bg-black/5 px-1 dark:bg-white/10">STRIPE_SECRET_KEY</code> (and a webhook
            secret) to the backend to see live payments, balance and refunds here.
          </p>
        </div>
      )}

      {/* Balance cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <BalanceCard
          label="Available balance"
          items={balance?.available}
          loading={isLoading}
          configured={configured}
        />
        <BalanceCard
          label="Pending balance"
          items={balance?.pending}
          loading={isLoading}
          configured={configured}
        />
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5 dark:border-gray-800">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Recent payments</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Live charges from Stripe. Refund a payment or open it in the Stripe Dashboard.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={load} disabled={isLoading}>
            Refresh
          </Button>
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
              <span className="ml-3 text-gray-500">Loading payments…</span>
            </div>
          ) : payments.length === 0 ? (
            <div className="py-12 text-center">
              <h3 className="text-lg font-medium text-gray-800 dark:text-white/90">No payments yet</h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {configured
                  ? "Payments will appear here once parents check out."
                  : "Connect Stripe to start seeing payments."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-gray-800">
                  <TableRow>
                    <TableCell isHeader className="px-5 py-3 text-start text-sm font-medium text-gray-500 dark:text-gray-400">Date</TableCell>
                    <TableCell isHeader className="px-5 py-3 text-start text-sm font-medium text-gray-500 dark:text-gray-400">Customer</TableCell>
                    <TableCell isHeader className="px-5 py-3 text-start text-sm font-medium text-gray-500 dark:text-gray-400">Description</TableCell>
                    <TableCell isHeader className="px-5 py-3 text-start text-sm font-medium text-gray-500 dark:text-gray-400">Status</TableCell>
                    <TableCell isHeader className="px-5 py-3 text-end text-sm font-medium text-gray-500 dark:text-gray-400">Amount</TableCell>
                    <TableCell isHeader className="px-5 py-3 text-end text-sm font-medium text-gray-500 dark:text-gray-400">Actions</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {payments.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="px-5 py-4 text-start text-sm text-gray-500 dark:text-gray-400">{formatDateTime(p.created)}</TableCell>
                      <TableCell className="px-5 py-4 text-start text-sm text-gray-700 dark:text-gray-300">{p.email || "—"}</TableCell>
                      <TableCell className="px-5 py-4 text-start text-sm text-gray-500 dark:text-gray-400">{p.description || "—"}</TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusClasses(p.status)}`}>
                          {p.status}
                        </span>
                        {p.amountRefunded > 0 && !p.refunded && (
                          <span className="ml-2 text-xs text-gray-400">
                            ({formatCurrency(p.amountRefunded)} refunded)
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-end text-sm font-semibold text-gray-800 dark:text-white/90">{formatCurrency(p.amount)}</TableCell>
                      <TableCell className="px-5 py-4 text-end">
                        <div className="flex items-center justify-end gap-3">
                          {p.dashboardUrl && (
                            <a
                              href={p.dashboardUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-medium text-brand-500 hover:text-brand-600"
                            >
                              View in Stripe
                            </a>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={p.refunded || p.status !== "succeeded"}
                            onClick={() => {
                              setRefundError(null);
                              setRefundTarget(p);
                            }}
                          >
                            {p.refunded ? "Refunded" : "Refund"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>

      {/* Refund confirmation */}
      <Modal isOpen={Boolean(refundTarget)} onClose={() => !isRefunding && setRefundTarget(null)} className="max-w-[480px] p-6 lg:p-8">
        {refundTarget && (
          <div className="space-y-5">
            <div>
              <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">Refund payment</h4>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                This will refund {formatCurrency(refundTarget.amount)} to {refundTarget.email || "the customer"} via
                Stripe. This cannot be undone.
              </p>
            </div>
            {refundError && (
              <div className="rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-600 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-400">
                {refundError}
              </div>
            )}
            <div className="flex items-center justify-end gap-3">
              <Button variant="outline" size="sm" onClick={() => setRefundTarget(null)} disabled={isRefunding}>
                Cancel
              </Button>
              <Button size="sm" onClick={confirmRefund} disabled={isRefunding}>
                {isRefunding ? "Refunding…" : "Confirm refund"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

function BalanceCard({
  label,
  items,
  loading,
  configured,
}: {
  label: string;
  items?: { amount: number; currency: string }[];
  loading: boolean;
  configured: boolean;
}) {
  // Stripe returns one entry per currency; render each in its own currency
  // rather than summing across currencies.
  const lines = items ?? [];
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
      <div className="mt-2 flex flex-wrap items-baseline gap-x-4 gap-y-1">
        {loading ? (
          <h3 className="text-2xl font-semibold text-gray-800 dark:text-white/90">…</h3>
        ) : !configured ? (
          <h3 className="text-2xl font-semibold text-gray-800 dark:text-white/90">—</h3>
        ) : lines.length === 0 ? (
          <h3 className="text-2xl font-semibold text-gray-800 dark:text-white/90">{formatMoney(0, "ils")}</h3>
        ) : (
          lines.map((i) => (
            <h3 key={i.currency} className="text-2xl font-semibold text-gray-800 dark:text-white/90">
              {formatMoney(i.amount, i.currency)}
            </h3>
          ))
        )}
      </div>
    </div>
  );
}
