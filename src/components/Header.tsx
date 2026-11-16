"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { useCart } from "@/context/CartContext";

const NAV_LINKS = [
  { href: "/packages#pressed", label: "Pressed Magnets" },
  { href: "/packages#flat", label: "Flat Magnets" },
  { href: "/packages#stickers", label: "3D Stickers" },
  { href: "/event-cards", label: "Event Cards" },
];

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
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  // Close the mobile menu whenever the route changes.
  useEffect(() => setMenuOpen(false), [pathname]);

  if (pathname?.startsWith("/admin")) return null;

  const accountHref = customerName ? "/account" : "/login";
  const accountLabel = customerName ? `Hi, ${customerName.split(" ")[0]}` : "Login";

  return (
    <header className="border-b border-stone-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2">
        <Logo />

        <nav aria-label="Main" className="hidden items-center gap-6 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm font-medium text-stone-700 transition hover:text-brand">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/packages" className="btn-primary hidden min-h-[40px] px-5 py-2 text-sm sm:inline-flex">
            Order now
          </Link>
          <Link
            href={accountHref}
            className="flex h-11 items-center gap-2 rounded-full border border-stone-200 px-3 text-sm font-medium hover:border-brand hover:text-brand"
          >
            <UserIcon />
            <span className="hidden md:inline">{accountLabel}</span>
            <span className="sr-only md:hidden">{customerName ? "My account" : "Log in"}</span>
          </Link>
          <Link
            href="/cart"
            className="relative flex h-11 items-center gap-2 rounded-full border border-stone-200 px-3 text-sm font-medium hover:border-brand hover:text-brand"
            aria-label={isHydrated && itemCount > 0 ? `Cart, ${itemCount} item${itemCount > 1 ? "s" : ""}` : "Cart"}
          >
            <CartIcon />
            <span className="hidden md:inline">Cart</span>
            {isHydrated && itemCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand px-1 text-xs font-bold text-white" aria-hidden>
                {itemCount}
              </span>
            )}
          </Link>
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-stone-200 lg:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
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
            Order now
          </Link>
          <Link
            href={accountHref}
            className="rounded-xl px-3 py-3 text-base font-medium text-brand hover:bg-brand/10"
            onClick={() => setMenuOpen(false)}
          >
            {customerName ? `My Account (${customerName.split(" ")[0]})` : "Login / Sign up"}
          </Link>
        </nav>
      )}
    </header>
  );
}
