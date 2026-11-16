import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPrintLineByAnchor, PRINT_LINES, PRINT_LINE_KEYS, shopHref } from "@/lib/catalog";
import { getLineBundles } from "@/lib/bundles";
import { BackButton } from "@/components/BackButton";
import { BundleBuilder, BundleOption } from "@/components/BundleBuilder";
import { ProductGallery } from "@/components/ProductGallery";

export const dynamic = "force-dynamic";

export function generateMetadata({ params }: { params: { line: string } }): Metadata {
  const line = getPrintLineByAnchor(params.line);
  if (!line) return {};
  return { title: `Custom ${line.name}`, description: `${line.tagline} ${line.size}. Order one or save with a bundle.` };
}

export default async function ShopLinePage({
  params,
  searchParams,
}: {
  params: { line: string };
  searchParams: { size?: string };
}) {
  const line = getPrintLineByAnchor(params.line);
  if (!line) notFound();

  const bundles = await getLineBundles(line.key);
  const options: BundleOption[] = bundles.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description,
    price: p.price,
    compareAtPrice: p.compareAtPrice,
    badge: p.badge,
    composition: p.composition,
    photoSlots: p.photoSlots,
    sampleImageUrl: p.sampleImageUrl,
  }));

  const size = Number(searchParams.size);
  const initial =
    options.find((o) => o.photoSlots === size) ??
    options.find((o) => o.badge === "Most popular") ??
    options[0];
  const others = PRINT_LINE_KEYS.filter((k) => k !== line.key).map((k) => PRINT_LINES[k]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-10">
      <BackButton />
      <div className="grid gap-8 lg:grid-cols-[1fr_1.15fr] lg:gap-12">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <ProductGallery images={line.gallery} />
          <dl className="mt-4 hidden grid-cols-2 gap-3 text-sm lg:grid">
            <div className="rounded-2xl bg-white p-3 shadow-sm">
              <dt className="text-stone-500">Size</dt>
              <dd className="font-semibold text-stone-800">{line.size}</dd>
            </div>
            <div className="rounded-2xl bg-white p-3 shadow-sm">
              <dt className="text-stone-500">Made of</dt>
              <dd className="font-semibold text-stone-800">{line.layers}</dd>
            </div>
            <div className="col-span-2 rounded-2xl bg-white p-3 shadow-sm">
              <dd className="text-stone-700">{line.layersDetail}</dd>
              <dd className="mt-1 text-stone-500" lang="ar" dir="rtl">{line.layersAr}</dd>
            </div>
          </dl>
        </div>

        <div>
          <h1 className="font-display text-4xl font-bold italic text-brand sm:text-5xl">{line.name}</h1>
          <p className="mt-2 text-stone-700">
            <strong>{line.size}</strong> · {line.layers}
          </p>
          <p className="mt-1 text-stone-600">{line.tagline}</p>
          {line.note && <p className="mt-1 text-sm font-semibold text-brand">{line.note}</p>}
          <ul className="mt-3 flex flex-wrap gap-2 text-xs font-medium text-stone-700">
            <li className="rounded-full bg-white px-3 py-1.5 shadow-sm">🚚 Delivery all over Egypt</li>
            <li className="rounded-full bg-white px-3 py-1.5 shadow-sm">💵 Cash on delivery</li>
            <li className="rounded-full bg-white px-3 py-1.5 shadow-sm">📱 Upload from your phone</li>
          </ul>

          <div className="mt-8">
            {initial ? (
              <BundleBuilder bundles={options} initialSlug={initial.slug} lineKey={line.key} />
            ) : (
              <p className="rounded-2xl bg-white p-6 text-stone-600 shadow-sm">
                {line.name} are being restocked. Message us on WhatsApp to order.
              </p>
            )}
          </div>

          <p className="mt-8 text-sm text-stone-600">
            Also try:{" "}
            {others.map((o, i) => (
              <span key={o.key}>
                {i > 0 && " · "}
                <Link href={shopHref(o)} className="font-semibold text-brand underline">
                  {o.name}
                </Link>
              </span>
            ))}
          </p>
        </div>
      </div>
    </div>
  );
}
