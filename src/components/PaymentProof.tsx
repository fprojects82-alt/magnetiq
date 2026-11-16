"use client";

import { useRef, useState } from "react";
import { attachPaymentProof } from "@/app/order/[orderNumber]/confirmation/actions";
import { UploadError, uploadPhoto } from "@/lib/uploadClient";
import { useLang } from "@/context/LangContext";
import { OrderSteps, StuckBox } from "./OrderSteps";

export function CopyButton({ text, label }: { text: string; label?: string }) {
  const { t } = useLang();
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
      {copied ? t.common.copied : label ?? t.common.copy}
    </button>
  );
}

function StepCard({
  n,
  title,
  state,
  children,
}: {
  n: number;
  title: string;
  state: "done" | "active" | "todo";
  children?: React.ReactNode;
}) {
  return (
    <li
      className={`rounded-2xl border-2 p-4 transition sm:p-5 ${
        state === "active" ? "border-brand bg-white shadow-sm" : state === "done" ? "border-green-200 bg-green-50/60" : "border-stone-200 bg-white/60"
      }`}
    >
      <h3 className="flex items-center gap-2 font-semibold text-stone-800">
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
            state === "done" ? "bg-green-600 text-white" : state === "active" ? "bg-brand text-white" : "bg-stone-200 text-stone-500"
          }`}
        >
          {state === "done" ? "✓" : n}
        </span>
        {title}
      </h3>
      {children && <div className="mt-3 ps-10">{children}</div>}
    </li>
  );
}

/**
 * Steps 3–5 of an InstaPay order on the order page:
 * 3. copy our InstaPay number and send the money (and take a screenshot),
 * 4. upload the screenshot, 5. confirm. Shows the 5-step progress bar on top.
 */
export function PaymentFlow({
  orderNumber,
  total,
  instapayNumber,
  initialProofUrl,
  helpHref,
}: {
  orderNumber: string;
  total: number;
  instapayNumber: string;
  initialProofUrl: string | null;
  helpHref: string;
}) {
  const { t, fmt } = useLang();
  const p = t.pay;
  const inputRef = useRef<HTMLInputElement>(null);
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(Boolean(initialProofUrl));
  const [proofUrl, setProofUrl] = useState<string | null>(initialProofUrl);
  const [uploading, setUploading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const current = confirmed ? 6 : pendingUrl ? 5 : 3;

  async function onFile(file: File) {
    setError(null);
    setUploading(true);
    try {
      setPendingUrl(await uploadPhoto(file));
    } catch (err) {
      setError(err instanceof UploadError ? err.message : t.upload.failed);
    } finally {
      setUploading(false);
    }
  }

  async function onConfirm() {
    if (!pendingUrl) {
      setError(p.uploadFirst);
      return;
    }
    setConfirming(true);
    setError(null);
    const res = await attachPaymentProof(orderNumber, pendingUrl).catch(() => ({ ok: false }));
    setConfirming(false);
    if (!res.ok) {
      setError(p.errSave);
      return;
    }
    setProofUrl(pendingUrl);
    setConfirmed(true);
  }

  return (
    <section className="mt-6 space-y-4 text-start" aria-labelledby="pay-title">
      <div className="rounded-2xl bg-white p-3 shadow-sm sm:p-4">
        <OrderSteps current={current} t={t} />
      </div>

      {confirmed ? (
        <div className="flex items-center gap-4 rounded-2xl border-2 border-green-300 bg-green-50 p-5 text-green-900" role="status">
          {proofUrl && <img src={proofUrl} alt="" className="h-16 w-16 shrink-0 rounded-lg object-cover" />}
          <span>
            <strong className="block text-lg">{p.done}</strong>
            <span className="text-sm">{p.doneSub}</span>
          </span>
        </div>
      ) : (
        <>
          <h2 id="pay-title" className="text-lg font-bold text-stone-800">
            {p.payTitle}
          </h2>
          <ol className="space-y-3">
            <StepCard n={3} title={p.step3} state={current > 3 ? "done" : "active"}>
              <p className="text-sm font-semibold text-stone-800">{p.step3Amount(fmt(total))}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {instapayNumber ? (
                  <>
                    <code className="rounded-lg bg-brand-cream px-3 py-2 text-lg font-bold tracking-wider text-brand" dir="ltr">
                      {instapayNumber}
                    </code>
                    <CopyButton text={instapayNumber} label={t.common.copyNumber} />
                  </>
                ) : (
                  <a href={helpHref} target="_blank" rel="noreferrer" className="font-semibold text-brand underline">
                    {p.step3Ask}
                  </a>
                )}
              </div>
              <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm font-medium text-amber-900">{p.step3Reminder}</p>
            </StepCard>

            <StepCard n={4} title={p.step4} state={pendingUrl ? "done" : current === 3 ? "active" : "todo"}>
              {pendingUrl ? (
                <div className="flex items-center gap-3">
                  <img src={pendingUrl} alt="" className="h-20 w-20 rounded-lg border border-stone-200 object-cover" />
                  <button type="button" onClick={() => inputRef.current?.click()} className="text-sm font-semibold text-brand underline">
                    {p.change}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  disabled={uploading}
                  className="flex w-full flex-col items-center gap-1 rounded-xl border-2 border-dashed border-brand/50 bg-white px-4 py-5 text-center transition hover:border-brand disabled:opacity-60"
                >
                  {uploading ? (
                    <>
                      <span className="h-7 w-7 animate-spin rounded-full border-4 border-brand/20 border-t-brand" aria-hidden />
                      <span className="text-sm font-semibold text-brand">{t.common.uploading}</span>
                    </>
                  ) : (
                    <>
                      <span className="text-2xl" aria-hidden>📸</span>
                      <span className="font-semibold text-brand">{p.uploadBtn}</span>
                      <span className="text-xs text-stone-500">{p.uploadHint}</span>
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
                aria-label={p.uploadBtn}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onFile(file);
                  e.target.value = "";
                }}
              />
            </StepCard>

            <StepCard n={5} title={p.step5} state={pendingUrl ? "active" : "todo"}>
              <p className="text-sm text-stone-600">{p.step5Text}</p>
              <button type="button" onClick={onConfirm} disabled={confirming || !pendingUrl} className="btn-primary mt-3 w-full">
                {confirming ? p.confirming : p.confirmBtn}
              </button>
            </StepCard>
          </ol>
          <p role="alert" className="text-sm font-medium text-red-600 empty:hidden">{error}</p>
        </>
      )}

      <StuckBox t={t} href={helpHref} />
    </section>
  );
}
