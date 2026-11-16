"use client";

import { useRef, useState } from "react";
import { submitReview } from "@/app/order/[orderNumber]/confirmation/reviewActions";
import { UploadError, uploadPhoto } from "@/lib/uploadClient";
import { useLang } from "@/context/LangContext";

export function Stars({ value, size = "text-lg", label }: { value: number; size?: string; label?: string }) {
  return (
    <span className={`${size} leading-none text-amber-500`} aria-label={label ?? `${value} out of 5 stars`} dir="ltr">
      {"★★★★★".slice(0, value)}
      <span className="text-stone-300">{"★★★★★".slice(value)}</span>
    </span>
  );
}

export function ReviewForm({ orderNumber, defaultName }: { orderNumber: string; defaultName: string }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const { t } = useLang();
  const rt = t.reviews;
  const [rating, setRating] = useState(0);
  const [name, setName] = useState(defaultName);
  const [text, setText] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <div className="rounded-2xl bg-green-50 p-5 text-center text-green-800" role="status">
        <p className="text-2xl" aria-hidden>💛</p>
        <p className="mt-1 font-semibold">{rt.thanks}</p>
        <p className="text-sm">{rt.thanksSub}</p>
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!rating) return setError(rt.needRating);
    if (uploading) return setError(rt.waitPhoto);
    setBusy(true);
    setError(null);
    const res = await submitReview({ orderNumber, name, rating, text, photoUrl }).catch(() => ({
      ok: false,
      message: t.checkout.errConnection,
    }));
    setBusy(false);
    if (!res.ok) return setError(res.message || t.checkout.errGeneric);
    setDone(true);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl bg-white p-5 text-start shadow-sm">
      <div>
        <h2 className="font-semibold text-stone-800">{rt.formTitle}</h2>
        <p className="text-sm text-stone-500">{rt.formSub}</p>
      </div>
      <fieldset>
        <legend className="mb-1 text-sm font-medium text-stone-700">{rt.rating}</legend>
        <div className="flex gap-1" role="radiogroup" dir="ltr">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={rating === n}
              aria-label={rt.starLabel(n)}
              onClick={() => setRating(n)}
              className={`text-4xl leading-none transition ${n <= rating ? "text-amber-500" : "text-stone-300 hover:text-amber-300"}`}
            >
              ★
            </button>
          ))}
        </div>
      </fieldset>
      <div>
        <label htmlFor="rv-name" className="mb-1 block text-sm font-medium text-stone-700">{rt.name}</label>
        <input id="rv-name" required maxLength={60} className="input-field" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <label htmlFor="rv-text" className="mb-1 block text-sm font-medium text-stone-700">{rt.text}</label>
        <textarea
          id="rv-text"
          required
          rows={3}
          maxLength={800}
          className="input-field"
          placeholder={rt.textPh}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>
      <div className="flex items-center gap-3">
        {photoUrl ? (
          <>
            <img src={photoUrl} alt="" className="h-16 w-16 rounded-lg object-cover" />
            <button type="button" onClick={() => setPhotoUrl(null)} className="text-sm text-stone-500 underline">
              {rt.removePhoto}
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium hover:border-brand hover:text-brand disabled:opacity-60"
          >
            {uploading ? t.common.uploading : rt.addPhoto}
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*,.heic,.heif"
          className="sr-only"
          tabIndex={-1}
          aria-hidden
          onChange={async (e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (!file) return;
            setUploading(true);
            setError(null);
            try {
              setPhotoUrl(await uploadPhoto(file));
            } catch (err) {
              setError(err instanceof UploadError ? err.message : t.upload.failed);
            } finally {
              setUploading(false);
            }
          }}
        />
      </div>
      <p role="alert" className="text-sm text-red-600 empty:hidden">{error}</p>
      <button type="submit" disabled={busy} className="btn-primary w-full">
        {busy ? t.common.sending : rt.submit}
      </button>
    </form>
  );
}
