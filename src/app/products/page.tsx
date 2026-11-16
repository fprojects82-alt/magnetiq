import { redirect } from "next/navigation";

// Magnets are now sold as bundles; the only single products are event cards.
export default function ProductsPage({ searchParams }: { searchParams: { type?: string } }) {
  if (searchParams.type === "MAGNET_SMALL") redirect("/shop/pressed");
  if (searchParams.type === "MAGNET_LARGE") redirect("/shop/flat");
  if (searchParams.type === "EVENT_CARD") redirect("/event-cards");
  redirect("/packages");
}
