"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Breadcrumb, { BreadcrumbItem } from "@/components/common/Breadcrumb";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import * as api from "@/services/api";
import type { Grade, School } from "@/types/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function GradesPage() {
  const params = useParams();
  const schoolId = params.schoolId as string;

  const [school, setSchool] = useState<School | null>(null);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<Grade | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [nameHeInput, setNameHeInput] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Grade | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadGrades = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [schoolData, gradesData] = await Promise.all([
        api.getSchoolById(schoolId),
        api.getGradesBySchool(schoolId),
      ]);
      setSchool(schoolData);
      setGrades(gradesData);
    } catch (err) {
      console.error("Failed to load grades:", err);
      setError("Could not load grades. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [schoolId]);

  useEffect(() => {
    loadGrades();
  }, [loadGrades]);

  const openCreate = () => {
    setEditing(null);
    setNameInput("");
    setNameHeInput("");
    setFormError(null);
    setIsFormOpen(true);
  };

  const openEdit = (grade: Grade) => {
    setEditing(grade);
    setNameInput(grade.name);
    setNameHeInput(grade.nameHe ?? "");
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleSave = async () => {
    const name = nameInput.trim();
    const nameHe = nameHeInput.trim();
    if (!name) {
      setFormError("Grade name is required.");
      return;
    }
    try {
      setIsSaving(true);
      setFormError(null);
      if (editing) {
        await api.updateGrade(editing.id, name, nameHe);
      } else {
        await api.createGrade({ schoolId, name, nameHe });
      }
      setIsFormOpen(false);
      await loadGrades();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Could not save the grade.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await api.deleteGrade(deleteTarget.id);
      setDeleteTarget(null);
      await loadGrades();
    } catch (err) {
      console.error("Failed to delete grade:", err);
      setError(err instanceof Error ? err.message : "Could not delete the grade.");
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const breadcrumbItems: BreadcrumbItem[] = [{ label: "Schools", href: "/schools" }];
  if (school) breadcrumbItems.push({ label: school.name });

  return (
    <>
      <Breadcrumb pageTitle={school ? `${school.name} — Grades` : "Grades"} items={breadcrumbItems} />

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-6 py-5 dark:border-gray-800">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Grades</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Open a grade to manage the equipment list parents see for it.
            </p>
          </div>
          <Button size="sm" onClick={openCreate}>
            Add Grade
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
              <span className="ml-3 text-gray-500">Loading grades…</span>
            </div>
          ) : grades.length === 0 ? (
            <div className="py-12 text-center">
              <h3 className="text-lg font-medium text-gray-800 dark:text-white/90">No grades yet</h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Add a grade to this school to start building its equipment list.</p>
              <div className="mt-4">
                <Button size="sm" onClick={openCreate}>
                  Add Grade
                </Button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-gray-800">
                  <TableRow>
                    <TableCell isHeader className="px-5 py-3 text-start text-sm font-medium text-gray-500 dark:text-gray-400">
                      Grade
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 text-start text-sm font-medium text-gray-500 dark:text-gray-400">
                      Hebrew Name
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 text-end text-sm font-medium text-gray-500 dark:text-gray-400">
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {grades.map((grade) => (
                    <TableRow key={grade.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                      <TableCell className="px-5 py-4 text-start">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success-50 dark:bg-success-500/10">
                            <svg className="h-5 w-5 text-success-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422A12.083 12.083 0 0118 18.16 11.955 11.955 0 0112 21a11.955 11.955 0 01-6-2.84 12.083 12.083 0 01-.16-7.582L12 14z" />
                            </svg>
                          </div>
                          <span className="font-medium text-gray-800 dark:text-white/90">{grade.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        {grade.nameHe ? (
                          <span dir="rtl" className="font-medium text-gray-800 dark:text-white/90">{grade.nameHe}</span>
                        ) : (
                          <span className="text-sm text-gray-400 dark:text-gray-500">—</span>
                        )}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-end">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/schools/${schoolId}/grades/${grade.id}`}
                            className="inline-flex items-center gap-1 rounded-lg bg-brand-50 px-3 py-2 text-sm font-medium text-brand-500 transition hover:bg-brand-100 dark:bg-brand-500/10 dark:hover:bg-brand-500/20"
                          >
                            Equipment list
                          </Link>
                          <button
                            type="button"
                            onClick={() => openEdit(grade)}
                            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-brand-500 dark:hover:bg-gray-800"
                            title="Edit"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(grade)}
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
              {editing ? "Edit grade" : "Add grade"}
            </h4>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {editing ? "Update the grade name." : `Add a grade to ${school?.name ?? "this school"}.`}
            </p>
          </div>
          <div className="space-y-4">
            <div>
              <Label>Grade name</Label>
              <Input
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="e.g. 9th Grade"
                error={Boolean(formError)}
                hint={formError ?? undefined}
              />
            </div>
            <div>
              <Label>Hebrew name (עברית)</Label>
              <Input
                value={nameHeInput}
                onChange={(e) => setNameHeInput(e.target.value)}
                placeholder={'לדוגמה: כיתה ט\''}
                dir="rtl"
              />
              <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                Optional. Shown to parents browsing in Hebrew; falls back to the grade name if blank.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3">
            <Button variant="outline" size="sm" onClick={() => setIsFormOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving…" : editing ? "Save changes" : "Create grade"}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete grade"
        message={
          <>
            Delete <span className="font-medium text-gray-700 dark:text-gray-300">{deleteTarget?.name}</span>?
            This removes its equipment list and order history. This cannot be undone.
          </>
        }
        confirmLabel="Delete grade"
        destructive
        isBusy={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
