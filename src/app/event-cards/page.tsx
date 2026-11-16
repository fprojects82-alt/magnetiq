import type { Metadata } from "next";
import { BackButton } from "@/components/BackButton";
import { CardRequestForm } from "@/components/CardRequestForm";
import { getServerDict } from "@/lib/i18n-server";

// Render per request so the shared header (offers, account) is always current.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Event Cards with Photo Magnets",
  description:
    "Engagement, wedding, save the date and proposal cards, with a photo magnet or 3D sticker on each one. Send your design and get a quote on WhatsApp.",
};

export default function EventCardsPage() {
  const { t } = getServerDict();
  const c = t.cards;
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <BackButton />
      <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-12">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <p className="font-script text-2xl text-brand">Moments That Stick</p>
          <h1 className="font-display text-4xl font-bold italic text-brand sm:text-5xl">{c.title}</h1>
          <p className="mt-3 text-stone-600">{c.intro}</p>
          <video
            src="/media/engagement-cards.mp4"
            poster="/media/engagement-cards.webp"
            autoPlay
            muted
            loop
            playsInline
            className="mx-auto mt-6 aspect-[9/16] max-h-[300px] rounded-3xl bg-stone-200 object-cover shadow-xl lg:mx-0 lg:max-h-[460px]"
            aria-label={c.videoAria}
          />
          <ol className="mt-6 space-y-3 text-sm text-stone-700">
            {c.how.map((line, i) => (
              <li key={i} className="flex gap-3">
                <span className="step-num shrink-0">{i + 1}</span> {line}
              </li>
            ))}
          </ol>
        </div>

        <div>
          <CardRequestForm />
        </div>
      </div>
    </div>
  );
}
