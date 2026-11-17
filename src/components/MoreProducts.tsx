"use client";

import Link from "next/link";
import { PRINT_LINES, PRINT_LINE_KEYS, PrintLineKey, lineText, shopHref } from "@/lib/catalog";
import { useLang } from "@/context/LangContext";

/** Tiles linking to the other products, so shoppers can keep filling one cart. */
export function MoreProducts({ exclude, onPick }: { exclude?: PrintLineKey | null; onPick?: () => void }) {
  const { lang, t } = useLang();
  const tiles = [
    ...PRINT_LINE_KEYS.filter((k) => k !== exclude).map((k) => {
      const line = PRINT_LINES[k];
      return { href: shopHref(line), src: line.cover, label: lineText(line, lang).name };
    }),
    { href: "/event-cards", src: "/media/engagement-cards.webp", label: t.nav.cards },
  ];

  return (
    <ul className={`grid grid-cols-2 gap-2 ${tiles.length === 5 ? "sm:grid-cols-5" : "sm:grid-cols-4"}`}>
      {tiles.map((tile) => (
        <li key={tile.href}>
          <Link
            href={tile.href}
            onClick={onPick}
            className="group block overflow-hidden rounded-xl border border-stone-200 bg-white transition hover:border-brand focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/30"
          >
            <span className="block aspect-[4/3] overflow-hidden bg-stone-100">
              <img src={tile.src} alt="" className="h-full w-full object-cover transition group-hover:scale-105" loading="lazy" />
            </span>
            <span className="block px-2 py-2 text-center text-sm font-semibold text-stone-800 group-hover:text-brand">{tile.label}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
