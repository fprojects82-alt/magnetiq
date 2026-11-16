import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { buildWhatsAppOrderLink } from "@/lib/whatsapp";
import { formatEGP } from "@/lib/currency";
import { EventCardText, PAYMENT_METHOD_LABELS, PaymentMethod } from "@/lib/types";
import { ConfettiBurst } from "@/components/ConfettiBurst";
import { WhatsAppIcon } from "@/components/WhatsAppButton";
import { CopyButton, PaymentProofUploader } from "@/components/PaymentProof";
import { getZone } from "@/lib/shipping";
import { OrderStatusTracker } from "@/components/OrderStatusTracker";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Order placed",
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

  const settings = await getSettings();
  const items = order.items.map((i) => {
    const photos = parseJSON<string[]>(i.uploadedImageUrls, []);
    const custom = parseJSON<EventCardText | null>(i.customText, null);
    return { ...i, photos, photosLater: Boolean(custom?.photosLater) };
  });
  const anyPhotosLater = items.some((i) => i.photosLater);
  const zone = getZone(order.deliveryZone);
  const isInstapay = order.paymentMethod === "INSTAPAY";

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

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 text-center">
      {order.status === "PENDING" && !order.paidAt && <ConfettiBurst />}
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl text-green-700" aria-hidden>
        ✓
      </div>
      <h1 className="mt-4 font-display text-3xl font-bold text-stone-800 sm:text-4xl">Thank you, {order.customerName.split(" ")[0]}!</h1>
      <p className="mt-2 text-stone-600">Your order number is</p>
      <p className="mt-1 flex items-center justify-center gap-2">
        <strong className="rounded-xl bg-white px-4 py-2 font-mono text-2xl tracking-wider text-brand shadow-sm">{order.orderNumber}</strong>
        <CopyButton text={order.orderNumber} />
      </p>

      <div className="mt-6">
        <OrderStatusTracker status={order.status} paid={Boolean(order.paidAt)} />
      </div>

      {isInstapay && !order.paidAt ? (
        <section className="mt-6 rounded-2xl border-2 border-brand bg-white p-5 text-left shadow-sm" aria-labelledby="pay-now">
          <h2 id="pay-now" className="step-title">
            <span className="step-num">!</span> Pay now by InstaPay
          </h2>
          <ol className="mt-3 space-y-4 text-sm text-stone-700">
            <li>
              <p className="font-semibold text-stone-800">1. Transfer {formatEGP(order.total)} to:</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <code className="rounded-lg bg-brand-cream px-3 py-2 text-base font-semibold text-brand">
                  {settings.instapayNumber || "Ask us on WhatsApp"}
                </code>
                {settings.instapayNumber && <CopyButton text={settings.instapayNumber} label="Copy number" />}
              </div>
            </li>
            <li>
              <p className="mb-2 font-semibold text-stone-800">2. Upload the transfer screenshot:</p>
              <PaymentProofUploader orderNumber={order.orderNumber} initialUrl={order.paymentProofUrl} />
            </li>
            <li>
              <p className="mb-2 font-semibold text-stone-800">
                3. Send your order on WhatsApp{anyPhotosLater ? " with the rest of your photos" : ""}:
              </p>
              <a href={whatsappLink} target="_blank" rel="noreferrer" className="btn-primary w-full bg-[#1f9e4f] hover:bg-[#178a42]">
                <WhatsAppIcon className="h-5 w-5" /> Send order {order.orderNumber} on WhatsApp
              </a>
            </li>
          </ol>
          <p className="mt-4 text-xs text-stone-500">We start printing as soon as your payment is confirmed.</p>
        </section>
      ) : (
        <div className="mt-6 flex flex-col items-center gap-3">
          <a href={whatsappLink} target="_blank" rel="noreferrer" className="btn-primary bg-[#1f9e4f] hover:bg-[#178a42]">
            <WhatsAppIcon className="h-5 w-5" /> Message us about this order
          </a>
        </div>
      )}
      <p className="mt-4 text-xs text-stone-500">
        Save this page or your order number. You can check your order status anytime at{" "}
        <Link href="/track" className="font-semibold text-brand underline">Track order</Link>.
      </p>

      <Link href="/" className="mt-6 inline-block text-sm font-semibold text-brand hover:underline">
        Back to shop
      </Link>

      <div className="card-surface mt-8 p-5 text-left">
        <h2 className="font-semibold text-stone-800">Order summary</h2>
        <ul className="mt-3 divide-y divide-stone-100">
          {items.map((item) => (
            <li key={item.id} className="py-3 text-sm">
              <div className="flex justify-between gap-2">
                <span className="text-stone-700">
                  {item.name}
                  {item.quantity > 1 && ` × ${item.quantity}`}
                </span>
                <span className="font-medium">{formatEGP(item.unitPrice * item.quantity)}</span>
              </div>
              {item.photos.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {item.photos.slice(0, 12).map((url, idx) => (
                    <img key={idx} src={url} alt="" className="h-10 w-10 rounded-md object-cover" />
                  ))}
                  {item.photos.length > 12 && (
                    <span className="flex h-10 items-center px-1 text-xs text-stone-500">+{item.photos.length - 12}</span>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
        <dl className="mt-3 space-y-1 border-t border-stone-100 pt-3 text-sm">
          <div className="flex justify-between text-stone-600"><dt>Subtotal</dt><dd>{formatEGP(order.subtotal)}</dd></div>
          {order.discount > 0 && (
            <div className="flex justify-between text-green-700"><dt>Discount</dt><dd>-{formatEGP(order.discount)}</dd></div>
          )}
          <div className="flex justify-between text-stone-600">
            <dt>Delivery{zone ? ` · ${zone.name}` : ""}</dt>
            <dd className="shrink-0 pl-2">{formatEGP(order.deliveryFee)}</dd>
          </div>
          <div className="flex justify-between border-t border-stone-100 pt-2 text-base font-bold text-stone-800">
            <dt>Total</dt><dd>{formatEGP(order.total)}</dd>
          </div>
        </dl>
        <p className="mt-3 text-sm text-stone-500">
          {PAYMENT_METHOD_LABELS[order.paymentMethod as PaymentMethod] ?? order.paymentMethod} · {order.address}, {order.city}
          {zone && <span className="block">Usually arrives within {zone.eta}</span>}
        </p>
      </div>
    </div>
  );
}
