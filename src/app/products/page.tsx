import { redirect } from "next/navigation";

// Magnets are now sold as bundles; the only single products are event cards.
export default function ProductsPage({ searchParams }: { searchParams: { type?: string } }) {
  if (searchParams.type === "MAGNET_SMALL") redirect("/packages#pressed");
  if (searchParams.type === "MAGNET_LARGE") redirect("/packages#flat");
  if (searchParams.type === "EVENT_CARD") redirect("/event-cards");
  redirect("/packages");
}
