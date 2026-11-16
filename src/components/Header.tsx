"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { useCart } from "@/context/CartContext";
import { useLang } from "@/context/LangContext";
import { LangSwitch } from "./LangSwitch";

function CartIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M6 6h15l-1.5 9h-12z" />
      <path d="M6 6 5 3H2" />
      <circle cx="9" cy="20" r="1.5" />
      <circle cx="18" cy="20" r="1.5" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
    </svg>
  );
}

export function Header({ customerName }: { customerName: string | null }) {
  const { itemCount, isHydrated } = useCart();
  const { t } = useLang();
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  // Close the mobile menu whenever the route changes.
  useEffect(() => setMenuOpen(false), [pathname]);

  if (pathname?.startsWith("/admin")) return null;

  const NAV_LINKS = [
    { href: "/shop/pressed", label: t.nav.pressed },
    { href: "/shop/flat", label: t.nav.flat },
    { href: "/shop/stickers", label: t.nav.stickers },
    { href: "/shop/bookmarks", label: t.nav.bookmarks },
    { href: "/event-cards", label: t.nav.cards },
    { href: "/track", label: t.nav.track },
  ];
  const accountHref = customerName ? "/account" : "/login";
  const accountLabel = customerName ? t.nav.hi(customerName.split(" ")[0]) : t.nav.login;

  return (
    <header className="border-b border-stone-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2">
        <Logo />

        {/* Desktop: one "Shop" menu for the four products keeps the bar calm. */}
        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          <div className="group relative">
            <Link
              href="/packages"
              className="flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium text-stone-700 hover:bg-brand/5 hover:text-brand"
              aria-haspopup="true"
            >
              {t.nav.shop}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
                <path d="m6 9 6 6 6-6" />
              </svg>
            </Link>
            <div className="invisible absolute start-0 top-full z-50 pt-2 opacity-0 transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
              <ul className="w-56 rounded-2xl border border-stone-200 bg-white p-2 shadow-lg">
                {NAV_LINKS.slice(0, 4).map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="block whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium text-stone-700 hover:bg-brand/5 hover:text-brand">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          {NAV_LINKS.slice(4).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium text-stone-700 hover:bg-brand/5 hover:text-brand"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <LangSwitch />
          <Link href="/packages" className="btn-primary hidden min-h-[40px] whitespace-nowrap px-5 py-2 text-sm sm:inline-flex">
            {t.common.orderNow}
          </Link>
          <Link
            href={accountHref}
            className="flex h-11 items-center gap-2 rounded-full border border-stone-200 px-3 text-sm font-medium hover:border-brand hover:text-brand"
          >
            <UserIcon />
            <span className="hidden whitespace-nowrap xl:inline">{accountLabel}</span>
            <span className="sr-only xl:hidden">{customerName ? t.nav.myAccount : t.nav.login}</span>
          </Link>
          <Link
            href="/cart"
            className="relative flex h-11 items-center gap-2 rounded-full border border-stone-200 px-3 text-sm font-medium hover:border-brand hover:text-brand"
            aria-label={isHydrated && itemCount > 0 ? t.nav.cartItems(itemCount) : t.nav.cart}
          >
            <CartIcon />
            <span className="hidden whitespace-nowrap xl:inline">{t.nav.cart}</span>
            {isHydrated && itemCount > 0 && (
              <span className="absolute -end-1.5 -top-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand px-1 text-xs font-bold text-white" aria-hidden>
                {itemCount}
              </span>
            )}
          </Link>
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-stone-200 lg:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? t.nav.closeMenu : t.nav.openMenu}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              {menuOpen ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav id="mobile-menu" aria-label="Mobile" className="flex flex-col gap-1 border-t border-stone-200 bg-white px-4 py-3 lg:hidden">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-xl px-3 py-3 text-base font-medium text-stone-700 hover:bg-brand/10 hover:text-brand"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link href="/packages" className="btn-primary mt-2" onClick={() => setMenuOpen(false)}>
            {t.common.orderNow}
          </Link>
          <Link
            href={accountHref}
            className="rounded-xl px-3 py-3 text-base font-medium text-brand hover:bg-brand/10"
            onClick={() => setMenuOpen(false)}
          >
            {customerName ? `${t.nav.myAccount} (${customerName.split(" ")[0]})` : t.nav.loginSignup}
          </Link>
        </nav>
      )}
    </header>
  );
}
