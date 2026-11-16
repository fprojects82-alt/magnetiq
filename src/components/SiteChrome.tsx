"use client";

import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { OfferTicker } from "./OfferTicker";
import { WhatsAppButton } from "./WhatsAppButton";
import { useLang } from "@/context/LangContext";

export function SiteChrome({
  whatsappNumber,
  offerItems,
  customerName,
  children,
}: {
  whatsappNumber: string;
  offerItems: string[];
  customerName: string | null;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const { lang, t } = useLang();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) return <>{children}</>;

  // Pages with their own sticky order bar on phones: lift the WhatsApp bubble above it.
  const hasStickyBar = /^\/shop\/[^/]+$/.test(pathname ?? "");

  return (
    <>
      <div className="sticky top-0 z-50">
        <OfferTicker items={offerItems} />
        <Header customerName={customerName} />
      </div>
      <main id="main" className="min-h-screen">
        {children}
      </main>
      <Footer whatsappNumber={whatsappNumber} lang={lang} />
      {whatsappNumber && pathname !== "/checkout" && <WhatsAppButton number={whatsappNumber} raised={hasStickyBar} greeting={t.footer.waGreeting} label={t.footer.waAria} />}
    </>
  );
}
