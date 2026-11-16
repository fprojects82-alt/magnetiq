import Link from "next/link";
import { formatEGP } from "@/lib/currency";
import { itemLabel, perPiece, PrintLine } from "@/lib/catalog";

interface Row {
  slug: string;
  photoSlots: number;
  price: number;
  compareAtPrice: number | null;
  badge: string | null;
}

/** Flyer-style price list: number badge, bundle name, price — each row opens the order page. */
export function PriceList({ line, bundles }: { line: PrintLine; bundles: Row[] }) {
  return (
    <ul className="space-y-3">
      {bundles.map((b) => {
        const save = b.compareAtPrice && b.compareAtPrice > b.price ? b.compareAtPrice - b.price : 0;
        return (
          <li key={b.slug}>
            <Link
              href={`/packages/${b.slug}`}
              className="group flex items-center gap-4 rounded-full border-2 border-brand/30 bg-white py-2 pl-2 pr-5 transition hover:border-brand hover:shadow-md"
            >
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand text-lg font-bold text-white">
                {b.photoSlots}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-lg font-bold italic text-stone-800">
                  {itemLabel(line, b.photoSlots)}
                  {b.badge && !b.badge.startsWith("Save") && (
                    <span className="ml-2 whitespace-nowrap rounded-full bg-brand/10 px-2 py-0.5 align-middle font-sans text-[11px] font-bold not-italic uppercase tracking-wide text-brand">
                      {b.badge}
                    </span>
                  )}
                </span>
                <span className="text-brand">
                  <span className="text-lg font-semibold">{formatEGP(b.price)}</span>{" "}
                  <span className="text-sm text-stone-500">
                    {b.photoSlots === 1
                      ? "(single piece)"
                      : `(${perPiece(b.price, b.photoSlots)} for each${save ? ` · save ${save}` : ""})`}
                  </span>
                </span>
              </span>
              <span aria-hidden className="text-xl text-brand transition group-hover:translate-x-1">→</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
