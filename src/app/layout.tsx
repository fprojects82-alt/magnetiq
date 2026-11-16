import type { Metadata, Viewport } from "next";
import { Poppins, Great_Vibes, Playfair_Display } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { SiteChrome } from "@/components/SiteChrome";
import { getSettings } from "@/lib/settings";
import { getCustomerSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { ensureCatalog } from "@/lib/catalogSync";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
});

const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-script",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["700", "800"],
  style: ["italic", "normal"],
  variable: "--font-display",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;

export const metadata: Metadata = {
  ...(SITE_URL ? { metadataBase: new URL(SITE_URL) } : {}),
  title: {
    default: "Magnetiq: Custom Photo Magnets in Egypt | Moments That Stick",
    template: "%s | Magnetiq",
  },
  description:
    "Turn your photos into fridge magnets and 3D stickers. Pressed 5×5 cm magnets, flat 7×10 cm magnets and 3×3 cm 3D stickers, singles or bundles. Upload from your phone, pay cash on delivery, delivered all over Egypt.",
  openGraph: {
    title: "Magnetiq: Moments That Stick",
    description: "Custom photo magnets and 3D stickers. Delivered all over Egypt.",
    images: [{ url: "/media/og-image.jpg", width: 1200, height: 630, alt: "Magnetiq pressed photo magnets" }],
    type: "website",
  },
  icons: { icon: "/logo.png", apple: "/logo.png" },
};

export const viewport: Viewport = {
  themeColor: "#B7202E",
  width: "device-width",
  initialScale: 1,
};

async function loadChromeData() {
  // The header/footer must never take the whole site down if the database is
  // briefly unreachable, so fall back to env defaults instead of throwing.
  await ensureCatalog();
  const [settings, offers, customerSession] = await Promise.all([
    getSettings().catch(() => null),
    db.offer
      .findMany({ where: { active: true }, orderBy: { createdAt: "desc" } })
      .catch(() => [] as { badgeText: string | null; title: string }[]),
    getCustomerSession().catch(() => null),
  ]);
  return {
    whatsappNumber: settings?.whatsappNumber ?? process.env.WHATSAPP_NUMBER ?? "",
    offerItems: offers.map((o) => [o.badgeText, o.title].filter(Boolean).join("  ·  ")),
    customerName: customerSession?.name ?? null,
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { whatsappNumber, offerItems, customerName } = await loadChromeData();

  return (
    <html lang="en">
      <body className={`${poppins.variable} ${greatVibes.variable} ${playfair.variable} font-sans antialiased`}>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-brand focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        <CartProvider>
          <SiteChrome whatsappNumber={whatsappNumber} offerItems={offerItems} customerName={customerName}>
            {children}
          </SiteChrome>
        </CartProvider>
      </body>
    </html>
  );
}
