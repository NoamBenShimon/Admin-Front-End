"use client";

import React, { useCallback, useEffect, useState } from "react";
import Breadcrumb from "@/components/common/Breadcrumb";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import * as api from "@/services/api";
import type { ParentUser } from "@/types/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function UsersPage() {
  const [users, setUsers] = useState<ParentUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<ParentUser | null>(null);
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<ParentUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      setUsers(await api.getParents());
    } catch (err) {
      console.error("Failed to load users:", err);
      setError("Could not load users. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setUsernameInput("");
    setPasswordInput("");
    setFormError(null);
    setIsFormOpen(true);
  };

  const openEdit = (parent: ParentUser) => {
    setEditing(parent);
    setUsernameInput(parent.username);
    setPasswordInput("");
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleSave = async () => {
    const username = usernameInput.trim();
    if (!username) {
      setFormError("Username is required.");
      return;
    }
    if (!editing && !passwordInput) {
      setFormError("Password is required for a new user.");
      return;
    }
    try {
      setIsSaving(true);
      setFormError(null);
      if (editing) {
        await api.updateParent(editing.id, {
          username,
          password: passwordInput ? passwordInput : undefined,
        });
      } else {
        await api.createParent({ username, password: passwordInput });
      }
      setIsFormOpen(false);
      await load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Could not save the user.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await api.deleteParent(deleteTarget.id);
      setDeleteTarget(null);
      await load();
    } catch (err) {
      console.error("Failed to delete user:", err);
      setError(err instanceof Error ? err.message : "Could not delete the user.");
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Breadcrumb pageTitle="Users" />

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-6 py-5 dark:border-gray-800">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Parent accounts</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage the parent accounts that can sign in to the storefront.
            </p>
          </div>
          <Button size="sm" onClick={openCreate}>
            Add User
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
              <span className="ml-3 text-gray-500">Loading users…</span>
            </div>
          ) : users.length === 0 ? (
            <div className="py-12 text-center">
              <h3 className="text-lg font-medium text-gray-800 dark:text-white/90">No users yet</h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Create the first parent account.</p>
              <div className="mt-4">
                <Button size="sm" onClick={openCreate}>
                  Add User
                </Button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-gray-800">
                  <TableRow>
                    <TableCell isHeader className="px-5 py-3 text-start text-sm font-medium text-gray-500 dark:text-gray-400">
                      Username
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 text-end text-sm font-medium text-gray-500 dark:text-gray-400">
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {users.map((parent) => (
                    <TableRow key={parent.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                      <TableCell className="px-5 py-4 text-start">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-sm font-semibold text-brand-500 dark:bg-brand-500/10">
                            {parent.username.slice(0, 2).toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-800 dark:text-white/90">{parent.username}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-end">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEdit(parent)}
                            className="rounded-lg px-3 py-2 text-sm font-medium text-brand-500 transition hover:bg-brand-50 dark:hover:bg-brand-500/10"
                          >
                            Edit / reset password
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(parent)}
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
              {editing ? "Edit user" : "Add user"}
            </h4>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {editing
                ? "Rename the account or set a new password. Leave the password blank to keep it."
                : "Create a new parent account."}
            </p>
          </div>
          <div className="space-y-4">
            <div>
              <Label>Username</Label>
              <Input value={usernameInput} onChange={(e) => setUsernameInput(e.target.value)} placeholder="e.g. cohen_family" />
            </div>
            <div>
              <Label>{editing ? "New password (optional)" : "Password"}</Label>
              <Input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder={editing ? "Leave blank to keep current" : "Set a password"}
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
              {isSaving ? "Saving…" : editing ? "Save changes" : "Create user"}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete user"
        message={
          <>
            Delete <span className="font-medium text-gray-700 dark:text-gray-300">{deleteTarget?.username}</span>?
            Their cart and order history are removed too. This cannot be undone.
          </>
        }
        confirmLabel="Delete user"
        destructive
        isBusy={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
