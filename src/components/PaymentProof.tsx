"use client";

import { useRef, useState } from "react";
import { attachPaymentProof } from "@/app/order/[orderNumber]/confirmation/actions";
import { UploadError, uploadPhoto } from "@/lib/uploadClient";

export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          // clipboard unavailable; the text is still visible
        }
      }}
      className="min-h-[40px] rounded-full border border-stone-300 bg-white px-4 text-xs font-semibold hover:border-brand hover:text-brand"
    >
      {copied ? "Copied!" : label}
    </button>
  );
}

export function PaymentProofUploader({ orderNumber, initialUrl }: { orderNumber: string; initialUrl: string | null }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState<string | null>(initialUrl);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handle(file: File) {
    setError(null);
    setBusy(true);
    try {
      const uploaded = await uploadPhoto(file);
      const res = await attachPaymentProof(orderNumber, uploaded);
      if (!res.ok) throw new UploadError(res.message || "Couldn't save the screenshot.");
      setUrl(uploaded);
    } catch (err) {
      setError(err instanceof UploadError ? err.message : "Upload failed. Please try again, or send it on WhatsApp.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      {url ? (
        <div className="flex items-center gap-3 rounded-xl bg-green-50 p-3 text-sm text-green-800" role="status">
          <img src={url} alt="Your InstaPay screenshot" className="h-16 w-16 rounded-lg object-cover" />
          <span className="flex-1">
            <strong>Screenshot received ✓</strong>
            <span className="block text-green-700">We&apos;ll confirm your payment and start printing.</span>
          </span>
          <button type="button" onClick={() => inputRef.current?.click()} className="text-xs font-semibold underline">
            Change
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="flex w-full flex-col items-center gap-1 rounded-xl border-2 border-dashed border-brand/50 bg-white px-4 py-5 text-center transition hover:border-brand disabled:opacity-60"
        >
          {busy ? (
            <>
              <span className="h-7 w-7 animate-spin rounded-full border-4 border-brand/20 border-t-brand" aria-hidden />
              <span className="text-sm font-semibold text-brand">Uploading…</span>
            </>
          ) : (
            <>
              <span className="text-2xl" aria-hidden>📸</span>
              <span className="font-semibold text-brand">Upload InstaPay screenshot</span>
              <span className="text-xs text-stone-500">Tap to choose it from your phone</span>
            </>
          )}
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*,.heic,.heif"
        className="sr-only"
        tabIndex={-1}
        aria-label="Upload InstaPay screenshot"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handle(file);
          e.target.value = "";
        }}
      />
      <p role="alert" className="mt-2 text-sm text-red-600 empty:hidden">{error}</p>
    </div>
  );
}
