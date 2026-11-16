import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { buildWhatsAppOrderLink } from "@/lib/whatsapp";
import { EventCardText } from "@/lib/types";
import { getServerDict } from "@/lib/i18n-server";
import { money } from "@/lib/i18n";
import { bundleLabel } from "@/lib/catalog";
import { getZone, zoneEta, zoneName } from "@/lib/shipping";
import { ConfettiBurst } from "@/components/ConfettiBurst";
import { WhatsAppIcon } from "@/components/WhatsAppButton";
import { CopyButton, PaymentFlow } from "@/components/PaymentProof";
import { OrderStatusTracker } from "@/components/OrderStatusTracker";
import { ReviewForm } from "@/components/ReviewForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your order",
  robots: { index: false, follow: false },
};

function parseJSON<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export default async function OrderConfirmationPage({ params }: { params: { orderNumber: string } }) {
  const order = await db.order.findUnique({
    where: { orderNumber: decodeURIComponent(params.orderNumber) },
    include: { items: true },
  });
  if (!order) notFound();

  const { lang, t } = getServerDict();
  const p = t.pay;
  const fmt = (n: number) => money(n, lang);

  const [settings, review] = await Promise.all([
    getSettings(),
    db.review.findUnique({ where: { orderNumber: order.orderNumber }, select: { id: true } }).catch(() => null),
  ]);
  const items = order.items.map((i) => {
    const photos = parseJSON<string[]>(i.uploadedImageUrls, []);
    const custom = parseJSON<EventCardText | null>(i.customText, null);
    return { ...i, photos, photosLater: Boolean(custom?.photosLater) };
  });
  const anyPhotosLater = items.some((i) => i.photosLater);
  const zone = getZone(order.deliveryZone);
  const isInstapay = order.paymentMethod === "INSTAPAY";
  const fresh = order.status === "PENDING" && !order.paidAt && !order.paymentProofUrl;

  // Item names in the visitor's language, from each package's slug.
  const packageIds = items.map((i) => i.packageId).filter((id): id is string => Boolean(id));
  const packages = packageIds.length
    ? await db.package.findMany({ where: { id: { in: packageIds } }, select: { id: true, slug: true } }).catch(() => [])
    : [];
  const slugById = new Map(packages.map((pk) => [pk.id, pk.slug]));
  const itemName = (i: (typeof items)[number]) => {
    const slug = i.packageId ? slugById.get(i.packageId) : undefined;
    return slug ? bundleLabel(slug, i.name, lang) : i.name;
  };

  const whatsappLink = buildWhatsAppOrderLink(
    {
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      phone: order.phone,
      address: order.address,
      city: order.city,
      subtotal: order.subtotal,
      discount: order.discount,
      deliveryFee: order.deliveryFee,
      total: order.total,
      paymentMethod: order.paymentMethod,
      items: items.map((i) => ({
        name: i.name,
        size: i.size,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        photoCount: i.photos.length,
        photosLater: i.photosLater,
      })),
    },
    settings.whatsappNumber
  );
  const helpHref = `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(
    lang === "ar"
      ? `أهلاً Magnetiq، محتاج مساعدة في طلبي رقم ${order.orderNumber}`
      : `Hi Magnetiq, I need help with my order ${order.orderNumber}`
  )}`;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 text-center sm:py-12">
      {fresh && <ConfettiBurst />}
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl text-green-700" aria-hidden>
        ✓
      </div>
      <h1 className="mt-3 font-display text-3xl font-bold text-stone-800 sm:text-4xl">{p.thanks(order.customerName.split(" ")[0])}</h1>

      {/* Order number — save it to track the order */}
      <div className="mt-5 rounded-2xl border-2 border-dashed border-brand/40 bg-white p-4">
        <p className="text-sm font-semibold text-stone-600">{p.orderNumberIs}</p>
        <p className="mt-1 flex items-center justify-center gap-2">
          <strong className="font-mono text-2xl tracking-wider text-brand sm:text-3xl" dir="ltr">
            {order.orderNumber}
          </strong>
          <CopyButton text={order.orderNumber} />
        </p>
        <p className="mt-2 text-sm text-stone-600">💾 {p.saveIt}</p>
        <Link href="/track" className="mt-1 inline-block text-xs font-semibold text-brand underline">
          {p.trackLink}
        </Link>
      </div>

      {isInstapay && !order.paidAt ? (
        <PaymentFlow
          orderNumber={order.orderNumber}
          total={order.total}
          instapayNumber={settings.instapayNumber}
          initialProofUrl={order.paymentProofUrl}
          helpHref={helpHref}
        />
      ) : (
        <p className="mt-6 text-sm text-stone-600">
          {p.questions}{" "}
          <a href={helpHref} target="_blank" rel="noreferrer" className="font-semibold text-brand underline">
            {p.messageUs}
          </a>
        </p>
      )}

      {anyPhotosLater && (
        <div className="mt-4 rounded-2xl bg-amber-50 p-4 text-start">
          <p className="mb-2 font-semibold text-amber-900">{p.photosTitle}</p>
          <a href={whatsappLink} target="_blank" rel="noreferrer" className="btn-primary w-full bg-[#1f9e4f] hover:bg-[#178a42]">
            <WhatsAppIcon className="h-5 w-5" /> {p.photosBtn(order.orderNumber)}
          </a>
        </div>
      )}

      <div className="mt-6">
        <OrderStatusTracker status={order.status} paid={Boolean(order.paidAt)} t={t} />
      </div>

      {order.paidAt && (
        <div className="mt-6">
          {review ? (
            <div className="rounded-2xl bg-white p-4 text-sm text-stone-600 shadow-sm">{t.reviews.already}</div>
          ) : (
            <ReviewForm orderNumber={order.orderNumber} defaultName={order.customerName.split(" ")[0]} />
          )}
        </div>
      )}

      <div className="card-surface mt-6 p-5 text-start">
        <h2 className="font-semibold text-stone-800">{p.summary}</h2>
        <ul className="mt-3 divide-y divide-stone-100">
          {items.map((item) => (
            <li key={item.id} className="py-3 text-sm">
              <div className="flex justify-between gap-2">
                <span className="text-stone-700">
                  {itemName(item)}
                  {item.quantity > 1 && ` × ${item.quantity}`}
                </span>
                <span className="shrink-0 font-medium">{fmt(item.unitPrice * item.quantity)}</span>
              </div>
              {item.photos.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {item.photos.slice(0, 12).map((url, idx) => (
                    <img key={idx} src={url} alt="" className="h-10 w-10 rounded-md object-cover" />
                  ))}
                  {item.photos.length > 12 && <span className="flex h-10 items-center px-1 text-xs text-stone-500">+{item.photos.length - 12}</span>}
                </div>
              )}
            </li>
          ))}
        </ul>
        <dl className="mt-3 space-y-1 border-t border-stone-100 pt-3 text-sm">
          <div className="flex justify-between text-stone-600">
            <dt>{p.subtotal}</dt>
            <dd>{fmt(order.subtotal)}</dd>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-green-700">
              <dt>{p.discount}</dt>
              <dd>-{fmt(order.discount)}</dd>
            </div>
          )}
          <div className="flex justify-between gap-2 text-stone-600">
            <dt>
              {p.delivery}
              {zone ? ` · ${zoneName(zone, lang)}` : ""}
            </dt>
            <dd className="shrink-0">{fmt(order.deliveryFee)}</dd>
          </div>
          <div className="flex justify-between border-t border-stone-100 pt-2 text-base font-bold text-stone-800">
            <dt>{p.total}</dt>
            <dd>{fmt(order.total)}</dd>
          </div>
        </dl>
        <p className="mt-3 text-sm text-stone-500">
          {isInstapay ? p.instapay : order.paymentMethod} · {order.address}, {order.city}
          {zone && <span className="block">{p.arrives(zoneEta(zone, lang))}</span>}
        </p>
      </div>

      <Link href="/" className="mt-6 inline-block text-sm font-semibold text-brand hover:underline">
        {p.backShop}
      </Link>
    </div>
  );
}
