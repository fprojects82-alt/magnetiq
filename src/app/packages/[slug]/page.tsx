import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getPrintLine, shopHref } from "@/lib/catalog";
import { ensureCatalog } from "@/lib/catalogSync";

export const dynamic = "force-dynamic";

// Old bundle URLs (shared links, ads) forward to the product's order page.
export default async function PackageDetailPage({ params }: { params: { slug: string } }) {
  await ensureCatalog();
  const pkg = await db.package.findUnique({ where: { slug: params.slug } });
  const line = getPrintLine(pkg?.line);
  if (!pkg || !line) notFound();
  redirect(shopHref(line, pkg.photoSlots));
}
