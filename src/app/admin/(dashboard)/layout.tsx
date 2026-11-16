import Link from "next/link";
import { logout } from "../actions";
import { db } from "@/lib/db";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/card-requests", label: "Card requests" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/packages", label: "Packages" },
  { href: "/admin/offers", label: "Offers" },
  { href: "/admin/coupons", label: "Coupons" },
  { href: "/admin/settings", label: "Settings" },
];

async function getBadges(): Promise<Record<string, number>> {
  try {
    const [orders, cards] = await Promise.all([
      db.order.findMany({
        where: { status: { not: "CANCELLED" } },
        select: { status: true, paidAt: true, paymentProofUrl: true },
      }),
      db.cardRequest.count({ where: { status: "NEW" } }),
    ]);
    // New orders, plus payment screenshots waiting to be checked.
    const ordersBadge = orders.filter((o) => o.status === "PENDING" || (!o.paidAt && o.paymentProofUrl)).length;
    return { "/admin/orders": ordersBadge, "/admin/card-requests": cards };
  } catch {
    return {};
  }
}

function Badge({ n }: { n?: number }) {
  if (!n) return null;
  return (
    <span className="ml-auto inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand px-1.5 text-xs font-bold text-white">
      {n}
    </span>
  );
}

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const badges = await getBadges();
  return (
    <div className="flex min-h-screen bg-brand-cream">
      <aside className="hidden w-56 shrink-0 flex-col border-r border-stone-200 bg-white p-4 sm:flex">
        <div className="mb-6 flex items-center gap-2 px-2">
          <img src="/logo.png" alt="Magnetiq" className="h-10 w-10" />
          <span className="text-sm font-semibold text-stone-500">Admin</span>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center rounded-lg px-3 py-2 text-sm font-medium text-stone-600 hover:bg-brand/10 hover:text-brand"
            >
              {item.label}
              <Badge n={badges[item.href]} />
            </Link>
          ))}
        </nav>
        <form action={logout}>
          <button type="submit" className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-stone-500 hover:bg-red-50 hover:text-red-600">
            Log out
          </button>
        </form>
      </aside>

      <div className="flex-1">
        <div className="flex items-center justify-between border-b border-stone-200 bg-white px-4 py-3 sm:hidden">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Magnetiq" className="h-9 w-9" />
            <span className="text-sm font-semibold text-stone-500">Admin</span>
          </div>
          <form action={logout}>
            <button type="submit" className="text-sm font-medium text-stone-500">Log out</button>
          </form>
        </div>
        {/* The sidebar is hidden on phones, so give them a scrollable tab bar instead. */}
        <nav aria-label="Admin" className="flex gap-1 overflow-x-auto border-b border-stone-200 bg-white px-2 py-2 sm:hidden">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium text-stone-600 hover:bg-brand/10 hover:text-brand"
            >
              {item.label}
              <Badge n={badges[item.href]} />
            </Link>
          ))}
        </nav>
        <main className="p-4 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
