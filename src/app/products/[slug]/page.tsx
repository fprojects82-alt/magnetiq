import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { BackButton } from "@/components/BackButton";
import { ProductCustomizer } from "@/components/ProductCustomizer";
import { ProductType } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await db.product.findUnique({ where: { slug: params.slug } }).catch(() => null);
  if (!product) return {};
  return { title: product.name, description: product.description };
}

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = await db.product.findUnique({ where: { slug: params.slug } });
  if (!product || !product.active) notFound();

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:py-10">
      <BackButton />
      <div className="grid gap-8 md:grid-cols-2">
        <div className="overflow-hidden rounded-3xl bg-white shadow-md">
          <img src={product.sampleImageUrl} alt={product.name} className="aspect-square w-full object-cover" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-stone-800">{product.name}</h1>
          <p className="mt-2 text-stone-600">{product.description}</p>
          <div className="mt-6">
            <ProductCustomizer
              id={product.id}
              slug={product.slug}
              name={product.name}
              type={product.type as ProductType}
              price={product.price}
              compareAtPrice={product.compareAtPrice}
              sampleImageUrl={product.sampleImageUrl}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
