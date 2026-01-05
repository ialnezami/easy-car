"use client";

import { useState, useRef } from "react";

interface DocumentUploadProps {
  label: string;
  onUploadComplete: (url: string) => void;
  onError?: (error: string) => void;
  accept?: string;
  maxSize?: number; // in MB
  required?: boolean;
  uploadedUrl?: string;
}

export default function DocumentUpload({
  label,
  onUploadComplete,
  onError,
  accept = "image/*,.pdf",
  maxSize = 10,
  required = false,
  uploadedUrl,
}: DocumentUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validImageTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const validPdfType = "application/pdf";
    const isValidType = validImageTypes.includes(file.type) || file.type === validPdfType;
    
    if (!isValidType) {
      onError?.("Invalid file type. Only images (JPEG, PNG, WebP) and PDF files are allowed.");
      return;
    }

    // Validate file size
    const maxSizeBytes = maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      onError?.(`File size exceeds ${maxSize}MB limit`);
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "document"); // Indicate this is a document upload

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      onUploadComplete(data.url);
      setUploadProgress(100);
    } catch (error: any) {
      onError?.(error.message || "Failed to upload document");
    } finally {
      setUploading(false);
      setUploadProgress(0);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const isPdf = uploadedUrl?.toLowerCase().endsWith(".pdf") || uploadedUrl?.includes("pdf");

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-slate-700 mb-2">
        {label}
        {required && <span className="text-error-600 ml-1">*</span>}
      </label>
      
      {uploadedUrl ? (
        <div className="mb-3 p-3 bg-success-50 border border-success-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isPdf ? (
                <svg className="w-5 h-5 text-error-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              )}
              <span className="text-sm font-medium text-success-700">Document uploaded</span>
            </div>
            <a
              href={uploadedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-success-600 hover:text-success-700 font-medium"
            >
              View
            </a>
          </div>
        </div>
      ) : null}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        id={`document-upload-${label.replace(/\s+/g, "-").toLowerCase()}`}
        disabled={uploading}
        required={required && !uploadedUrl}
      />
      <label
        htmlFor={`document-upload-${label.replace(/\s+/g, "-").toLowerCase()}`}
        className={`inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium ${
          uploading
            ? "bg-slate-100 text-slate-400 cursor-not-allowed border-slate-300"
            : "bg-white text-slate-700 hover:bg-slate-50 cursor-pointer border-slate-300"
        }`}
      >
        {uploading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-slate-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Uploading... {uploadProgress}%
          </>
        ) : (
          <>
            <svg
              className="-ml-1 mr-2 h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            {uploadedUrl ? "Replace Document" : "Upload Document"}
          </>
        )}
      </label>
      <p className="mt-1 text-xs text-slate-500">
        Max size: {maxSize}MB. Accepted formats: Images (JPEG, PNG, WebP) or PDF
      </p>
    </div>
  );
}

