import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCustomerSession } from "@/lib/auth";
import { getServerDict } from "@/lib/i18n-server";
import { money } from "@/lib/i18n";
import { CUSTOMER_STATUS_STEPS } from "@/lib/types";
import { logoutCustomer } from "./actions";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const { lang, t } = getServerDict();
  const a = t.account;
  const statusLabel = (s: string) => {
    if (s === "CANCELLED") return lang === "ar" ? "ملغي" : "Cancelled";
    const i = CUSTOMER_STATUS_STEPS.findIndex((x) => x.status === s);
    return i >= 0 ? t.status.steps[i] : s;
  };
  const session = await getCustomerSession();
  if (!session) redirect("/login");

  const customer = await db.customer.findUnique({ where: { id: session.customerId } });
  if (!customer) redirect("/login");

  const orders = await db.order.findMany({
    where: { customerId: customer.id },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold text-stone-800">{a.hi(customer.name.split(" ")[0])}</h1>
        <form action={logoutCustomer}>
          <button type="submit" className="text-sm font-medium text-stone-500 hover:text-red-600">
            {a.logout}
          </button>
        </form>
      </div>

      <div className="card-surface mt-6 p-6">
        <h2 className="font-semibold text-stone-800">{a.details}</h2>
        <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
          <div><dt className="text-stone-500">{a.name}</dt><dd>{customer.name}</dd></div>
          <div><dt className="text-stone-500">{a.email}</dt><dd>{customer.email}</dd></div>
          <div><dt className="text-stone-500">{a.phone}</dt><dd dir="ltr" className="text-start">{customer.phone}</dd></div>
          {customer.address && (
            <div><dt className="text-stone-500">{a.savedAddress}</dt><dd>{customer.address}{customer.city ? `, ${customer.city}` : ""}</dd></div>
          )}
        </dl>
        <p className="mt-3 text-xs text-stone-400">
          {a.autofill}
        </p>
      </div>

      <h2 className="mt-10 text-xl font-bold text-stone-800">{a.orders}</h2>
      {orders.length === 0 ? (
        <div className="card-surface mt-4 p-8 text-center">
          <p className="text-stone-500">{a.noOrders}</p>
          <Link href="/products" className="btn-primary mt-4 inline-flex">{a.startShopping}</Link>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/order/${order.orderNumber}/confirmation`}
              className="card-surface flex flex-wrap items-center justify-between gap-3 p-4 transition hover:shadow-md"
            >
              <div>
                <p className="font-semibold text-stone-800">{order.orderNumber}</p>
                <p className="text-sm text-stone-500">
                  {order.createdAt.toLocaleDateString(lang === "ar" ? "ar-EG" : "en-GB")} · {a.items(order.items.length)}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    order.status === "DELIVERED"
                      ? "bg-green-100 text-green-700"
                      : order.status === "CANCELLED"
                        ? "bg-stone-100 text-stone-500"
                        : "bg-brand/10 text-brand"
                  }`}
                >
                  {statusLabel(order.status)}
                </span>
                <span className="font-semibold text-brand">{money(order.total, lang)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
