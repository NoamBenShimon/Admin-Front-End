"use client";

import React, { useRef, useState } from "react";
import Breadcrumb from "@/components/common/Breadcrumb";
import Button from "@/components/ui/button/Button";
import * as api from "@/services/api";
import type { ImportResult } from "@/types/api";

const TEMPLATE_HEADER = "school,grade,equipment,price,quantity";
const TEMPLATE_ROWS = [
  "Ben Gurion,9th Grade,Notebook,5.00,2",
  "Ben Gurion,9th Grade,Pencil,2.00,4",
  "ORT,12th Grade,Laptop,800.00,1",
];

type Phase = "idle" | "importing" | "done" | "error";

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<ImportResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] ?? null;
    setResult(null);
    setErrorMessage(null);
    setPhase("idle");
    if (selected && !selected.name.endsWith(".csv")) {
      setFile(null);
      setErrorMessage("Please choose a .csv file.");
      return;
    }
    setFile(selected);
  };

  const handleImport = async () => {
    if (!file) return;
    try {
      setPhase("importing");
      setErrorMessage(null);
      const importResult = await api.importCsv(file);
      setResult(importResult);
      setPhase("done");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Import failed. Please try again.");
      setPhase("error");
    }
  };

  const downloadTemplate = () => {
    const csv = [TEMPLATE_HEADER, ...TEMPLATE_ROWS].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "motzklist-equipment-template.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setFile(null);
    setResult(null);
    setErrorMessage(null);
    setPhase("idle");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <>
      <Breadcrumb pageTitle="Import" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Instructions */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] lg:col-span-1">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">CSV format</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Each row adds or updates one requirement line. Schools, grades and catalog items are
            created automatically if they don&apos;t exist yet.
          </p>
          <div className="mt-4 overflow-x-auto rounded-lg bg-gray-50 p-3 text-xs dark:bg-gray-800">
            <code className="block whitespace-pre text-gray-700 dark:text-gray-300">
              {[TEMPLATE_HEADER, ...TEMPLATE_ROWS].join("\n")}
            </code>
          </div>
          <ul className="mt-4 space-y-1 text-sm text-gray-500 dark:text-gray-400">
            <li><span className="font-medium text-gray-700 dark:text-gray-300">price</span> — shekels, e.g. 5.00</li>
            <li><span className="font-medium text-gray-700 dark:text-gray-300">quantity</span> — whole number &gt; 0</li>
          </ul>
          <Button variant="outline" size="sm" className="mt-5" onClick={downloadTemplate}>
            Download template
          </Button>
        </div>

        {/* Upload + result */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Upload a CSV</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Bulk-load equipment lists across schools and grades.
          </p>

          <div className="mt-5">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="w-full cursor-pointer text-sm text-gray-500 file:mr-4 file:cursor-pointer file:rounded-lg file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-brand-600 hover:file:bg-brand-100 dark:text-gray-400 dark:file:bg-brand-500/10 dark:file:text-brand-400"
            />
            {file && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                Selected: <span className="font-medium">{file.name}</span>{" "}
                <span className="text-gray-400">({(file.size / 1024).toFixed(1)} KB)</span>
              </p>
            )}
          </div>

          {errorMessage && (
            <div className="mt-4 rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-600 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-400">
              {errorMessage}
            </div>
          )}

          <div className="mt-5 flex items-center gap-3">
            <Button size="sm" onClick={handleImport} disabled={!file || phase === "importing"}>
              {phase === "importing" ? "Importing…" : "Import"}
            </Button>
            {(file || result) && (
              <Button variant="outline" size="sm" onClick={reset} disabled={phase === "importing"}>
                Clear
              </Button>
            )}
          </div>

          {result && (
            <div className="mt-6 border-t border-gray-100 pt-6 dark:border-gray-800">
              <div className="grid grid-cols-3 gap-4">
                <SummaryStat label="Created" value={result.created} tone="success" />
                <SummaryStat label="Updated" value={result.updated} tone="brand" />
                <SummaryStat label="Skipped" value={result.skipped} tone={result.skipped ? "error" : "muted"} />
              </div>

              {result.errors.length > 0 ? (
                <div className="mt-5">
                  <h4 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Rows that were skipped
                  </h4>
                  <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
                    {result.errors.map((e) => (
                      <div
                        key={e.row}
                        className="flex gap-3 border-b border-gray-100 px-4 py-2 text-sm last:border-b-0 dark:border-gray-800"
                      >
                        <span className="font-medium text-gray-500 dark:text-gray-400">Row {e.row}</span>
                        <span className="text-error-600 dark:text-error-400">{e.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="mt-5 text-sm text-success-600 dark:text-success-400">
                  All rows imported successfully.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function SummaryStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "success" | "brand" | "error" | "muted";
}) {
  const toneClasses: Record<typeof tone, string> = {
    success: "text-success-600 dark:text-success-400",
    brand: "text-brand-500",
    error: "text-error-600 dark:text-error-400",
    muted: "text-gray-700 dark:text-gray-300",
  };
  return (
    <div className="rounded-xl border border-gray-100 p-4 text-center dark:border-gray-800">
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${toneClasses[tone]}`}>{value}</p>
    </div>
  );
}
