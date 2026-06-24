"use client";

import React, { useCallback, useEffect, useState } from "react";
import Breadcrumb from "@/components/common/Breadcrumb";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import * as api from "@/services/api";
import type { Equipment } from "@/types/api";
import { formatCurrency } from "@/lib/format";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function EquipmentCatalogPage() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<Equipment | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [nameHeInput, setNameHeInput] = useState("");
  const [priceInput, setPriceInput] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Equipment | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      setEquipment(await api.getEquipment());
    } catch (err) {
      console.error("Failed to load equipment:", err);
      setError("Could not load the equipment catalog. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setNameInput("");
    setNameHeInput("");
    setPriceInput("");
    setFormError(null);
    setIsFormOpen(true);
  };

  const openEdit = (item: Equipment) => {
    setEditing(item);
    setNameInput(item.name);
    setNameHeInput(item.nameHe ?? "");
    setPriceInput(String(item.price));
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleSave = async () => {
    const name = nameInput.trim();
    const nameHe = nameHeInput.trim();
    const price = Number(priceInput);
    if (!name) {
      setFormError("Item name is required.");
      return;
    }
    if (!Number.isFinite(price) || price < 0) {
      setFormError("Enter a valid price (zero or more).");
      return;
    }
    try {
      setIsSaving(true);
      setFormError(null);
      if (editing) {
        await api.updateEquipment(editing.id, { name, nameHe, price });
      } else {
        await api.createEquipment({ name, nameHe, price });
      }
      setIsFormOpen(false);
      await load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Could not save the item.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await api.deleteEquipment(deleteTarget.id);
      setDeleteTarget(null);
      await load();
    } catch (err) {
      console.error("Failed to delete equipment:", err);
      setError(err instanceof Error ? err.message : "Could not delete the item.");
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Breadcrumb pageTitle="Equipment Catalog" />

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-6 py-5 dark:border-gray-800">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Equipment Catalog</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              The master list of items (and prices) that grades draw from. Prices are in shekels (₪).
            </p>
          </div>
          <Button size="sm" onClick={openCreate}>
            Add Item
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
              <span className="ml-3 text-gray-500">Loading catalog…</span>
            </div>
          ) : equipment.length === 0 ? (
            <div className="py-12 text-center">
              <h3 className="text-lg font-medium text-gray-800 dark:text-white/90">No equipment yet</h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Add your first catalog item.</p>
              <div className="mt-4">
                <Button size="sm" onClick={openCreate}>
                  Add Item
                </Button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-gray-800">
                  <TableRow>
                    <TableCell isHeader className="px-5 py-3 text-start text-sm font-medium text-gray-500 dark:text-gray-400">
                      Item
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 text-start text-sm font-medium text-gray-500 dark:text-gray-400">
                      Hebrew Name
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 text-end text-sm font-medium text-gray-500 dark:text-gray-400">
                      Price
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 text-end text-sm font-medium text-gray-500 dark:text-gray-400">
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {equipment.map((item) => (
                    <TableRow key={item.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                      <TableCell className="px-5 py-4 text-start font-medium text-gray-800 dark:text-white/90">
                        {item.name}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start font-medium text-gray-800 dark:text-white/90">
                        {item.nameHe ? (
                          <span dir="rtl">{item.nameHe}</span>
                        ) : (
                          <span className="text-sm text-gray-400 dark:text-gray-500">—</span>
                        )}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-end text-sm text-gray-600 dark:text-gray-300">
                        {formatCurrency(item.price)}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-end">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEdit(item)}
                            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-brand-500 dark:hover:bg-gray-800"
                            title="Edit"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(item)}
                            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-error-500 dark:hover:bg-gray-800"
                            title="Delete"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
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

      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} className="max-w-[480px] p-6 lg:p-8">
        <div className="space-y-6">
          <div>
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              {editing ? "Edit item" : "Add item"}
            </h4>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {editing ? "Update the catalog item." : "Add a new item to the catalog."}
            </p>
          </div>
          <div className="space-y-4">
            <div>
              <Label>Item name</Label>
              <Input
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="e.g. Notebook"
              />
            </div>
            <div>
              <Label>Hebrew name (עברית)</Label>
              <Input
                value={nameHeInput}
                onChange={(e) => setNameHeInput(e.target.value)}
                placeholder="לדוגמה: מחברת"
                dir="rtl"
              />
              <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                Optional. Shown to parents browsing in Hebrew; falls back to the item name if blank.
              </p>
            </div>
            <div>
              <Label>Price (₪)</Label>
              <Input
                type="number"
                min="0"
                step={0.5}
                value={priceInput}
                onChange={(e) => setPriceInput(e.target.value)}
                placeholder="0.00"
                error={Boolean(formError)}
                hint={formError ?? undefined}
              />
            </div>
          </div>
          <div className="flex items-center justify-end gap-3">
            <Button variant="outline" size="sm" onClick={() => setIsFormOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving…" : editing ? "Save changes" : "Create item"}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete item"
        message={
          <>
            Delete <span className="font-medium text-gray-700 dark:text-gray-300">{deleteTarget?.name}</span> from the
            catalog? It will be removed from every grade&apos;s equipment list. This cannot be undone.
          </>
        }
        confirmLabel="Delete item"
        destructive
        isBusy={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
