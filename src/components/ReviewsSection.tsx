import { db } from "@/lib/db";
import { Stars } from "./ReviewForm";

/** Home page testimonials from paying customers. Hidden until there is at least one review. */
export async function ReviewsSection() {
  const reviews = await db.review
    .findMany({ where: { visible: true }, orderBy: { createdAt: "desc" }, take: 12 })
    .catch(() => []);
  if (reviews.length === 0) return null;

  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;

  return (
    <section className="mx-auto max-w-6xl px-4 py-14" aria-labelledby="reviews-title">
      <h2 id="reviews-title" className="section-title text-center">What our customers say</h2>
      <p className="mt-2 flex items-center justify-center gap-2 text-stone-600">
        <Stars value={Math.round(avg)} />
        <span>
          {avg.toFixed(1)} from {reviews.length} review{reviews.length > 1 ? "s" : ""}
        </span>
      </p>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reviews.map((r) => (
          <li key={r.id} className="card-surface flex flex-col p-5">
            <Stars value={r.rating} />
            <p className="mt-3 flex-1 whitespace-pre-line text-stone-700">&ldquo;{r.text}&rdquo;</p>
            {r.photoUrl && <img src={r.photoUrl} alt={`Photo from ${r.name}`} loading="lazy" className="mt-3 h-40 w-full rounded-xl object-cover" />}
            <p className="mt-3 text-sm font-semibold text-stone-800">
              {r.name}
              <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-semibold text-green-700">Verified order</span>
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
