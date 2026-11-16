import type { Metadata } from "next";
import { db } from "@/lib/db";
import { BackButton } from "@/components/BackButton";
import { ProductCard } from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Event Cards with Photo Magnets",
  description: "Engagement, save the date, proposal and wedding cards with your photo as a magnet guests take home.",
};

export default async function EventCardsPage() {
  const cards = await db.product.findMany({
    where: { active: true, type: "EVENT_CARD" },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <BackButton />
      <div className="grid items-center gap-8 md:grid-cols-[1.3fr_0.7fr]">
        <div>
          <p className="font-script text-2xl text-brand">Moments That Stick</p>
          <h1 className="text-3xl font-bold text-stone-800 sm:text-4xl">Event cards with a photo magnet</h1>
          <p className="mt-3 max-w-2xl text-stone-600">
            Printed cards for your engagement, save the date, proposal or wedding, each holding your photo as a pressed magnet.
            Your guests keep the magnet on their fridge long after the big day. Upload your photo and add your names and date.
          </p>
        </div>
        <video
          src="/media/engagement-cards.mp4"
          poster="/media/engagement-cards.webp"
          autoPlay
          muted
          loop
          playsInline
          className="mx-auto aspect-[9/16] max-h-[360px] rounded-3xl object-cover shadow-xl"
          aria-label="A stack of finished engagement cards, each with a photo magnet"
        />
      </div>
      {cards.length === 0 ? (
        <p className="mt-10 text-stone-500">Event cards are coming back soon. Message us on WhatsApp to order.</p>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {cards.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      )}
    </div>
  );
}
