import Link from "next/link";
import { db } from "@/lib/db";
import { PRINT_LINES, PRINT_LINE_KEYS, SOCIAL_LINKS } from "@/lib/catalog";
import { getLineBundles } from "@/lib/bundles";
import { formatEGP } from "@/lib/currency";
import { getSettings } from "@/lib/settings";
import { OfferBanner } from "@/components/OfferBanner";
import { ProductCard } from "@/components/ProductCard";
import { Parallax, Reveal } from "@/components/ScrollFX";
import { InstagramIcon, TikTokIcon } from "@/components/Footer";
import { WhatsAppIcon } from "@/components/WhatsAppButton";

export const dynamic = "force-dynamic";

const GALLERY = [
  { src: "/media/flat-fridge-wall.webp", alt: "A whole fridge door covered in flat photo magnets of a family", className: "row-span-2" },
  { src: "/media/pressed-couples.webp", alt: "Pressed square magnets of couples on a cutting mat", className: "" },
  { src: "/media/pressed-flatlay.webp", alt: "Pressed magnets arranged around a Magnetiq logo magnet", className: "" },
  { src: "/media/flat-fridge.webp", alt: "Flat photo magnets of family celebrations on a fridge", className: "row-span-2" },
  { src: "/media/pressed-and-flat.webp", alt: "Pressed and flat magnets of a family trip side by side", className: "" },
  { src: "/media/engagement-cards.webp", alt: "A stack of engagement cards each holding a photo magnet", className: "" },
];

const FAQ = [
  {
    q: "What's the difference between pressed and flat magnets?",
    a: "Pressed magnets are 5 × 5 cm rounded squares made of 5 pressed layers (lamination, photo, metal, plastic backing and magnet), so they're thick, glossy and sturdy. Flat prints are 7 × 10 cm polaroid-style rectangles with 2 layers (photo and magnet). They're lighter and cheaper, and great for covering a whole fridge.",
  },
  {
    q: "How do I send my photos?",
    a: "Upload them right on the order page. You can select all of them at once from your phone gallery. If you'd rather, tick \"I'll send my photos on WhatsApp\" and send them to us after you order.",
  },
  {
    q: "How do I pay?",
    a: "Cash on delivery, or InstaPay. With InstaPay, you send the transfer screenshot on WhatsApp after placing your order.",
  },
  {
    q: "Do you deliver outside Cairo?",
    a: "Yes, we deliver all over Egypt. The delivery fee is shown in your cart before you order.",
  },
  {
    q: "Can I mix different photos in one bundle?",
    a: "Of course. Every magnet in a bundle can be a different photo. That's the whole point!",
  },
];

