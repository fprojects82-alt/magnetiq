import Link from "next/link";
import { db } from "@/lib/db";
import { formatEGP } from "@/lib/currency";
import { ORDER_STATUS_LABELS, OrderStatus } from "@/lib/types";
import { AutoRefresh } from "@/components/admin/AutoRefresh";

export const dynamic = "force-dynamic";

function PaidBadge({ paidAt, proof }: { paidAt: Date | null; proof: string | null }) {
  if (paidAt) return <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">Paid</span>;
  if (proof) return <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">Screenshot</span>;
  return <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">Not paid</span>;
}

export default async function AdminDashboardPage() {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startOfMonth = new Date(startOfToday);
  startOfMonth.setDate(1);

  const [orders, newCardRequests] = await Promise.all([
    db.order.findMany({
      where: { status: { not: "CANCELLED" } },
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        total: true,
        status: true,
        paidAt: true,
        paymentProofUrl: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    db.cardRequest.count({ where: { status: "NEW" } }),
  ]);

  const paid = orders.filter((o) => o.paidAt);
  const sum = (list: typeof orders) => list.reduce((s, o) => s + o.total, 0);
  const income = {
    total: sum(paid),
    month: sum(paid.filter((o) => o.paidAt! >= startOfMonth)),
    today: sum(paid.filter((o) => o.paidAt! >= startOfToday)),
    awaiting: sum(orders.filter((o) => !o.paidAt)),
  };
  const toCheck = orders.filter((o) => !o.paidAt && o.paymentProofUrl);
  const newOrders = orders.filter((o) => o.status === "PENDING");
  const ordersToday = orders.filter((o) => o.createdAt >= startOfToday).length;

  const stats = [
    { label: "Income (paid, all time)", value: formatEGP(income.total), tone: "text-green-700" },
    { label: "Income this month", value: formatEGP(income.month), tone: "text-green-700" },
    { label: "Income today", value: formatEGP(income.today), tone: "text-green-700" },
    { label: "Waiting for payment", value: formatEGP(income.awaiting), tone: "text-amber-700" },
    { label: "Orders today", value: ordersToday, tone: "text-brand" },
    { label: "Paid orders", value: `${paid.length} / ${orders.length}`, tone: "text-brand" },
  ];

  return (
    <div>
      <AutoRefresh seconds={60} />
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h1 className="text-2xl font-bold text-stone-800">Dashboard</h1>
        <p className="text-xs text-stone-400">Updates automatically every minute</p>
      </div>

      {(toCheck.length > 0 || newOrders.length > 0 || newCardRequests > 0) && (
        <section className="mt-6 space-y-2" aria-label="Needs your attention">
          {toCheck.length > 0 && (
            <Link href="/admin/orders?payment=check" className="flex items-center justify-between rounded-2xl bg-blue-600 p-4 text-white shadow">
              <span>
                <strong>🔔 {toCheck.length} payment screenshot{toCheck.length > 1 ? "s" : ""} to check</strong>
                <span className="block text-sm text-white/85">Open each order and tap &quot;Mark as paid&quot; once you see the money.</span>
              </span>
              <span aria-hidden>→</span>
            </Link>
          )}
          {newOrders.length > 0 && (
            <Link href="/admin/orders?status=PENDING" className="flex items-center justify-between rounded-2xl bg-brand p-4 text-white shadow">
              <strong>🛒 {newOrders.length} new order{newOrders.length > 1 ? "s" : ""}</strong>
              <span aria-hidden>→</span>
            </Link>
          )}
          {newCardRequests > 0 && (
            <Link href="/admin/card-requests" className="flex items-center justify-between rounded-2xl bg-stone-800 p-4 text-white shadow">
              <strong>💌 {newCardRequests} new event card request{newCardRequests > 1 ? "s" : ""}</strong>
              <span aria-hidden>→</span>
            </Link>
          )}
        </section>
      )}

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="card-surface p-4 sm:p-6">
            <p className="text-xs text-stone-500 sm:text-sm">{s.label}</p>
            <p className={`mt-1 text-xl font-bold sm:text-2xl ${s.tone}`}>{s.value}</p>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-stone-400">Income counts orders you marked as paid. Cancelled orders are excluded.</p>

      <div className="card-surface mt-8 p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-stone-800">Latest orders</h2>
          <Link href="/admin/orders" className="text-sm font-semibold text-brand hover:underline">View all →</Link>
        </div>
        <ul className="mt-3 divide-y divide-stone-100">
          {orders.slice(0, 10).map((o) => (
            <li key={o.id}>
              <Link href={`/admin/orders/${o.id}`} className="flex flex-wrap items-center justify-between gap-2 py-3 hover:bg-stone-50">
                <span>
                  <span className="font-semibold text-brand">{o.orderNumber}</span>
                  <span className="ml-2 text-sm text-stone-600">{o.customerName}</span>
                  <span className="block text-xs text-stone-400">{o.createdAt.toLocaleString()}</span>
                </span>
                <span className="flex items-center gap-2 text-sm">
                  <PaidBadge paidAt={o.paidAt} proof={o.paymentProofUrl} />
                  <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs font-semibold text-stone-600">
                    {ORDER_STATUS_LABELS[o.status as OrderStatus] ?? o.status}
                  </span>
                  <span className="font-semibold">{formatEGP(o.total)}</span>
                </span>
              </Link>
            </li>
          ))}
          {orders.length === 0 && <li className="py-6 text-center text-stone-400">No orders yet.</li>}
        </ul>
      </div>
    </div>
  );
}
