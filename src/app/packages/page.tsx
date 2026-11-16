import type { Metadata } from "next";
import Link from "next/link";
import { PRINT_LINES, PRINT_LINE_KEYS, shopHref } from "@/lib/catalog";
import { getLineBundles } from "@/lib/bundles";
import { BackButton } from "@/components/BackButton";
import { PriceList } from "@/components/PriceList";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Photo Magnets & 3D Stickers: Prices",
  description: "Pressed 5×5 cm magnets, flat 7×10 cm magnets and 3×3 cm 3D stickers. Order one or save with a bundle, then upload your photos.",
};

export default async function PackagesPage() {
  const lines = await Promise.all(
    PRINT_LINE_KEYS.map(async (key) => ({ line: PRINT_LINES[key], bundles: await getLineBundles(key) }))
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <BackButton />
      <p className="font-script text-2xl text-brand">Moments That Stick</p>
      <h1 className="text-3xl font-bold text-stone-800 sm:text-4xl">Choose your magnets &amp; stickers</h1>
      <p className="mt-2 max-w-2xl text-stone-600">
        Order a single piece or save with a bundle. The bigger the bundle, the less each photo costs. Tap a size to upload your photos.
      </p>

      {/* quick jump */}
      <div className="mt-6 grid grid-cols-1 gap-3 sm:max-w-3xl sm:grid-cols-3">
        {lines.map(({ line, bundles }) => (
          <a key={line.key} href={shopHref(line)} className="card-surface flex items-center gap-3 p-3 transition hover:border-brand">
            <img src={line.cover} alt="" className="h-14 w-14 rounded-xl object-cover" />
            <span>
              <span className="block font-semibold text-stone-800">{line.name}</span>
              {bundles.length > 0 && (
                <span className="text-xs text-stone-500">
                  from {Math.min(...bundles.map((b) => Math.round(b.price / b.photoSlots)))} EGP each
                </span>
              )}
            </span>
          </a>
        ))}
      </div>

      {lines.map(({ line, bundles }) => (
        <section key={line.key} id={line.anchor} className="mt-14 scroll-mt-28" aria-labelledby={`${line.anchor}-title`}>
          <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
            <div>
              <h2 id={`${line.anchor}-title`} className="section-title">
                {line.name}
              </h2>
              <p className="mt-2 text-stone-700">
                <strong>Size:</strong> {line.size} · <span lang="ar" dir="rtl">{line.sizeAr}</span>
              </p>
              <p className="mt-1 text-stone-600">{line.tagline}</p>
              {line.note && <p className="mt-1 font-semibold text-brand">{line.note}</p>}

              <div className="mt-4 grid grid-cols-3 gap-2">
                {line.gallery.map((img, i) => (
                  <img
                    key={img.src}
                    src={img.src}
                    alt={img.alt}
                    loading="lazy"
                    className={`w-full rounded-2xl object-cover shadow-md ${i === 0 ? "col-span-3 aspect-[4/3]" : "aspect-square"}`}
                  />
                ))}
              </div>

              <div className="mt-4 rounded-2xl border border-brand/20 bg-white p-4 text-sm">
                <p className="font-semibold text-stone-800">
                  {line.layers}: <span className="font-normal text-stone-600">{line.layersDetail}</span>
                </p>
                <p className="mt-1 text-stone-600" lang="ar" dir="rtl">{line.layersAr}</p>
                <a href={line.priceSheet} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs font-semibold text-brand underline">
                  View the {line.name.toLowerCase()} price sheet
                </a>
              </div>
            </div>

            <div>
              {bundles.length === 0 ? (
                <p className="text-stone-500">Coming back soon. Message us on WhatsApp to order.</p>
              ) : (
                <>
                  <PriceList line={line} bundles={bundles} />
                  <Link href={shopHref(line)} className="btn-primary mt-4 w-full">
                    Order {line.name}
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>
      ))}

      <div className="mt-14 rounded-3xl bg-brand p-6 text-center text-white sm:p-10">
        <p className="font-display text-2xl font-bold italic">Planning an engagement or wedding?</p>
        <p className="mt-2 text-white/85">We print event cards and can add a photo magnet or 3D sticker on each one.</p>
        <Link href="/event-cards" className="mt-4 inline-flex min-h-[48px] items-center rounded-full bg-white px-6 font-semibold text-brand">
          Request event cards
        </Link>
      </div>
    </div>
  );
}
