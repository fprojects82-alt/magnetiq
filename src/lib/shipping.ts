// Delivery zones and prices (EGP) from the QUIGO Express price list, for
// shipments up to 3 kg, which covers any magnet or sticker order.

export interface ShippingZone {
  id: string;
  name: string;
  nameAr: string;
  price: number;
  eta: string;
  etaAr: string;
}

export const SHIPPING_ZONES: ShippingZone[] = [
  { id: "alex", name: "Alexandria", nameAr: "الإسكندرية", price: 55, eta: "24 hours", etaAr: "٢٤ ساعة" },
  { id: "agami", name: "Agami / West Alexandria", nameAr: "العجمي - غرب", price: 65, eta: "1–2 days", etaAr: "يوم إلى يومين" },
  { id: "amreya", name: "Amreya / Borg El Arab / King Mariout", nameAr: "العامرية - برج العرب - الكنج", price: 75, eta: "1–2 days", etaAr: "يوم إلى يومين" },
  { id: "cairo-giza", name: "Cairo / Giza", nameAr: "القاهرة - الجيزة", price: 90, eta: "2 days", etaAr: "يومين" },
  { id: "new-cities", name: "New cities / Cairo suburbs", nameAr: "المدن الجديدة - الضواحي", price: 95, eta: "3 days", etaAr: "٣ أيام" },
  { id: "north-coast", name: "Marsa Matrouh / El Alamein / Sahel / Desert Road", nameAr: "مرسى مطروح - العلمين - الطريق الصحراوي - الساحل", price: 145, eta: "3 days", etaAr: "٣ أيام" },
  { id: "delta", name: "Delta: Beheira, Kafr El Sheikh, Menoufia, Dakahlia, Gharbia", nameAr: "محافظات الدلتا: البحيرة - كفر الشيخ - المنوفية - الدقهلية - الغربية", price: 100, eta: "3 days", etaAr: "٣ أيام" },
  { id: "canal", name: "Canal cities / Qalyubia / Damietta / Sharqia", nameAr: "مدن القناة - القليوبية - دمياط - الشرقية", price: 100, eta: "3 days", etaAr: "٣ أيام" },
  { id: "upper-egypt", name: "Upper Egypt (all cities) / Giza outskirts", nameAr: "مدن الصعيد بالكامل - ضواحي الجيزة", price: 115, eta: "4 days", etaAr: "٤ أيام" },
  { id: "new-valley", name: "New Valley / Oases / Siwa", nameAr: "الوادي الجديد - الواحات - سيوة", price: 155, eta: "1 week", etaAr: "أسبوع" },
  { id: "red-sea", name: "Red Sea / Hurghada", nameAr: "البحر الأحمر - الغردقة", price: 155, eta: "1 week", etaAr: "أسبوع" },
  { id: "south-sinai", name: "South Sinai / Sharm El Sheikh", nameAr: "جنوب سيناء - شرم الشيخ", price: 155, eta: "1 week", etaAr: "أسبوع" },
];

export function getZone(id: string | null | undefined): ShippingZone | null {
  return SHIPPING_ZONES.find((z) => z.id === id) ?? null;
}

export const MIN_SHIPPING = Math.min(...SHIPPING_ZONES.map((z) => z.price));
export const MAX_SHIPPING = Math.max(...SHIPPING_ZONES.map((z) => z.price));

export function zoneName(z: ShippingZone, lang: "en" | "ar"): string {
  return lang === "ar" ? z.nameAr : z.name;
}

export function zoneEta(z: ShippingZone, lang: "en" | "ar"): string {
  return lang === "ar" ? z.etaAr : z.eta;
}
