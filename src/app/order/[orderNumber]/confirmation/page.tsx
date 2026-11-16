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
      <ConfettiBurst />
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl text-green-700" aria-hidden>
        ✓
      </div>
      <h1 className="mt-4 font-display text-4xl font-bold text-stone-800">Thank you, {order.customerName.split(" ")[0]}!</h1>
      <p className="mt-3 text-stone-600">
        Your order <strong className="whitespace-nowrap text-brand">{order.orderNumber}</strong> has been placed. We&apos;ll
        contact you on <strong>{order.phone}</strong> to confirm.
      </p>

      {(anyPhotosLater || order.paymentMethod === "INSTAPAY") && (
        <div className="mt-6 rounded-2xl border-2 border-amber-300 bg-amber-50 p-5 text-left text-sm text-amber-950">
          <p className="font-semibold">One more step:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {anyPhotosLater && <li>Send us the rest of your photos on WhatsApp with your order number.</li>}
            {order.paymentMethod === "INSTAPAY" && (
              <li>
                Transfer <strong>{formatEGP(order.total)}</strong> via InstaPay to{" "}
                <strong className="text-brand">{settings.instapayNumber}</strong> and send the receipt screenshot.
              </li>
            )}
          </ul>
        </div>
      )}

      <div className="mt-6 flex flex-col items-center gap-3">
        <a href={whatsappLink} target="_blank" rel="noreferrer" className="btn-primary w-full bg-[#1f9e4f] text-base hover:bg-[#178a42] sm:w-auto">
          <WhatsAppIcon className="h-5 w-5" /> Send order on WhatsApp
        </a>
        <Link href="/" className="text-sm font-semibold text-brand hover:underline">
          Back to shop
        </Link>
      </div>

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
          <div className="flex justify-between text-stone-600"><dt>Delivery</dt><dd>{formatEGP(order.deliveryFee)}</dd></div>
          <div className="flex justify-between border-t border-stone-100 pt-2 text-base font-bold text-stone-800">
            <dt>Total</dt><dd>{formatEGP(order.total)}</dd>
          </div>
        </dl>
        <p className="mt-3 text-sm text-stone-500">
          {PAYMENT_METHOD_LABELS[order.paymentMethod as PaymentMethod] ?? order.paymentMethod} · {order.address}, {order.city}
        </p>
      </div>
    </div>
  );
}
