"use client";

import React, { useEffect, useState, useCallback } from "react";
import Breadcrumb from "@/components/common/Breadcrumb";
import CsvUploadModal from "@/components/common/CsvUploadModal";
import Button from "@/components/ui/button/Button";
import Link from "next/link";
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
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const loadSchools = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await api.getSchools();
      setSchools(data);
    } catch (error) {
      console.error("Failed to load schools:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSchools();
  }, [loadSchools]);

  return (
      <>
        <Breadcrumb pageTitle="Schools" />

        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                  All Schools
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Select a school to manage its classes and equipment lists.
                </p>
              </div>
              <Button
                  size="sm"
                  onClick={() => setIsUploadModalOpen(true)}
                  startIcon={
                    <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                      <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                      />
                    </svg>
                  }
              >
                Upload CSV
              </Button>
            </div>
          </div>

          <div className="p-6">
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="inline-block w-8 h-8 border-4 border-gray-300 border-t-brand-500 rounded-full animate-spin"></div>
                  <span className="ml-3 text-gray-500">Loading schools...</span>
                </div>
            ) : schools.length === 0 ? (
                <div className="text-center py-12">
                  <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                  >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                  <h3 className="mt-4 text-lg font-medium text-gray-800 dark:text-white/90">
                    No schools found
                  </h3>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Contact an administrator to add schools to the system.
                  </p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="border-b border-gray-100 dark:border-gray-800">
                      <TableRow>
                        <TableCell
                            isHeader
                            className="px-5 py-3 font-medium text-gray-500 text-start text-sm dark:text-gray-400"
                        >
                          School Name
                        </TableCell>
                        <TableCell
                            isHeader
                            className="px-5 py-3 font-medium text-gray-500 text-start text-sm dark:text-gray-400"
                        >
                          Address
                        </TableCell>
                        <TableCell
                            isHeader
                            className="px-5 py-3 font-medium text-gray-500 text-start text-sm dark:text-gray-400"
                        >
                          Contact
                        </TableCell>
                        <TableCell
                            isHeader
                            className="px-5 py-3 font-medium text-gray-500 text-center text-sm dark:text-gray-400"
                        >
                          Actions
                        </TableCell>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {schools.map((school) => (
                          <TableRow
                              key={school.id}
                              className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
                          >
                            <TableCell className="px-5 py-4 text-start">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-500/10">
                                  <svg
                                      className="h-5 w-5 text-brand-500"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                  >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                    />
                                  </svg>
                                </div>
                                <span className="font-medium text-gray-800 dark:text-white/90">
                            {school.name}
                          </span>
                              </div>
                            </TableCell>
                            <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400 text-start text-sm">
                              {school.address || "—"}
                            </TableCell>
                            <TableCell className="px-5 py-4 text-start text-sm">
                              <div>
                                {school.contactEmail && (
                                    <a
                                        href={`mailto:${school.contactEmail}`}
                                        className="text-brand-500 hover:text-brand-600 block"
                                    >
                                      {school.contactEmail}
                                    </a>
                                )}
                                {school.contactPhone && (
                                    <span className="text-gray-500 dark:text-gray-400">
                              {school.contactPhone}
                            </span>
                                )}
                                {!school.contactEmail && !school.contactPhone && "—"}
                              </div>
                            </TableCell>
                            <TableCell className="px-5 py-4 text-center">
                              <Link
                                  href={`/schools/${school.id}/classes`}
                                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-brand-500 bg-brand-50 rounded-lg hover:bg-brand-100 dark:bg-brand-500/10 dark:hover:bg-brand-500/20 transition-colors"
                              >
                                View Classes
                                <svg
                                    className="h-4 w-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                  <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M9 5l7 7-7 7"
                                  />
                                </svg>
                              </Link>
                            </TableCell>
                          </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
            )}
          </div>
        </div>

        <CsvUploadModal
            isOpen={isUploadModalOpen}
            onClose={() => setIsUploadModalOpen(false)}
            onUploadComplete={loadSchools}
        />
      </>
  );
}
