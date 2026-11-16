import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPrintLineByAnchor, lineText, PRINT_LINES, PRINT_LINE_KEYS, shopHref } from "@/lib/catalog";
import { getServerDict } from "@/lib/i18n-server";
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
  const { lang, t } = getServerDict();
  const lt = lineText(line, lang);

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

  const heading = (
    <>
      <h1 className="font-display text-3xl font-bold italic text-brand sm:text-5xl">{lt.name}</h1>
      <p className="mt-1 text-stone-700 sm:mt-2">
        <strong>{lt.size}</strong> · {lt.layers}
      </p>
      <p className="mt-1 text-sm text-stone-600 sm:text-base">{lt.tagline}</p>
      {lt.note && <p className="mt-1 text-sm font-semibold text-brand">{lt.note}</p>}
    </>
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-4 sm:py-10">
      <BackButton />
      {/* On phones the name and price come first; the photos follow, smaller. */}
      <div className="mb-4 lg:hidden">{heading}</div>
      <div className="grid gap-5 lg:grid-cols-[1fr_1.15fr] lg:gap-12">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <ProductGallery images={line.gallery} />
          <dl className="mt-4 hidden grid-cols-2 gap-3 text-sm lg:grid">
            <div className="rounded-2xl bg-white p-3 shadow-sm">
              <dt className="text-stone-500">{t.shop.size}</dt>
              <dd className="font-semibold text-stone-800">{lt.size}</dd>
            </div>
            <div className="rounded-2xl bg-white p-3 shadow-sm">
              <dt className="text-stone-500">{t.shop.madeOf}</dt>
              <dd className="font-semibold text-stone-800">{lt.layers}</dd>
            </div>
            <div className="col-span-2 rounded-2xl bg-white p-3 shadow-sm">
              <dd className="text-stone-700">{lt.layersDetail}</dd>
              {lang === "en" && <dd className="mt-1 text-stone-500" lang="ar" dir="rtl">{line.layersAr}</dd>}
            </div>
          </dl>
        </div>

        <div>
          <div className="hidden lg:block">{heading}</div>
          <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 text-xs font-medium text-stone-700 lg:mx-0 lg:mt-3 lg:flex-wrap lg:px-0">
            {t.shop.perks.map((p) => (
              <li key={p} className="shrink-0 rounded-full bg-white px-3 py-1.5 shadow-sm">{p}</li>
            ))}
          </ul>

          <div className="mt-6 lg:mt-8">
            {initial ? (
              <BundleBuilder bundles={options} initialSlug={initial.slug} lineKey={line.key} />
            ) : (
              <p className="rounded-2xl bg-white p-6 text-stone-600 shadow-sm">
                {t.shop.restock(lt.name)}
              </p>
            )}
          </div>

          <p className="mt-8 text-sm text-stone-600">
            {t.shop.alsoTry}{" "}
            {others.map((o, i) => (
              <span key={o.key}>
                {i > 0 && " · "}
                <Link href={shopHref(o)} className="font-semibold text-brand underline">
                  {lineText(o, lang).name}
                </Link>
              </span>
            ))}
          </p>
        </div>
      </div>
    </div>
  );
}
