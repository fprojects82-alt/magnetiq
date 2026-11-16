"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { isAllowedUploadUrl, normalizePhone } from "@/lib/orders";
import { CARD_TYPES, MAGNET_OPTIONS } from "@/lib/cardRequest";

const schema = z
  .object({
    customerName: z.string().trim().min(2, "Please enter your name.").max(100),
    phone: z.string().trim().min(1, "Please enter your phone number.").max(30),
    cardType: z.enum(CARD_TYPES),
    cardCount: z.coerce.number().int().min(1, "How many cards do you need?").max(5000),
    withMagnets: z.boolean(),
    magnetType: z.enum(MAGNET_OPTIONS.map((m) => m.value) as [string, ...string[]]).optional(),
    magnetCount: z.coerce.number().int().min(1).max(5000).optional(),
    names: z.string().trim().max(200).optional(),
    eventDate: z.string().trim().max(100).optional(),
    notes: z.string().trim().max(2000).optional(),
    demoImageUrls: z.array(z.string().max(500)).max(10),
  })
  .refine((d) => !d.withMagnets || (d.magnetType && d.magnetCount), {
    message: "Choose the magnet type and how many magnets you need.",
  });

export type CardRequestInput = z.input<typeof schema>;

export async function submitCardRequest(
  input: CardRequestInput
): Promise<{ ok: true; whatsappUrl: string } | { ok: false; message: string }> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message || "Please check the form." };
  }
  const d = parsed.data;
  const phone = normalizePhone(d.phone);
  if (!phone) return { ok: false, message: "Please enter a valid phone number, e.g. 01012345678." };
  if (!d.demoImageUrls.every(isAllowedUploadUrl)) {
    return { ok: false, message: "Please re-upload your design images." };
  }
  const magnetLabel = MAGNET_OPTIONS.find((m) => m.value === d.magnetType)?.label;

  try {
    await db.cardRequest.create({
      data: {
        customerName: d.customerName,
        phone,
        cardType: d.cardType,
        cardCount: d.cardCount,
        withMagnets: d.withMagnets,
        magnetType: d.withMagnets ? d.magnetType : null,
        magnetCount: d.withMagnets ? d.magnetCount : null,
        names: d.names || null,
        eventDate: d.eventDate || null,
        notes: d.notes || null,
        demoImageUrls: JSON.stringify(d.demoImageUrls),
      },
    });
    const settings = await getSettings();

    // Locally stored uploads are relative paths; make them clickable from WhatsApp.
    const h = headers();
    const host = h.get("x-forwarded-host") ?? h.get("host");
    const proto = h.get("x-forwarded-proto") ?? "https";
    const origin = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? (host ? `${proto}://${host}` : "");
    const lines = [
      "Hi Magnetiq! I'd like a quote for event cards 💌",
      "",
      `Card type: ${d.cardType}`,
      `Number of cards: ${d.cardCount}`,
      d.withMagnets ? `Magnets: Yes, ${d.magnetCount} x ${magnetLabel}` : "Magnets: No",
      d.names ? `Names: ${d.names}` : null,
      d.eventDate ? `Event date: ${d.eventDate}` : null,
      d.notes ? `Notes: ${d.notes}` : null,
      d.demoImageUrls.length ? "" : null,
      d.demoImageUrls.length ? `Design / demo (${d.demoImageUrls.length}):` : null,
      ...d.demoImageUrls.map((u) => (u.startsWith("/") ? origin + u : u)),
      "",
      `Name: ${d.customerName}`,
      `Phone: ${phone}`,
    ].filter((l): l is string => l !== null);

    return { ok: true, whatsappUrl: `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(lines.join("\n"))}` };
  } catch (err) {
    console.error("submitCardRequest failed", err);
    return { ok: false, message: "We couldn't send your request. Please try again or message us on WhatsApp." };
  }
}
