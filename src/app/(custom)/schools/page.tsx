"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Breadcrumb from "@/components/common/Breadcrumb";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import * as api from "@/services/api";
import type { School } from "@/types/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function SchoolsPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create/edit modal state. `editing` null = creating a new school.
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<School | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [nameHeInput, setNameHeInput] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Delete confirmation state.
  const [deleteTarget, setDeleteTarget] = useState<School | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadSchools = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      setSchools(await api.getSchools());
    } catch (err) {
      console.error("Failed to load schools:", err);
      setError("Could not load schools. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSchools();
  }, [loadSchools]);

  const openCreate = () => {
    setEditing(null);
    setNameInput("");
    setNameHeInput("");
    setFormError(null);
    setIsFormOpen(true);
  };

  const openEdit = (school: School) => {
    setEditing(school);
    setNameInput(school.name);
    setNameHeInput(school.nameHe ?? "");
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleSave = async () => {
    const name = nameInput.trim();
    const nameHe = nameHeInput.trim();
    if (!name) {
      setFormError("School name is required.");
      return;
    }
    try {
      setIsSaving(true);
      setFormError(null);
      if (editing) {
        await api.updateSchool(editing.id, { name, nameHe });
      } else {
        await api.createSchool({ name, nameHe });
      }
      setIsFormOpen(false);
      await loadSchools();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Could not save the school.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await api.deleteSchool(deleteTarget.id);
      setDeleteTarget(null);
      await loadSchools();
    } catch (err) {
      console.error("Failed to delete school:", err);
      setError(err instanceof Error ? err.message : "Could not delete the school.");
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Breadcrumb pageTitle="Schools" />

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-6 py-5 dark:border-gray-800">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">All Schools</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage schools and drill into each one&apos;s grades and equipment lists.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/import"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 transition hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03]"
            >
              Import CSV
            </Link>
            <Button size="sm" onClick={openCreate}>
              Add School
            </Button>
          </div>
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
              <span className="ml-3 text-gray-500">Loading schools…</span>
            </div>
          ) : schools.length === 0 ? (
            <div className="py-12 text-center">
              <h3 className="text-lg font-medium text-gray-800 dark:text-white/90">No schools yet</h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Add your first school or import a CSV to get started.
              </p>
              <div className="mt-4">
                <Button size="sm" onClick={openCreate}>
                  Add School
                </Button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-gray-800">
                  <TableRow>
                    <TableCell isHeader className="px-5 py-3 text-start text-sm font-medium text-gray-500 dark:text-gray-400">
                      School Name
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
                  {schools.map((school) => (
                    <TableRow key={school.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                      <TableCell className="px-5 py-4 text-start">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-500/10">
                            <svg className="h-5 w-5 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          </div>
                          <span className="font-medium text-gray-800 dark:text-white/90">{school.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        {school.nameHe ? (
                          <span dir="rtl" className="font-medium text-gray-800 dark:text-white/90">{school.nameHe}</span>
                        ) : (
                          <span className="text-sm text-gray-400 dark:text-gray-500">—</span>
                        )}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-end">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/schools/${school.id}/grades`}
                            className="inline-flex items-center gap-1 rounded-lg bg-brand-50 px-3 py-2 text-sm font-medium text-brand-500 transition hover:bg-brand-100 dark:bg-brand-500/10 dark:hover:bg-brand-500/20"
                          >
                            Manage grades
                          </Link>
                          <button
                            type="button"
                            onClick={() => openEdit(school)}
                            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-brand-500 dark:hover:bg-gray-800"
                            title="Edit"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(school)}
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

      {/* Create / edit modal */}
      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} className="max-w-[480px] p-6 lg:p-8">
        <div className="space-y-6">
          <div>
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              {editing ? "Edit school" : "Add school"}
            </h4>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {editing ? "Update the school name." : "Create a new school."}
            </p>
          </div>
          <div className="space-y-4">
            <div>
              <Label>School name</Label>
              <Input
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="e.g. Ben Gurion"
                error={Boolean(formError)}
                hint={formError ?? undefined}
              />
            </div>
            <div>
              <Label>Hebrew name (עברית)</Label>
              <Input
                value={nameHeInput}
                onChange={(e) => setNameHeInput(e.target.value)}
                placeholder="לדוגמה: בן גוריון"
                dir="rtl"
              />
              <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                Optional. Shown to parents when they switch the site to Hebrew; falls back to the name above if left blank.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3">
            <Button variant="outline" size="sm" onClick={() => setIsFormOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving…" : editing ? "Save changes" : "Create school"}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete school"
        message={
          <>
            Delete <span className="font-medium text-gray-700 dark:text-gray-300">{deleteTarget?.name}</span>?
            This also removes its grades, equipment lists and order history. This cannot be undone.
          </>
        }
        confirmLabel="Delete school"
        destructive
        isBusy={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
