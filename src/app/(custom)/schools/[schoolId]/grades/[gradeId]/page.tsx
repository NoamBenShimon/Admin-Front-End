"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Breadcrumb, { BreadcrumbItem } from "@/components/common/Breadcrumb";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import * as api from "@/services/api";
import type { Equipment, Grade, RequirementItem, School } from "@/types/api";
import { formatCurrency } from "@/lib/format";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function sameList(a: RequirementItem[], b: RequirementItem[]): boolean {
  if (a.length !== b.length) return false;
  const key = (items: RequirementItem[]) =>
    items
      .map((i) => `${i.equipmentId}:${i.quantity}`)
      .sort()
      .join("|");
  return key(a) === key(b);
}

export default function GradeRequirementsPage() {
  const params = useParams();
  const schoolId = params.schoolId as string;
  const gradeId = params.gradeId as string;

  const [school, setSchool] = useState<School | null>(null);
  const [grade, setGrade] = useState<Grade | null>(null);
  const [catalog, setCatalog] = useState<Equipment[]>([]);
  const [items, setItems] = useState<RequirementItem[]>([]);
  const [original, setOriginal] = useState<RequirementItem[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  // "Add item" controls.
  const [addEquipmentId, setAddEquipmentId] = useState("");
  const [addQuantity, setAddQuantity] = useState(1);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [schoolData, gradeData, catalogData, requirements] = await Promise.all([
        api.getSchoolById(schoolId),
        api.getGradeById(gradeId),
        api.getEquipment(),
        api.getGradeRequirements(gradeId),
      ]);
      setSchool(schoolData);
      setGrade(gradeData);
      setCatalog(catalogData);
      setItems(requirements.items);
      setOriginal(requirements.items);
    } catch (err) {
      console.error("Failed to load equipment list:", err);
      setError("Could not load the equipment list. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [schoolId, gradeId]);

  useEffect(() => {
    load();
  }, [load]);

  const availableCatalog = useMemo(
    () => catalog.filter((e) => !items.some((i) => i.equipmentId === e.id)),
    [catalog, items],
  );

  const total = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [items],
  );

  const isDirty = useMemo(() => !sameList(items, original), [items, original]);

  const handleAdd = () => {
    const equipment = catalog.find((e) => e.id === addEquipmentId);
    if (!equipment) return;
    const quantity = Math.max(1, Math.floor(addQuantity) || 1);
    setItems((prev) => [
      ...prev,
      { equipmentId: equipment.id, name: equipment.name, price: equipment.price, quantity },
    ]);
    setAddEquipmentId("");
    setAddQuantity(1);
  };

  const handleQuantityChange = (equipmentId: string, value: number) => {
    setItems((prev) =>
      prev.map((i) =>
        i.equipmentId === equipmentId ? { ...i, quantity: Math.max(1, Math.floor(value) || 1) } : i,
      ),
    );
  };

  const handleRemove = (equipmentId: string) => {
    setItems((prev) => prev.filter((i) => i.equipmentId !== equipmentId));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      const result = await api.updateGradeRequirements(gradeId, {
        items: items.map((i) => ({ equipmentId: i.equipmentId, quantity: i.quantity })),
      });
      setItems(result.items);
      setOriginal(result.items);
      setSavedAt(Date.now());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the equipment list.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setItems(original);
    setError(null);
  };

  const breadcrumbItems: BreadcrumbItem[] = [{ label: "Schools", href: "/schools" }];
  if (school) breadcrumbItems.push({ label: school.name, href: `/schools/${schoolId}/grades` });
  if (grade) breadcrumbItems.push({ label: grade.name });

  return (
    <>
      <Breadcrumb pageTitle={grade ? `${grade.name} — Equipment list` : "Equipment list"} items={breadcrumbItems} />

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-6 py-5 dark:border-gray-800">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Required equipment</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              This is the list parents see when ordering for {grade?.name ?? "this grade"}.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isDirty && (
              <Button variant="outline" size="sm" onClick={handleReset} disabled={isSaving}>
                Discard
              </Button>
            )}
            <Button size="sm" onClick={handleSave} disabled={!isDirty || isSaving}>
              {isSaving ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-600 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-400">
              {error}
            </div>
          )}
          {savedAt && !isDirty && !error && (
            <div className="mb-4 rounded-lg border border-success-200 bg-success-50 px-4 py-3 text-sm text-success-600 dark:border-success-500/30 dark:bg-success-500/10 dark:text-success-400">
              Equipment list saved.
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-brand-500" />
              <span className="ml-3 text-gray-500">Loading equipment list…</span>
            </div>
          ) : (
            <>
              {/* Add-item row */}
              <div className="mb-6 grid grid-cols-1 gap-4 rounded-xl border border-dashed border-gray-300 p-4 dark:border-gray-700 sm:grid-cols-[1fr_auto_auto] sm:items-end">
                <div>
                  <Label>Add equipment</Label>
                  <select
                    value={addEquipmentId}
                    onChange={(e) => setAddEquipmentId(e.target.value)}
                    disabled={availableCatalog.length === 0}
                    className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  >
                    <option value="">
                      {availableCatalog.length === 0 ? "All catalog items added" : "Select an item…"}
                    </option>
                    {availableCatalog.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.name} — {formatCurrency(e.price)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-full sm:w-28">
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    min="1"
                    value={addQuantity}
                    onChange={(e) => setAddQuantity(parseInt(e.target.value, 10) || 1)}
                  />
                </div>
                <Button size="sm" onClick={handleAdd} disabled={!addEquipmentId}>
                  Add item
                </Button>
              </div>

              {items.length === 0 ? (
                <div className="py-10 text-center">
                  <h3 className="text-sm font-medium text-gray-800 dark:text-white/90">No equipment yet</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Add catalog items above to build this grade&apos;s list.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="border-b border-gray-100 dark:border-gray-800">
                      <TableRow>
                        <TableCell isHeader className="px-5 py-3 text-start text-sm font-medium text-gray-500 dark:text-gray-400">
                          Item
                        </TableCell>
                        <TableCell isHeader className="px-5 py-3 text-end text-sm font-medium text-gray-500 dark:text-gray-400">
                          Unit price
                        </TableCell>
                        <TableCell isHeader className="px-5 py-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                          Quantity
                        </TableCell>
                        <TableCell isHeader className="px-5 py-3 text-end text-sm font-medium text-gray-500 dark:text-gray-400">
                          Line total
                        </TableCell>
                        <TableCell isHeader className="px-5 py-3 text-end text-sm font-medium text-gray-500 dark:text-gray-400">
                          {""}
                        </TableCell>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {items.map((item) => (
                        <TableRow key={item.equipmentId}>
                          <TableCell className="px-5 py-4 text-start font-medium text-gray-800 dark:text-white/90">
                            {item.name}
                          </TableCell>
                          <TableCell className="px-5 py-4 text-end text-sm text-gray-500 dark:text-gray-400">
                            {formatCurrency(item.price)}
                          </TableCell>
                          <TableCell className="px-5 py-4 text-center">
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) =>
                                handleQuantityChange(item.equipmentId, parseInt(e.target.value, 10))
                              }
                              className="h-9 w-20 rounded-lg border border-gray-300 bg-transparent px-3 text-center text-sm text-gray-800 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                            />
                          </TableCell>
                          <TableCell className="px-5 py-4 text-end text-sm font-medium text-gray-800 dark:text-white/90">
                            {formatCurrency(item.price * item.quantity)}
                          </TableCell>
                          <TableCell className="px-5 py-4 text-end">
                            <button
                              type="button"
                              onClick={() => handleRemove(item.equipmentId)}
                              className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-error-500 dark:hover:bg-gray-800"
                              title="Remove"
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  <div className="mt-4 flex items-center justify-end gap-6 border-t border-gray-100 px-5 pt-4 dark:border-gray-800">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {items.length} item{items.length === 1 ? "" : "s"}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Full-list cost:{" "}
                      <span className="text-base font-semibold text-gray-800 dark:text-white/90">
                        {formatCurrency(total)}
                      </span>
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