export default async function HomePage() {
  const [offers, lines, cards, settings] = await Promise.all([
    db.offer.findMany({ where: { active: true } }).catch(() => []),
    Promise.all(
      PRINT_LINE_KEYS.map(async (key) => ({
        line: PRINT_LINES[key],
        bundles: await getLineBundles(key).catch(() => []),
      }))
    ),
    db.product
      .findMany({ where: { active: true, type: "EVENT_CARD" }, orderBy: { sortOrder: "asc" }, take: 4 })
      .catch(() => []),
    getSettings().catch(() => null),
  ]);

  const fromEach = (bundles: { price: number; photoSlots: number }[]) =>
    bundles.length ? Math.min(...bundles.map((b) => Math.round(b.price / b.photoSlots))) : null;
  const whatsapp = settings?.whatsappNumber;
  const pressed = lines.find((l) => l.line.key === "PRESSED")?.bundles ?? [];
  const biggestPressed = pressed[pressed.length - 1];

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-12 pt-8 sm:pt-14 lg:grid-cols-2">
          <div>
            <p className="font-script text-3xl text-brand">Moments That Stick</p>
            <h1 className="mt-2 font-display text-4xl font-extrabold leading-tight text-stone-900 sm:text-6xl">
              Your favourite photos,{" "}
              <span className="italic text-brand">on your fridge.</span>
            </h1>
            <p className="mt-4 max-w-lg text-lg text-stone-600">
              Custom photo magnets printed from your phone pictures. Pick a bundle, upload your photos, and we deliver
              anywhere in Egypt. Pay cash on delivery.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              {lines.map(({ line, bundles }, i) => {
                const each = fromEach(bundles);
                const popular = bundles.find((b) => b.photoSlots === 12) ?? bundles[0];
                return (
                  <Link
                    key={line.key}
                    href={popular ? `/packages/${popular.slug}` : `/packages#${line.anchor}`}
                    className={i === 0 ? "btn-primary text-base" : "btn-outline text-base"}
                  >
                    {line.name}
                    {each && <span className="text-sm font-normal opacity-90">· from {each} EGP</span>}
                  </Link>
                );
              })}
            </div>
            <ul className="mt-6 grid max-w-lg grid-cols-2 gap-x-4 gap-y-2 text-sm text-stone-700">
              <li>✓ Delivery all over Egypt</li>
              <li>✓ Cash on delivery or InstaPay</li>
              <li>✓ Upload straight from your phone</li>
              <li>✓ Every magnet a different photo</li>
            </ul>
          </div>

          <div className="relative grid grid-cols-5 gap-3">
            <Parallax speed={0.06} className="col-span-3">
              <img
                src="/media/pressed-flatlay.webp"
                alt="Pressed photo magnets laid out on a board around a Magnetiq logo magnet"
                className="aspect-[3/4] w-full rounded-3xl object-cover shadow-xl"
                fetchPriority="high"
              />
            </Parallax>
            <Parallax speed={0.14} className="col-span-2 mt-10">
              <img
                src="/media/flat-fridge-wall.webp"
                alt="A fridge covered in flat polaroid-style photo magnets"
                className="aspect-[9/16] w-full rounded-3xl object-cover shadow-xl"
                fetchPriority="high"
              />
            </Parallax>
            {biggestPressed && (
              <span className="absolute -bottom-3 left-4 rotate-[-4deg] rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-brand shadow-lg">
                {biggestPressed.photoSlots} pressed photos · {formatEGP(biggestPressed.price)}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* CHOOSE STYLE */}
      <section className="mx-auto max-w-6xl px-4 py-10" aria-labelledby="styles-title">
        <Reveal>
          <h2 id="styles-title" className="section-title text-center">Pick your style</h2>
          <p className="mt-2 text-center text-stone-600">Both come in bundles of 6, 8, 12, 15, 20 and 28 photos.</p>
        </Reveal>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {lines.map(({ line, bundles }, i) => {
            const each = fromEach(bundles);
            const popular = bundles.find((b) => b.photoSlots === 12) ?? bundles[0];
            return (
              <Reveal key={line.key} delay={i * 120}>
                <article className="card-surface group flex h-full flex-col overflow-hidden">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img src={line.cover} alt={line.gallery[0].alt} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                    {each && (
                      <span className="absolute left-4 top-4 rounded-full bg-brand px-4 py-1.5 text-sm font-bold text-white shadow">
                        from {each} EGP each
                      </span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="font-display text-2xl font-bold italic text-brand">{line.name}</h3>
                    <p className="mt-1 text-stone-700">
                      <strong>{line.size}</strong> · {line.layers}
                    </p>
                    <p className="text-sm text-stone-500">{line.layersDetail}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {bundles.map((b) => (
                        <Link
                          key={b.slug}
                          href={`/packages/${b.slug}`}
                          className="rounded-full border border-brand/30 px-3 py-1 text-sm font-medium text-stone-700 hover:border-brand hover:bg-brand hover:text-white"
                        >
                          {b.photoSlots} · {formatEGP(b.price)}
                        </Link>
                      ))}
                    </div>
                    <div className="mt-auto pt-6">
                      <Link href={popular ? `/packages/${popular.slug}` : `/packages#${line.anchor}`} className="btn-primary w-full">
                        Order {line.name.toLowerCase()}
                      </Link>
                    </div>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </section>

      {offers.length > 0 && (
        <section className="mx-auto max-w-6xl space-y-3 px-4 py-4">
          {offers.map((offer, i) => (
            <Reveal key={offer.id} delay={i * 120}>
              <OfferBanner title={offer.title} description={offer.description} badgeText={offer.badgeText} />
            </Reveal>
          ))}
        </section>
      )}

      {/* HOW IT WORKS */}
      <section className="mx-auto max-w-6xl px-4 py-12" aria-labelledby="how-title">
        <Reveal>
          <h2 id="how-title" className="section-title text-center">Order in 3 easy steps</h2>
        </Reveal>
        <ol className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            { title: "Pick a bundle", desc: "Pressed or flat, 6 to 28 photos. Bigger bundles cost less per photo." },
            { title: "Upload your photos", desc: "Select them all at once from your phone, or send them later on WhatsApp." },
            { title: "We print & deliver", desc: "Pay cash when your magnets arrive, anywhere in Egypt." },
          ].map((s, i) => (
            <Reveal key={s.title} delay={i * 120}>
              <li className="card-surface flex h-full gap-4 p-6">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand text-xl font-bold text-white">
                  {i + 1}
                </span>
                <span>
                  <span className="block font-semibold text-stone-800">{s.title}</span>
                  <span className="mt-1 block text-sm text-stone-600">{s.desc}</span>
                </span>
              </li>
            </Reveal>
          ))}
        </ol>
      </section>

      {/* GALLERY */}
      <section id="gallery" className="scroll-mt-24 bg-white py-14" aria-labelledby="gallery-title">
        <div className="mx-auto max-w-6xl px-4">
          <Reveal>
            <h2 id="gallery-title" className="section-title text-center">Real orders, real fridges</h2>
            <p className="mt-2 text-center text-stone-600">A few of the moments we&apos;ve turned into magnets.</p>
          </Reveal>
          <div className="mt-8 grid auto-rows-[160px] grid-cols-2 gap-3 sm:auto-rows-[220px] md:grid-cols-4">
            {GALLERY.map((img) => (
              <img key={img.src} src={img.src} alt={img.alt} loading="lazy" className={`h-full w-full rounded-2xl object-cover ${img.className}`} />
            ))}
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noreferrer" className="btn-outline">
              <InstagramIcon /> More on Instagram
            </a>
            <a href={SOCIAL_LINKS.tiktok} target="_blank" rel="noreferrer" className="btn-outline">
              <TikTokIcon /> Watch on TikTok
            </a>
          </div>
        </div>
      </section>

      {/* EVENT CARDS */}
      {cards.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-14" aria-labelledby="cards-title">
          <div className="grid items-center gap-8 md:grid-cols-[0.8fr_1.2fr]">
            <Reveal>
              <video
                src="/media/engagement-cards.mp4"
                poster="/media/engagement-cards.webp"
                autoPlay
                muted
                loop
                playsInline
                className="mx-auto aspect-[9/16] max-h-[520px] rounded-3xl object-cover shadow-xl"
                aria-label="Engagement cards with photo magnets stacked and ready for delivery"
              />
            </Reveal>
            <div>
              <Reveal>
                <h2 id="cards-title" className="section-title">Event cards with a magnet</h2>
                <p className="mt-2 text-stone-600">
                  Engagement, save the date, proposal and wedding cards, each with your photo as a magnet your guests keep on their fridge.
                </p>
              </Reveal>
              <div className="mt-6 grid grid-cols-2 gap-4">
                {cards.map((product, i) => (
                  <Reveal key={product.id} delay={i * 90}>
                    <ProductCard {...product} />
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 py-12" aria-labelledby="faq-title">
        <h2 id="faq-title" className="section-title text-center">Questions?</h2>
        <div className="mt-6 space-y-3">
          {FAQ.map((item) => (
            <details key={item.q} className="card-surface group p-5 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-stone-800">
                {item.q}
                <span className="text-xl text-brand transition group-open:rotate-45" aria-hidden>+</span>
              </summary>
              <p className="mt-3 text-stone-600">{item.a}</p>
            </details>
          ))}
        </div>
        {whatsapp && (
          <div className="mt-8 text-center">
            <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer" className="btn-primary bg-[#1f9e4f] hover:bg-[#178a42]">
              <WhatsAppIcon className="h-5 w-5" /> Ask us on WhatsApp
            </a>
          </div>
        )}
      </section>
    </div>
  );
}
