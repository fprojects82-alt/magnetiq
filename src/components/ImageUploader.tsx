"use client";

import { useId, useRef, useState } from "react";
import { UploadError, uploadPhoto } from "@/lib/uploadClient";

interface ImageUploaderProps {
  label?: string;
  value: string | null;
  onChange: (url: string | null) => void;
  shape?: "magnet" | "card";
}

export function ImageUploader({ label, value, onChange, shape = "magnet" }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);
    setUploading(true);
    try {
      onChange(await uploadPhoto(file));
    } catch (err) {
      setError(err instanceof UploadError ? err.message : "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  const frameClass = shape === "card" ? "aspect-[3/4] w-44 rounded-lg" : "aspect-square w-44 rounded-2xl";

  return (
    <div className="flex flex-col items-center gap-2">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-stone-700">
          {label}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const file = e.dataTransfer.files?.[0];
            if (file) handleFile(file);
          }}
          aria-label={value ? "Change photo" : "Upload a photo"}
          className={`relative ${frameClass} flex items-center justify-center overflow-hidden border-2 border-dashed transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/30 ${
            dragging ? "border-brand bg-brand/10" : "border-brand/40 bg-white hover:border-brand"
          }`}
        >
          {value ? (
            <img src={value} alt="Your uploaded photo" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <span className="flex flex-col items-center gap-2 px-3 text-center text-sm text-stone-600">
              {uploading ? (
                <>
                  <span className="h-8 w-8 animate-spin rounded-full border-4 border-brand/20 border-t-brand" aria-hidden />
                  Uploading…
                </>
              ) : (
                <>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-brand" aria-hidden>
                    <rect x="3" y="5" width="18" height="14" rx="3" />
                    <circle cx="9" cy="10" r="1.8" />
                    <path d="m21 16-5-5-8 8" />
                  </svg>
                  <span className="font-semibold text-brand">Tap to add photo</span>
                  <span className="text-xs text-stone-500">or drag it here</span>
                </>
              )}
            </span>
          )}
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-sm text-white hover:bg-black"
            aria-label="Remove photo"
          >
            ✕
          </button>
        )}
      </div>
      <input
        id={inputId}
        ref={inputRef}
        type="file"
        accept="image/*,.heic,.heif"
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
      <p role="status" aria-live="polite" className="min-h-[1rem] text-center text-xs text-red-600">
        {error}
      </p>
    </div>
  );
}
