import Link from "next/link";
import { PRINT_LINES, PRINT_LINE_KEYS, SOCIAL_LINKS, lineText, shopHref } from "@/lib/catalog";
import { getServerDict } from "@/lib/i18n-server";
import { money } from "@/lib/i18n";
import { getLineBundles } from "@/lib/bundles";
import { getSettings } from "@/lib/settings";
import { ReviewsSection } from "@/components/ReviewsSection";
import { Parallax, Reveal } from "@/components/ScrollFX";
import { FacebookIcon, InstagramIcon, TikTokIcon } from "@/components/Footer";
import { WhatsAppIcon } from "@/components/WhatsAppButton";

export const dynamic = "force-dynamic";

const GALLERY = [
  { src: "/media/flat-fridge-wall.webp", alt: "A whole fridge door covered in flat photo magnets of a family", className: "row-span-2" },
  { src: "/media/pressed-couples.webp", alt: "Pressed square magnets of couples on a cutting mat", className: "" },
  { src: "/media/pressed-flatlay.webp", alt: "Pressed magnets arranged around a Magnetiq logo magnet", className: "" },
  { src: "/media/flat-fridge.webp", alt: "Flat photo magnets of family celebrations on a fridge", className: "row-span-2" },
  { src: "/media/pressed-and-flat.webp", alt: "Pressed and flat magnets of a family trip side by side", className: "" },
  { src: "/media/stickers-3d.webp", alt: "Glossy 3D photo stickers scattered on a polka-dot background", className: "" },
];


export default async function HomePage() {
  const { lang, t } = getServerDict();
  const h = t.home;
  const fmt = (n: number) => money(n, lang);
  const [lines, settings] = await Promise.all([
    Promise.all(
      PRINT_LINE_KEYS.map(async (key) => ({
        line: PRINT_LINES[key],
        bundles: await getLineBundles(key).catch(() => []),
      }))
    ),
    getSettings().catch(() => null),
  ]);

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
              {h.h1a}{" "}
              <span className="italic text-brand">{h.h1b}</span>
            </h1>
            <p className="mt-4 max-w-lg text-lg text-stone-600">
              {h.intro}
            </p>
            <div className="mt-6 flex flex-col flex-wrap gap-3 sm:flex-row">
              {lines.map(({ line, bundles }, i) => {
                const popular = bundles.find((b) => b.badge === "Most popular") ?? bundles[0];
                return (
                  <Link
                    key={line.key}
                    href={shopHref(line, popular?.photoSlots)}
                    className={i === 0 ? "btn-primary text-base" : "btn-outline text-base"}
                  >
                    {lineText(line, lang).name}
                  </Link>
                );
              })}
            </div>
            <ul className="mt-6 grid max-w-lg grid-cols-1 gap-x-4 gap-y-1.5 text-sm text-stone-700 sm:grid-cols-2">
              {h.perks.map((p) => (
                <li key={p}>✓ {p}</li>
              ))}
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
              <span className="absolute -bottom-3 start-4 rotate-[-4deg] rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-brand shadow-lg">
                {h.heroBadge(biggestPressed.photoSlots, fmt(biggestPressed.price))}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* CHOOSE STYLE */}
      <section className="mx-auto max-w-6xl px-4 py-10" aria-labelledby="styles-title">
        <Reveal>
          <h2 id="styles-title" className="section-title text-center">{h.styleTitle}</h2>
          <p className="mt-2 text-center text-stone-600">{h.styleSub}</p>
        </Reveal>
        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {lines.map(({ line, bundles }, i) => {
            const single = bundles.find((b) => b.photoSlots === 1) ?? bundles[0];
            const popular = bundles.find((b) => b.badge === "Most popular") ?? bundles[0];
            const lt = lineText(line, lang);
            return (
              <Reveal key={line.key} delay={i * 120}>
                <article className="card-surface group flex h-full flex-col overflow-hidden">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img src={line.cover} alt={line.gallery[0].alt} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                    {single && (
                      <span className="absolute start-4 top-4 rounded-full bg-brand px-4 py-1.5 text-sm font-bold text-white shadow">
                        {h.fromPrice(fmt(single.price))}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="font-display text-2xl font-bold italic text-brand">{lt.name}</h3>
                    <p className="mt-1 text-stone-700">
                      <strong>{lt.size}</strong> · {lt.layers}
                    </p>
                    <p className="text-sm text-stone-500">{lt.layersDetail}</p>
                    {lt.note && <p className="mt-1 text-sm font-semibold text-brand">{lt.note}</p>}
                    <div className="mt-auto pt-5">
                      {bundles.length > 0 && (
                        <div className="mb-3 rounded-xl bg-brand/5 px-3 py-2">
                          <p className="whitespace-nowrap font-bold text-brand">
                            {h.priceRange(String(bundles[0].price), fmt(bundles[bundles.length - 1].price))}
                          </p>
                          <p className="text-xs text-stone-500">{h.sizesNote(bundles.length)}</p>
                        </div>
                      )}
                      <Link href={shopHref(line, popular?.photoSlots)} className="btn-primary w-full" aria-label={h.orderLine(lt.name)}>
                        {t.common.orderNow}
                      </Link>
                    </div>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* EVENT CARDS */}
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
                <h2 id="cards-title" className="section-title">{h.cardsTitle}</h2>
                <p className="mt-2 text-stone-600">{h.cardsText}</p>
                <ul className="mt-4 space-y-2 text-stone-700">
                  {h.cardsPoints.map((p) => (
                    <li key={p}>✓ {p}</li>
                  ))}
                </ul>
                <Link href="/event-cards" className="btn-primary mt-6">
                  {h.cardsCta}
                </Link>
              </Reveal>
            </div>
          </div>
        </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto max-w-6xl px-4 py-12" aria-labelledby="how-title">
        <Reveal>
          <h2 id="how-title" className="section-title text-center">{h.stepsTitle}</h2>
        </Reveal>
        <ol className="mt-8 grid gap-4 sm:grid-cols-3">
          {h.steps.map((s, i) => (
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
            <h2 id="gallery-title" className="section-title text-center">{h.galleryTitle}</h2>
            <p className="mt-2 text-center text-stone-600">{h.gallerySub}</p>
          </Reveal>
          <div className="mt-8 grid auto-rows-[160px] grid-cols-2 gap-3 sm:auto-rows-[220px] md:grid-cols-4">
            {GALLERY.map((img) => (
              <img key={img.src} src={img.src} alt={img.alt} loading="lazy" className={`h-full w-full rounded-2xl object-cover ${img.className}`} />
            ))}
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noreferrer" className="btn-outline">
              <InstagramIcon /> {h.instagram}
            </a>
            <a href={SOCIAL_LINKS.facebook} target="_blank" rel="noreferrer" className="btn-outline">
              <FacebookIcon /> {h.facebook}
            </a>
            <a href={SOCIAL_LINKS.tiktok} target="_blank" rel="noreferrer" className="btn-outline">
              <TikTokIcon /> {h.tiktok}
            </a>
          </div>
        </div>
      </section>

      <ReviewsSection />

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 py-12" aria-labelledby="faq-title">
        <h2 id="faq-title" className="section-title text-center">{h.faqTitle}</h2>
        <div className="mt-6 space-y-3">
          {h.faq.map((item) => (
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
              <WhatsAppIcon className="h-5 w-5" /> {h.askWhatsapp}
            </a>
          </div>
        )}
      </section>
    </div>
  );
}
