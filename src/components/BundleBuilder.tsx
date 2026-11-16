"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { formatEGP } from "@/lib/currency";
import { getPrintLine, perPiece } from "@/lib/catalog";
import { usePhotoUploads } from "@/lib/usePhotoUploads";
import { CartItem, EventCardText } from "@/lib/types";

export interface BundleOption {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  badge: string | null;
  composition: string;
  photoSlots: number;
  sampleImageUrl: string;
}

interface BundleBuilderProps {
  bundles: BundleOption[];
  initialSlug: string;
  lineKey: string | null;
}

export function BundleBuilder({ bundles, initialSlug, lineKey }: BundleBuilderProps) {
  const line = getPrintLine(lineKey);
  const router = useRouter();
  const { addItem } = useCart();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photosHeadingId = useId();

  const [slug, setSlug] = useState(initialSlug);
  const bundle = bundles.find((b) => b.slug === slug) ?? bundles[0];
  const maxSlots = Math.max(...bundles.map((b) => b.photoSlots));

  const { entries, addFiles, remove, retry, clear, uploadingCount, errorCount } =
    usePhotoUploads(maxSlots);
  const [photosLater, setPhotosLater] = useState(false);
  // How many prints of each uploaded photo (same photo more than once).
  const [copies, setCopies] = useState<Record<string, number>>({});
  const copiesOf = (id: string) => copies[id] ?? 1;
  const [names, setNames] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  const includesCard = bundle.composition.toLowerCase().includes("card");
  const slots = bundle.photoSlots;
  const count = entries.reduce((sum, e) => sum + copiesOf(e.id), 0);
  const overBy = count - slots;
  // Each uploaded photo repeated by its copy count, in order.
  const printUrls = entries.flatMap((e) =>
    e.status === "done" && e.url ? Array<string>(copiesOf(e.id)).fill(e.url) : []
  );
  const missing = Math.max(0, slots - printUrls.length);

  function setCopiesFor(id: string, n: number) {
    setCopies((prev) => ({ ...prev, [id]: Math.max(1, Math.min(maxSlots, n)) }));
  }
  const fitsBundle = bundles.find((b) => b.photoSlots >= count && b.photoSlots > slots);

  // Keep the URL in sync so the page can be shared / refreshed on the chosen size.
  useEffect(() => {
    const url = line ? `/shop/${line.anchor}?size=${bundle.photoSlots}` : `/packages/${bundle.slug}`;
    if (window.location.pathname + window.location.search !== url) window.history.replaceState(null, "", url);
  }, [bundle.slug, bundle.photoSlots, line]);

  function chooseBundle(next: BundleOption) {
    setSlug(next.slug);
    setAdded(false);
    setError(null);
  }

  function handleFiles(list: FileList | File[]) {
    setError(null);
    const files = Array.from(list);
    const added = addFiles(files);
    if (added < files.length) {
      setNotice(`You can add up to ${maxSlots} photos. ${files.length - added} weren't added.`);
    } else {
      setNotice(null);
    }
  }

  const canAdd = uploadingCount === 0 && overBy <= 0 && (missing === 0 || photosLater) && errorCount === 0;

  function validate(): boolean {
    if (uploadingCount > 0) {
      setError("Please wait for your photos to finish uploading.");
      return false;
    }
    if (errorCount > 0) {
      setError("Some photos failed to upload. Tap them to retry, or remove them.");
      return false;
    }
    if (overBy > 0) {
      setError(`This bundle holds ${slots} photos. Remove ${overBy} or choose a bigger bundle.`);
      return false;
    }
    if (missing > 0 && !photosLater) {
      setError(
        `Add ${missing} more photo${missing > 1 ? "s" : ""}, or tick "I'll send my photos on WhatsApp".`
      );
      return false;
    }
    return true;
  }

  function handleAdd(goToCheckout: boolean) {
    if (!validate()) return;
    setError(null);
    const customText: EventCardText | undefined =
      includesCard || (photosLater && missing > 0)
        ? {
            ...(includesCard ? { names, eventDate } : {}),
            ...(photosLater && missing > 0 ? { photosLater: true } : {}),
          }
        : undefined;
    const item: CartItem = {
      key: `${bundle.slug}-${Date.now()}`,
      kind: "package",
      id: bundle.id,
      slug: bundle.slug,
      name: bundle.name,
      size: line?.size,
      quantity: 1,
      unitPrice: bundle.price,
      compareAtPrice: bundle.compareAtPrice,
      imageUrl: bundle.sampleImageUrl,
      uploadedImageUrls: printUrls,
      customText,
    };
    addItem(item);
    if (goToCheckout) {
      router.push("/checkout");
      return;
    }
    setAdded(true);
    clear();
    setCopies({});
    setPhotosLater(false);
  }

  const saving = bundle.compareAtPrice && bundle.compareAtPrice > bundle.price ? bundle.compareAtPrice - bundle.price : 0;
  const aspect = line?.aspect ?? "1 / 1";

  return (
    <div className="pb-28 sm:pb-0">
      {/* Step 1 — bundle size */}
      {bundles.length > 1 && (
        <section aria-labelledby="step-size">
          <h2 id="step-size" className="step-title">
            <span className="step-num">1</span> How many photos?
          </h2>
          <div role="radiogroup" aria-labelledby="step-size" className={`mt-3 grid grid-cols-3 gap-2 sm:gap-3 ${bundles.length > 6 ? "sm:grid-cols-4" : ""}`}>
            {bundles.map((b) => {
              const selected = b.slug === bundle.slug;
              return (
                <button
                  key={b.slug}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => chooseBundle(b)}
                  className={`relative flex flex-col items-center rounded-2xl border-2 px-2 pb-3 pt-4 text-center transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/30 ${
                    selected ? "border-brand bg-brand/5 shadow-md" : "border-stone-200 bg-white hover:border-brand/50"
                  }`}
                >
                  {b.badge && (
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-brand px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                      {b.badge}
                    </span>
                  )}
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-full text-lg font-bold ${
                      selected ? "bg-brand text-white" : "bg-brand/10 text-brand"
                    }`}
                  >
                    {b.photoSlots}
                  </span>
                  <span className="mt-2 text-sm font-bold text-stone-800">{formatEGP(b.price)}</span>
                  <span className="text-xs text-stone-500">
                    {b.photoSlots === 1 ? "single" : `${perPiece(b.price, b.photoSlots)} EGP each`}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Step 2 — photos */}
      <section aria-labelledby={photosHeadingId} className="mt-8">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 id={photosHeadingId} className="step-title">
            <span className="step-num">{bundles.length > 1 ? 2 : 1}</span> Add your photos
          </h2>
          <p className={`text-sm font-semibold ${overBy > 0 ? "text-red-600" : count === slots ? "text-green-700" : "text-stone-600"}`} aria-live="polite">
            {count} / {slots} photos
          </p>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-stone-200" aria-hidden>
          <div
            className={`h-full rounded-full transition-all ${overBy > 0 ? "bg-red-500" : "bg-brand"}`}
            style={{ width: `${Math.min(100, (count / slots) * 100)}%` }}
          />
        </div>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
          }}
          className={`mt-4 rounded-2xl border-2 border-dashed p-4 transition ${
            dragging ? "border-brand bg-brand/10" : "border-brand/30 bg-white"
          }`}
        >
          {entries.length === 0 ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full flex-col items-center gap-2 rounded-xl py-8 text-center focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/30"
            >
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="text-brand" aria-hidden>
                <rect x="3" y="5" width="18" height="14" rx="3" />
                <circle cx="9" cy="10" r="1.8" />
                <path d="m21 16-5-5-8 8" />
              </svg>
              <span className="text-base font-semibold text-brand">
                Choose {slots === 1 ? "your photo" : `${slots} photos`} from your phone
              </span>
              <span className="text-sm text-stone-500">You can select them all at once · JPG, PNG or HEIC</span>
            </button>
          ) : (
            <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4" aria-label="Your photos">
              {entries.map((entry, i) => {
                const before = entries.slice(0, i).reduce((sum, e) => sum + copiesOf(e.id), 0);
                const n = copiesOf(entry.id);
                const extra = before + n > slots;
                return (
                  <li key={entry.id} className="relative">
                    <div
                      className={`relative overflow-hidden rounded-xl border-2 bg-stone-100 ${
                        extra ? "border-red-400 opacity-60" : entry.status === "error" ? "border-red-500" : "border-white shadow"
                      } ${line?.key === "FLAT" ? "p-1.5 pb-4" : ""}`}
                      style={{ aspectRatio: aspect }}
                    >
                      <img
                        src={entry.preview}
                        alt={`Photo ${i + 1}`}
                        className={`h-full w-full object-cover ${line?.key === "FLAT" ? "rounded-sm" : "rounded-lg"}`}
                      />
                      {entry.status === "uploading" && (
                        <span className="absolute inset-0 flex items-center justify-center bg-white/60">
                          <span className="h-7 w-7 animate-spin rounded-full border-4 border-brand/20 border-t-brand" aria-hidden />
                          <span className="sr-only">Uploading photo {i + 1}</span>
                        </span>
                      )}
                      {entry.status === "error" && (
                        <button
                          type="button"
                          onClick={() => retry(entry.id)}
                          className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-red-600/80 p-1 text-center text-[11px] font-semibold text-white"
                          title={entry.error}
                        >
                          <span aria-hidden>↻</span> Retry
                          <span className="sr-only">: {entry.error}</span>
                        </button>
                      )}
                      {entry.status === "done" && (
                        <span className="absolute bottom-1 left-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-600 text-[11px] text-white" aria-hidden>
                          ✓
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(entry.id)}
                      className="absolute -right-1.5 -top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-stone-900 text-xs text-white shadow hover:bg-red-600"
                      aria-label={`Remove photo ${i + 1}`}
                    >
                      ✕
                    </button>
                    {slots > 1 && (
                      <div className="mt-1 flex items-center justify-center rounded-full border border-stone-200 bg-white" role="group" aria-label={`Copies of photo ${i + 1}`}>
                        <button
                          type="button"
                          onClick={() => setCopiesFor(entry.id, n - 1)}
                          disabled={n <= 1}
                          className="flex h-8 w-8 items-center justify-center text-lg font-bold text-brand disabled:text-stone-300"
                          aria-label={`Fewer copies of photo ${i + 1}`}
                        >
                          −
                        </button>
                        <span className="min-w-[2.25rem] text-center text-xs font-bold text-stone-700" aria-live="polite">
                          ×{n}
                        </span>
                        <button
                          type="button"
                          onClick={() => setCopiesFor(entry.id, n + 1)}
                          disabled={count >= maxSlots}
                          className="flex h-8 w-8 items-center justify-center text-lg font-bold text-brand disabled:text-stone-300"
                          aria-label={`More copies of photo ${i + 1}`}
                        >
                          +
                        </button>
                      </div>
                    )}
                  </li>
                );
              })}
              {count < maxSlots && (
                <li>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex h-full min-h-[90px] w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-brand/40 text-brand hover:bg-brand/5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/30"
                    style={{ aspectRatio: aspect }}
                  >
                    <span className="text-2xl leading-none" aria-hidden>+</span>
                    <span className="text-xs font-semibold">Add more</span>
                  </button>
                </li>
              )}
            </ul>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.heic,.heif"
            multiple
            className="sr-only"
            tabIndex={-1}
            aria-hidden
            onChange={(e) => {
              if (e.target.files?.length) handleFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </div>

        {notice && <p className="mt-2 text-sm text-stone-600">{notice}</p>}

        {entries.length > 0 && slots > 1 && count < slots && (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-brand/5 p-3 text-sm text-stone-700">
            <span>
              Want the same photo more than once? Tap <strong>+</strong> under it.
            </span>
            {entries.length === 1 && (
              <button
                type="button"
                onClick={() => setCopiesFor(entries[0].id, slots)}
                className="rounded-full bg-brand px-4 py-1.5 font-semibold text-white"
              >
                Use this photo for all {slots}
              </button>
            )}
          </div>
        )}

        {overBy > 0 && (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-900" role="status">
            <span>
              You added {count} photos but this bundle holds {slots}.
              {fitsBundle ? "" : ` Remove ${overBy} to continue.`}
            </span>
            {fitsBundle && (
              <button type="button" onClick={() => chooseBundle(fitsBundle)} className="rounded-full bg-brand px-4 py-1.5 font-semibold text-white">
                Switch to {fitsBundle.photoSlots} photos · {formatEGP(fitsBundle.price)}
              </button>
            )}
          </div>
        )}

        {line && (
          <p className="mt-3 text-xs text-stone-500">
            Tip: we print each photo as a {line.size}, centred. Faces in the middle of the photo come out best.
            {line.note && <span className="mt-1 block font-semibold text-brand">{line.note}</span>}
          </p>
        )}

        <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-stone-200 bg-white p-3 text-sm">
          <input
            type="checkbox"
            checked={photosLater}
            onChange={(e) => setPhotosLater(e.target.checked)}
            className="mt-0.5 h-5 w-5 shrink-0 accent-brand"
          />
          <span>
            <span className="font-semibold text-stone-800">I&apos;ll send my photos on WhatsApp</span>
            <span className="block text-stone-500">
              Order now and send the rest of your photos with your order number after checkout.
            </span>
          </span>
        </label>
      </section>

      {includesCard && (
        <section className="mt-8 space-y-3">
          <h2 className="step-title">Card details</h2>
          <div>
            <label htmlFor="bundle-names" className="mb-1 block text-sm font-medium text-stone-700">Names</label>
            <input id="bundle-names" className="input-field" placeholder="e.g. Kirolos & Mariam" value={names} onChange={(e) => setNames(e.target.value)} />
          </div>
          <div>
            <label htmlFor="bundle-date" className="mb-1 block text-sm font-medium text-stone-700">Event date</label>
            <input id="bundle-date" className="input-field" placeholder="e.g. 20.06.2026" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
          </div>
        </section>
      )}

      {/* Summary + actions. Sticky on phones so the price and button are always in reach. */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-200 bg-white/95 p-3 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] backdrop-blur sm:static sm:mt-8 sm:rounded-2xl sm:border sm:p-5 sm:shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center gap-3 sm:block">
          <div className="min-w-0 flex-1 sm:flex sm:items-end sm:justify-between">
            <div>
              <p className="truncate text-xs font-medium text-stone-500 sm:text-sm">{bundle.name}</p>
              <p className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-brand sm:text-3xl">{formatEGP(bundle.price)}</span>
                {saving > 0 && <span className="text-xs text-stone-400 line-through sm:text-sm">{formatEGP(bundle.compareAtPrice!)}</span>}
              </p>
            </div>
            {saving > 0 && (
              <span className="hidden rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800 sm:inline-block">
                You save {formatEGP(saving)}
              </span>
            )}
          </div>
          <div className="flex shrink-0 gap-2 sm:mt-4">
            <button
              type="button"
              onClick={() => handleAdd(false)}
              className={`btn-outline hidden sm:inline-flex ${!canAdd ? "opacity-60" : ""}`}
            >
              Add to cart
            </button>
            <button
              type="button"
              onClick={() => handleAdd(true)}
              className={`btn-primary px-5 sm:flex-1 ${!canAdd ? "opacity-70" : ""}`}
            >
              {uploadingCount > 0 ? `Uploading ${uploadingCount}…` : "Order now"}
            </button>
          </div>
        </div>
        <p role="alert" aria-live="assertive" className="mx-auto max-w-5xl text-sm text-red-600 empty:hidden sm:mt-3">
          {error}
        </p>
        <button type="button" onClick={() => handleAdd(false)} className="mx-auto mt-1 block text-xs font-semibold text-brand underline sm:hidden">
          or add to cart &amp; keep shopping
        </button>
      </div>

      {added && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-green-50 p-4 text-sm text-green-800" role="status">
          <span className="font-semibold">✓ Added to your cart!</span>
          <span className="flex gap-2">
            <Link href="/cart" className="rounded-full border border-green-700 px-4 py-1.5 font-semibold">View cart</Link>
            <Link href="/checkout" className="rounded-full bg-green-700 px-4 py-1.5 font-semibold text-white">Checkout</Link>
          </span>
        </div>
      )}
    </div>
  );
}
