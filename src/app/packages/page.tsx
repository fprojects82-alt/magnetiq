import type { Metadata } from "next";
import Link from "next/link";
import { PRINT_LINES, PRINT_LINE_KEYS, lineText, shopHref } from "@/lib/catalog";
import { getServerDict } from "@/lib/i18n-server";
import { money } from "@/lib/i18n";
import { getLineBundles } from "@/lib/bundles";
import { BackButton } from "@/components/BackButton";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Order Photo Magnets & 3D Stickers",
  description: "Pressed 5×5 cm magnets, flat 7×10 cm magnets and 3×3 cm 3D stickers. Pick one, choose how many, upload your photos.",
};

// A short "what would you like?" chooser. Each card opens that product's own order page.
export default async function PackagesPage() {
  const { lang, t } = getServerDict();
  const c = t.chooser;
  const lines = await Promise.all(
    PRINT_LINE_KEYS.map(async (key) => ({ line: PRINT_LINES[key], bundles: await getLineBundles(key).catch(() => []) }))
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-4 sm:py-10">
      <BackButton />
      <h1 className="font-display text-3xl font-bold italic text-brand sm:text-5xl">{c.title}</h1>
      <p className="mt-1 text-stone-600">{c.sub}</p>

      <ul className="mt-6 grid gap-4 md:grid-cols-2">
        {lines.map(({ line, bundles }) => {
          const single = bundles.find((b) => b.photoSlots === 1);
          return (
            <li key={line.key}>
              <Link
                href={shopHref(line)}
                className="card-surface group flex h-full overflow-hidden transition hover:border-brand hover:shadow-lg md:flex-col"
              >
                <img
                  src={line.cover}
                  alt=""
                  className="w-32 shrink-0 object-cover sm:w-40 md:aspect-[4/3] md:w-full"
                />
                <span className="flex flex-1 flex-col p-4">
                  <span className="font-display text-xl font-bold italic text-brand sm:text-2xl">{lineText(line, lang).name}</span>
                  <span className="text-sm font-semibold text-stone-700">{lineText(line, lang).size}</span>
                  <span className="mt-1 text-sm text-stone-500">
                    {single && <>{t.home.fromPrice(money(single.price, lang))}</>}
                  </span>
                  <span className="mt-auto pt-3 text-sm font-bold text-brand">
                    {c.choose} <span aria-hidden className="inline-block transition group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1">→</span>
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      <Link
        href="/event-cards"
        className="mt-4 flex items-center justify-between gap-4 rounded-2xl bg-brand p-5 text-white transition hover:bg-brand-dark"
      >
        <span>
          <span className="block font-display text-xl font-bold italic">{c.cardsTitle}</span>
          <span className="text-sm text-white/85">{c.cardsSub}</span>
        </span>
        <span aria-hidden className="text-2xl rtl:-scale-x-100">→</span>
      </Link>
    </div>
  );
}
