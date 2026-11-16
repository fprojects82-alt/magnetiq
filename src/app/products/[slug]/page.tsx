import { redirect } from "next/navigation";

// Event cards moved to a request form; single magnets moved to the shop pages.
export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  if (params.slug.includes("card")) redirect("/event-cards");
  redirect("/packages");
}
