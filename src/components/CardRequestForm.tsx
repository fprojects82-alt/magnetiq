"use client";

import { useRef, useState } from "react";
import { submitCardRequest } from "@/app/event-cards/actions";
import { CARD_TYPES, MAGNET_OPTIONS } from "@/lib/cardRequest";
import { usePhotoUploads } from "@/lib/usePhotoUploads";
import { WhatsAppIcon } from "./WhatsAppButton";

const MAX_DEMOS = 10;

export function CardRequestForm() {
  const fileRef = useRef<HTMLInputElement>(null);
  const { entries, addFiles, remove, retry, uploadedUrls, uploadingCount, errorCount } = usePhotoUploads(MAX_DEMOS);

  const [cardType, setCardType] = useState<string>(CARD_TYPES[0]);
  const [cardCount, setCardCount] = useState("");
  const [withMagnets, setWithMagnets] = useState<boolean | null>(null);
  const [magnetType, setMagnetType] = useState<string>("");
  const [magnetCount, setMagnetCount] = useState("");
  const [names, setNames] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [notes, setNotes] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    if (uploadingCount > 0) return setError("Please wait for your design images to finish uploading.");
    if (errorCount > 0) return setError("Some images failed to upload. Tap them to retry, or remove them.");
    if (withMagnets === null) return setError("Do you want magnets on the cards? Choose yes or no.");
    if (withMagnets && !magnetType) return setError("Choose the magnet type.");
    setError(null);
    setSubmitting(true);
    const result = await submitCardRequest({
      customerName,
      phone,
      cardType: cardType as (typeof CARD_TYPES)[number],
      cardCount: Number(cardCount),
      withMagnets,
      magnetType: withMagnets ? magnetType : undefined,
      magnetCount: withMagnets ? Number(magnetCount || cardCount) : undefined,
      names,
      eventDate,
      notes,
      demoImageUrls: uploadedUrls,
    }).catch(() => ({ ok: false as const, message: "Connection problem. Please try again." }));
    setSubmitting(false);
    if (!result.ok) return setError(result.message);
    setWhatsappUrl(result.whatsappUrl);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (whatsappUrl) {
    return (
      <div className="card-surface p-6 text-center sm:p-10" role="status">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl text-green-700" aria-hidden>
          ✓
        </div>
        <h2 className="mt-4 text-2xl font-bold text-stone-800">Request received!</h2>
        <p className="mx-auto mt-2 max-w-md text-stone-600">
          Last step: send it to us on WhatsApp so we can reply with the price and a preview of your cards.
        </p>
        <a href={whatsappUrl} target="_blank" rel="noreferrer" className="btn-primary mt-6 bg-[#1f9e4f] text-base hover:bg-[#178a42]">
          <WhatsAppIcon className="h-5 w-5" /> Send on WhatsApp
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card-surface space-y-8 p-5 sm:p-8">
      {/* 1. Card */}
      <section className="space-y-4">
        <h2 className="step-title"><span className="step-num">1</span> Your cards</h2>
        <fieldset>
          <legend className="mb-2 text-sm font-medium text-stone-700">Occasion</legend>
          <div className="flex flex-wrap gap-2">
            {CARD_TYPES.map((t) => (
              <label
                key={t}
                className={`cursor-pointer rounded-full border-2 px-4 py-2 text-sm font-medium transition has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-brand/30 ${
                  cardType === t ? "border-brand bg-brand text-white" : "border-stone-200 bg-white text-stone-700 hover:border-brand/50"
                }`}
              >
                <input type="radio" name="cardType" value={t} checked={cardType === t} onChange={() => setCardType(t)} className="sr-only" />
                {t}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="cr-count" className="mb-1 block text-sm font-medium text-stone-700">How many cards?</label>
            <input
              id="cr-count"
              required
              type="number"
              inputMode="numeric"
              min={1}
              max={5000}
              className="input-field"
              placeholder="e.g. 100"
              value={cardCount}
              onChange={(e) => setCardCount(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="cr-date" className="mb-1 block text-sm font-medium text-stone-700">Event date (optional)</label>
            <input id="cr-date" className="input-field" placeholder="e.g. 20.06.2026" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
          </div>
        </div>
        <div>
          <label htmlFor="cr-names" className="mb-1 block text-sm font-medium text-stone-700">Names / text on the card (optional)</label>
          <input id="cr-names" className="input-field" placeholder="e.g. Kirolos & Mariam" value={names} onChange={(e) => setNames(e.target.value)} />
        </div>
      </section>

      {/* 2. Design */}
      <section>
        <h2 className="step-title"><span className="step-num">2</span> Your design or demo</h2>
        <p className="mt-1 text-sm text-stone-500">
          Upload your card design, or a picture of a card you like, plus the photo you want on the magnet. Up to {MAX_DEMOS} images.
        </p>
        <div className="mt-3 rounded-2xl border-2 border-dashed border-brand/30 bg-white p-4">
          {entries.length === 0 ? (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex w-full flex-col items-center gap-2 rounded-xl py-6 text-center focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/30"
            >
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="text-brand" aria-hidden>
                <rect x="3" y="5" width="18" height="14" rx="3" />
                <circle cx="9" cy="10" r="1.8" />
                <path d="m21 16-5-5-8 8" />
              </svg>
              <span className="font-semibold text-brand">Add design / photos</span>
              <span className="text-xs text-stone-500">Optional, but it helps us quote faster</span>
            </button>
          ) : (
            <ul className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              {entries.map((entry, i) => (
                <li key={entry.id} className="relative">
                  <div className="relative aspect-square overflow-hidden rounded-xl bg-stone-100">
                    <img src={entry.preview} alt={`Design image ${i + 1}`} className="h-full w-full object-cover" />
                    {entry.status === "uploading" && (
                      <span className="absolute inset-0 flex items-center justify-center bg-white/60">
                        <span className="h-6 w-6 animate-spin rounded-full border-4 border-brand/20 border-t-brand" aria-hidden />
                      </span>
                    )}
                    {entry.status === "error" && (
                      <button type="button" onClick={() => retry(entry.id)} className="absolute inset-0 bg-red-600/80 text-xs font-semibold text-white">
                        ↻ Retry
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(entry.id)}
                    className="absolute -right-1.5 -top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-stone-900 text-xs text-white"
                    aria-label={`Remove design image ${i + 1}`}
                  >
                    ✕
                  </button>
                </li>
              ))}
              {entries.length < MAX_DEMOS && (
                <li>
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="flex aspect-square w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-brand/40 text-brand"
                  >
                    <span className="text-2xl leading-none" aria-hidden>+</span>
                    <span className="text-xs font-semibold">Add more</span>
                  </button>
                </li>
              )}
            </ul>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*,.heic,.heif"
            multiple
            className="sr-only"
            tabIndex={-1}
            aria-hidden
            onChange={(e) => {
              if (e.target.files?.length) addFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </div>
      </section>

      {/* 3. Magnets */}
      <section className="space-y-4">
        <h2 className="step-title"><span className="step-num">3</span> Magnets on the cards?</h2>
        <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Magnets on the cards">
          {[
            { v: true, label: "Yes, add magnets", desc: "Guests keep your photo" },
            { v: false, label: "No, cards only", desc: "Printed cards" },
          ].map((o) => (
            <label
              key={String(o.v)}
              className={`cursor-pointer rounded-2xl border-2 p-4 transition has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-brand/30 ${
                withMagnets === o.v ? "border-brand bg-brand/5" : "border-stone-200 bg-white hover:border-brand/50"
              }`}
            >
              <input type="radio" name="withMagnets" checked={withMagnets === o.v} onChange={() => setWithMagnets(o.v)} className="sr-only" />
              <span className="block font-semibold text-stone-800">{o.label}</span>
              <span className="text-sm text-stone-500">{o.desc}</span>
            </label>
          ))}
        </div>

        {withMagnets && (
          <div className="space-y-4 rounded-2xl bg-brand-cream p-4">
            <fieldset>
              <legend className="mb-2 text-sm font-medium text-stone-700">Magnet type</legend>
              <div className="grid gap-2 sm:grid-cols-3">
                {MAGNET_OPTIONS.map((m) => (
                  <label
                    key={m.value}
                    className={`cursor-pointer rounded-xl border-2 bg-white p-3 text-sm font-medium transition has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-brand/30 ${
                      magnetType === m.value ? "border-brand text-brand" : "border-stone-200 text-stone-700 hover:border-brand/50"
                    }`}
                  >
                    <input type="radio" name="magnetType" value={m.value} checked={magnetType === m.value} onChange={() => setMagnetType(m.value)} className="sr-only" />
                    {m.label}
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="sm:max-w-xs">
              <label htmlFor="cr-mcount" className="mb-1 block text-sm font-medium text-stone-700">How many magnets?</label>
              <input
                id="cr-mcount"
                type="number"
                inputMode="numeric"
                min={1}
                max={5000}
                className="input-field"
                placeholder={cardCount ? `${cardCount} (one per card)` : "e.g. 100"}
                value={magnetCount}
                onChange={(e) => setMagnetCount(e.target.value)}
              />
              <p className="mt-1 text-xs text-stone-500">Leave empty for one magnet per card.</p>
            </div>
          </div>
        )}
      </section>

      {/* 4. Contact */}
      <section className="space-y-4">
        <h2 className="step-title"><span className="step-num">4</span> Your contact</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="cr-name" className="mb-1 block text-sm font-medium text-stone-700">Your name</label>
            <input id="cr-name" required autoComplete="name" className="input-field" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
          </div>
          <div>
            <label htmlFor="cr-phone" className="mb-1 block text-sm font-medium text-stone-700">WhatsApp number</label>
            <input
              id="cr-phone"
              required
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              className="input-field"
              placeholder="01xxxxxxxxx"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        </div>
        <div>
          <label htmlFor="cr-notes" className="mb-1 block text-sm font-medium text-stone-700">Anything else? (optional)</label>
          <textarea
            id="cr-notes"
            rows={3}
            className="input-field"
            placeholder="Colours, wording, delivery date, envelope…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </section>

      <p role="alert" className="text-sm font-medium text-red-600 empty:hidden">{error}</p>

      <button type="submit" disabled={submitting} className="btn-primary w-full text-base">
        {submitting ? "Sending…" : uploadingCount > 0 ? `Uploading ${uploadingCount}…` : "Request a quote"}
      </button>
      <p className="text-center text-xs text-stone-500">No payment now. We&apos;ll reply on WhatsApp with the price.</p>
    </form>
  );
}
