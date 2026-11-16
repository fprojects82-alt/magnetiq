import Link from "next/link";
import { SOCIAL_LINKS } from "@/lib/catalog";
import { getDict, Lang } from "@/lib/i18n";
import { WhatsAppIcon } from "./WhatsAppButton";

export function InstagramIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function TikTokIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 0 1-2.59 2.5 2.6 2.6 0 0 1-2.6-2.6 2.6 2.6 0 0 1 3.37-2.48V9.66a5.7 5.7 0 0 0-.77-.05 5.69 5.69 0 0 0-5.69 5.69A5.69 5.69 0 0 0 9.86 21a5.69 5.69 0 0 0 5.68-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3a4.3 4.3 0 0 1-3.24-1.48" />
    </svg>
  );
}

export function FacebookIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M13.5 21v-7.5h2.5l.4-3h-2.9V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2.3H8v3h2.5V21h3z" />
    </svg>
  );
}

export function Footer({ whatsappNumber, lang = "en" }: { whatsappNumber: string; lang?: Lang }) {
  const t = getDict(lang).footer;
  return (
    <footer className="mt-12 bg-brand-dark text-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-3">
        <div>
          <img src="/logo-white.png" alt="Magnetiq — Moments That Stick" className="h-16 w-auto" />
          <p className="mt-1 text-sm text-white/80">
            {t.about}
          </p>
        </div>
        <div>
          <h2 className="mb-3 font-semibold">{t.shop}</h2>
          <ul className="space-y-1 text-sm text-white/85 [&_a]:inline-block [&_a]:py-1.5">
            <li><Link href="/shop/pressed" className="hover:underline">{t.pressed}</Link></li>
            <li><Link href="/shop/flat" className="hover:underline">{t.flat}</Link></li>
            <li><Link href="/shop/stickers" className="hover:underline">{t.stickers}</Link></li>
            <li><Link href="/shop/bookmarks" className="hover:underline">{t.bookmarks}</Link></li>
            <li><Link href="/event-cards" className="hover:underline">{t.cards}</Link></li>
            <li><Link href="/cart" className="hover:underline">{t.cart}</Link></li>
            <li><Link href="/track" className="hover:underline">{t.track}</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="mb-3 font-semibold">{t.talk}</h2>
          <ul className="space-y-1 text-sm [&_a]:py-1.5">
            {whatsappNumber && (
              <li>
                <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:underline">
                  <WhatsAppIcon className="h-5 w-5" /> WhatsApp
                </a>
              </li>
            )}
            <li>
              <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:underline">
                <InstagramIcon /> Instagram {SOCIAL_LINKS.handle}
              </a>
            </li>
            <li>
              <a href={SOCIAL_LINKS.facebook} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:underline">
                <FacebookIcon /> Facebook
              </a>
            </li>
            <li>
              <a href={SOCIAL_LINKS.tiktok} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:underline">
                <TikTokIcon /> TikTok {SOCIAL_LINKS.handle}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/15 py-4 text-center text-xs text-white/60">
        © {new Date().getFullYear()} Magnetiq. {t.rights}
      </div>
    </footer>
  );
}
