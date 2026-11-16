import { db } from "./db";
import { DEFAULT_WHATSAPP } from "./catalogData";

export async function getSettings() {
  const settings = await db.settings.findUnique({ where: { id: "singleton" } });
  if (settings) return settings;
  return db.settings.create({
    data: {
      id: "singleton",
      whatsappNumber: process.env.WHATSAPP_NUMBER || DEFAULT_WHATSAPP,
      instapayNumber: process.env.INSTAPAY_NUMBER || "01000000000",
      deliveryFee: Number(process.env.DELIVERY_FEE || 50),
    },
  });
}
