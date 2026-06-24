"use client";

import React from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Style the confirm button as a destructive action. */
  destructive?: boolean;
  isBusy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** A small reusable confirmation modal for destructive or important actions. */
export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  isBusy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} className="max-w-[440px] p-6 lg:p-8" showCloseButton={false}>
      <div className="space-y-5">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">{title}</h4>
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">{message}</div>
        </div>
        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" size="sm" onClick={onCancel} disabled={isBusy}>
            {cancelLabel}
          </Button>
          <Button
            size="sm"
            onClick={onConfirm}
            disabled={isBusy}
            className={destructive ? "bg-error-500 hover:bg-error-600 disabled:bg-error-300" : ""}
          >
            {isBusy ? "Working…" : confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
