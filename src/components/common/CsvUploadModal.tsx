"use client";
import React, { useState, useRef, useCallback } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Label from "../form/Label";

type UploadState = "idle" | "uploading" | "processing" | "success" | "error";

interface CsvUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUploadComplete: () => void;
}

const CsvUploadModal: React.FC<CsvUploadModalProps> = ({
                                                           isOpen,
                                                           onClose,
                                                           onUploadComplete,
                                                       }) => {
    const [file, setFile] = useState<File | null>(null);
    const [uploadState, setUploadState] = useState<UploadState>("idle");
    const [uploadProgress, setUploadProgress] = useState(0);
    const [errorMessage, setErrorMessage] = useState("");
    const xhrRef = useRef<XMLHttpRequest | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const resetState = useCallback(() => {
        setFile(null);
        setUploadState("idle");
        setUploadProgress(0);
        setErrorMessage("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }, []);

    const handleClose = useCallback(() => {
        // Abort any ongoing upload
        if (xhrRef.current) {
            xhrRef.current.abort();
            xhrRef.current = null;
        }
        resetState();
        onClose();
    }, [onClose, resetState]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            if (!selectedFile.name.endsWith(".csv")) {
                setErrorMessage("Please select a CSV file.");
                setFile(null);
                return;
            }
            setFile(selectedFile);
            setErrorMessage("");
        }
    };

    const handleUpload = useCallback(() => {
        if (!file) return;

        setUploadState("uploading");
        setUploadProgress(0);
        setErrorMessage("");

        const xhr = new XMLHttpRequest();
        xhrRef.current = xhr;

        const formData = new FormData();
        formData.append("file", file);

        // Upload progress tracking
        xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
                const progress = Math.round((event.loaded / event.total) * 100);
                setUploadProgress(progress);
            }
        };

        // Upload complete - now waiting for server processing
        xhr.upload.onload = () => {
            setUploadState("processing");
        };

        // Response received
        xhr.onload = () => {
            xhrRef.current = null;
            if (xhr.status >= 200 && xhr.status < 300) {
                setUploadState("success");
                // Auto-close after 2 seconds and trigger refresh
                setTimeout(() => {
                    onUploadComplete();
                    handleClose();
                }, 2000);
            } else {
                let message = "Upload failed. Please try again.";
                try {
                    const response = JSON.parse(xhr.responseText);
                    if (response.error) {
                        message = response.error;
                    }
                } catch {
                    // Use default message
                }
                setErrorMessage(message);
                setUploadState("error");
            }
        };

        // Network error
        xhr.onerror = () => {
            xhrRef.current = null;
            setErrorMessage("Network error. Please check your connection and try again.");
            setUploadState("error");
            // Try to refresh schools in case backend updated
            onUploadComplete();
        };

        // Timeout handling
        xhr.ontimeout = () => {
            xhrRef.current = null;
            setErrorMessage("Request timed out. The server may still be processing your file.");
            setUploadState("error");
            // Try to refresh schools in case backend updated
            onUploadComplete();
        };

        // Abort handling
        xhr.onabort = () => {
            xhrRef.current = null;
            resetState();
        };

        // Set timeouts: 30s for upload phase is handled by browser default,
        // but we set overall timeout to handle processing phase (60s after upload completes)
        // Total timeout = generous amount to cover both phases
        xhr.timeout = 90000; // 90 seconds total

        xhr.open("POST", "/api/upload-csv");
        xhr.withCredentials = true;
        xhr.send(formData);

        // Additional processing timeout (60s after upload completes)
        const processingTimeoutId = setTimeout(() => {
            if (uploadState === "processing" && xhrRef.current) {
                xhrRef.current.abort();
                setErrorMessage("Server processing timed out. Your file may still be processing.");
                setUploadState("error");
                onUploadComplete();
            }
        }, 90000);

        // Store timeout ID for cleanup
        xhr.onloadend = () => {
            clearTimeout(processingTimeoutId);
        };
    }, [file, uploadState, onUploadComplete, handleClose, resetState]);

    const getStateContent = () => {
        switch (uploadState) {
            case "uploading":
                return (
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                Uploading... {uploadProgress}%
              </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                                className="bg-brand-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                            ></div>
                        </div>
                    </div>
                );

            case "processing":
                return (
                    <div className="flex items-center gap-3">
                        <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm text-gray-600 dark:text-gray-300">
              Server is processing your file. Please wait...
            </span>
                    </div>
                );

            case "success":
                return (
                    <div className="flex items-center gap-3 text-green-600 dark:text-green-400">
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                        <span className="text-sm font-medium">
              File uploaded successfully!
            </span>
                    </div>
                );

            case "error":
                return (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <div className="flex items-start gap-2">
                            <svg
                                className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            <span className="text-sm text-red-700 dark:text-red-300">
                {errorMessage}
              </span>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    const isUploading = uploadState === "uploading" || uploadState === "processing";

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            className="max-w-[480px] p-6 lg:p-8"
        >
            <div className="space-y-6">
                <div>
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        Upload CSV File
                    </h4>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Select a CSV file to upload and update the database.
                    </p>
                </div>

                {uploadState === "idle" || uploadState === "error" ? (
                    <div className="space-y-4">
                        <div>
                            <Label>Select File</Label>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".csv"
                                onChange={handleFileChange}
                                className="mt-1 w-full text-sm text-gray-500 dark:text-gray-400
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-medium
                  file:bg-brand-50 file:text-brand-600
                  dark:file:bg-brand-500/10 dark:file:text-brand-400
                  hover:file:bg-brand-100 dark:hover:file:bg-brand-500/20
                  file:cursor-pointer file:transition-colors
                  cursor-pointer"
                            />
                            {file && (
                                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                                    Selected: <span className="font-medium">{file.name}</span>{" "}
                                    <span className="text-gray-400">
                    ({(file.size / 1024).toFixed(1)} KB)
                  </span>
                                </p>
                            )}
                        </div>

                        {uploadState === "error" && getStateContent()}
                    </div>
                ) : (
                    <div className="py-4">{getStateContent()}</div>
                )}

                {uploadState !== "success" && (
                    <div className="flex items-center justify-end gap-3 pt-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleClose}
                            disabled={isUploading}
                        >
                            Cancel
                        </Button>
                        {(uploadState === "idle" || uploadState === "error") && (
                            <Button
                                size="sm"
                                onClick={handleUpload}
                                disabled={!file}
                            >
                                Upload
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default CsvUploadModal;