"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ImageUploader } from "./ImageUploader";
import { QuantityStepper } from "./QuantityStepper";
import { PriceTag } from "./PriceTag";
import { useCart } from "@/context/CartContext";
import { CartItem, EventCardText, ProductType } from "@/lib/types";
import { formatEGP } from "@/lib/currency";

interface ProductCustomizerProps {
  id: string;
  slug: string;
  name: string;
  type: ProductType;
  price: number;
  compareAtPrice?: number | null;
  sampleImageUrl: string;
}

export function ProductCustomizer({ id, slug, name, type, price, compareAtPrice, sampleImageUrl }: ProductCustomizerProps) {
  const { addItem } = useCart();
  const router = useRouter();
  const [image, setImage] = useState<string | null>(null);
  const [photosLater, setPhotosLater] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [names, setNames] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  const isEventCard = type === "EVENT_CARD";

  function handleAdd(goToCheckout: boolean) {
    if (!image && !photosLater) {
      setError("Please add your photo, or tick \"I'll send my photo on WhatsApp\".");
      return;
    }
    if (isEventCard && !names.trim()) {
      setError("Please enter the names to print on the card.");
      return;
    }
    setError(null);

    const customText: EventCardText | undefined =
      isEventCard || (!image && photosLater)
        ? {
            ...(isEventCard ? { names, eventDate, message } : {}),
            ...(!image && photosLater ? { photosLater: true } : {}),
          }
        : undefined;

    const item: CartItem = {
      key: `${slug}-${Date.now()}`,
      kind: "product",
      id,
      slug,
      name,
      quantity,
      unitPrice: price,
      compareAtPrice,
      imageUrl: sampleImageUrl,
      uploadedImageUrls: image ? [image] : [],
      customText,
    };
    addItem(item);
    if (goToCheckout) {
      router.push("/checkout");
      return;
    }
    setAdded(true);
  }

  return (
    <div className="space-y-6">
      <div>
        <PriceTag price={price} compareAtPrice={compareAtPrice} size="lg" />
        <p className="text-sm text-stone-500">Price per {isEventCard ? "card" : "magnet"}</p>
      </div>

      <section>
        <h2 className="step-title"><span className="step-num">1</span> Your photo</h2>
        <div className="mt-3 flex flex-col items-center gap-3 rounded-2xl bg-white p-5 shadow-sm">
          <ImageUploader value={image} onChange={setImage} shape="magnet" />
          <label className="flex cursor-pointer items-center gap-2 text-sm text-stone-700">
            <input type="checkbox" checked={photosLater} onChange={(e) => setPhotosLater(e.target.checked)} className="h-5 w-5 accent-brand" />
            I&apos;ll send my photo on WhatsApp
          </label>
        </div>
      </section>

      {isEventCard && (
        <section className="space-y-3">
          <h2 className="step-title"><span className="step-num">2</span> Card details</h2>
          <div>
            <label htmlFor="card-names" className="mb-1 block text-sm font-medium text-stone-700">Names</label>
            <input id="card-names" className="input-field" placeholder="e.g. Kirolos & Mariam" value={names} onChange={(e) => setNames(e.target.value)} />
          </div>
          <div>
            <label htmlFor="card-date" className="mb-1 block text-sm font-medium text-stone-700">Event date</label>
            <input id="card-date" className="input-field" placeholder="e.g. 20.06.2026" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
          </div>
          <div>
            <label htmlFor="card-message" className="mb-1 block text-sm font-medium text-stone-700">Message (optional)</label>
            <textarea
              id="card-message"
              className="input-field"
              rows={2}
              placeholder="e.g. Celebrating the beautiful story God has written"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
        </section>
      )}

      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-stone-700" id="qty-label">How many {isEventCard ? "cards" : "magnets"}?</span>
        <QuantityStepper value={quantity} onChange={setQuantity} max={500} labelledBy="qty-label" />
      </div>

      <p role="alert" className="text-sm text-red-600 empty:hidden">{error}</p>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={() => handleAdd(true)} className="btn-primary sm:flex-1">
          Order now · {formatEGP(price * quantity)}
        </button>
        <button type="button" onClick={() => handleAdd(false)} className="btn-outline">
          Add to cart
        </button>
      </div>

      {added && (
        <p className="rounded-xl bg-green-50 p-3 text-sm text-green-800" role="status">
          ✓ Added to cart! <Link href="/cart" className="font-semibold underline">View cart</Link> or{" "}
          <Link href="/checkout" className="font-semibold underline">checkout</Link>
        </p>
      )}
    </div>
  );
}
