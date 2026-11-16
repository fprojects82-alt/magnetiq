import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getPrintLine, PRINT_LINES, PRINT_LINE_KEYS } from "@/lib/catalog";
import { getLineBundles } from "@/lib/bundles";
import { BackButton } from "@/components/BackButton";
import { BundleBuilder, BundleOption } from "@/components/BundleBuilder";
import { ProductGallery } from "@/components/ProductGallery";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const pkg = await db.package.findUnique({ where: { slug: params.slug } }).catch(() => null);
  if (!pkg) return {};
  return { title: pkg.name, description: pkg.description };
}

function toOption(p: {
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
}): BundleOption {
  return {
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
  };
}

export default async function PackageDetailPage({ params }: { params: { slug: string } }) {
  const pkg = await db.package.findUnique({ where: { slug: params.slug } });
  if (!pkg || !pkg.active) notFound();

  const line = getPrintLine(pkg.line);
  const siblings = line ? await getLineBundles(line.key) : [pkg];
  const options = (siblings.length ? siblings : [pkg]).map(toOption);
  const others = line ? PRINT_LINE_KEYS.filter((k) => k !== line.key).map((k) => PRINT_LINES[k]) : [];

  const images = line ? line.gallery : [{ src: pkg.sampleImageUrl, alt: pkg.name }];

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-10">
      <BackButton />
      <div className="grid gap-8 lg:grid-cols-[1fr_1.15fr] lg:gap-12">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <ProductGallery images={images} />
          {line && (
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
          )}
        </div>

        <div>
          {line && <p className="font-display text-lg font-bold italic text-brand">{line.name}</p>}
          <h1 className="text-3xl font-bold text-stone-800 sm:text-4xl">
            {line ? `Custom ${line.name}` : pkg.name}
          </h1>
          <p className="mt-2 text-stone-600">{line ? line.tagline : pkg.description}</p>
          {line && (
            <p className="mt-1 text-sm text-stone-500 lg:hidden">
              {line.size} · {line.layers} ({line.layersDetail})
            </p>
          )}
          {line?.note && <p className="mt-1 text-sm font-semibold text-brand">{line.note}</p>}
          <ul className="mt-3 flex flex-wrap gap-2 text-xs font-medium text-stone-700">
            <li className="rounded-full bg-white px-3 py-1.5 shadow-sm">🚚 Delivery all over Egypt</li>
            <li className="rounded-full bg-white px-3 py-1.5 shadow-sm">💵 Cash on delivery</li>
            <li className="rounded-full bg-white px-3 py-1.5 shadow-sm">📱 Upload from your phone</li>
          </ul>

          <div className="mt-8">
            <BundleBuilder bundles={options} initialSlug={pkg.slug} lineKey={line?.key ?? null} />
          </div>

          {others.length > 0 && (
            <p className="mt-8 text-sm text-stone-600">
              Also try:{" "}
              {others.map((o, i) => (
                <span key={o.key}>
                  {i > 0 && " · "}
                  <Link href={`/packages#${o.anchor}`} className="font-semibold text-brand underline">
                    {o.name} ({o.size})
                  </Link>
                </span>
              ))}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
