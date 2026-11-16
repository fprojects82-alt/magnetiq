import { db } from "@/lib/db";
import { Stars } from "@/components/ReviewForm";
import { ReviewControls } from "@/components/admin/ReviewControls";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  const reviews = await db.review.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-stone-800">Reviews</h1>
      <p className="mt-1 text-sm text-stone-500">
        Customers with a paid order can review it from their order page. Reviews show on the home page; hide or delete any you don&apos;t want.
      </p>
      {reviews.length === 0 ? (
        <p className="card-surface mt-6 p-6 text-stone-500">No reviews yet.</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {reviews.map((r) => (
            <li key={r.id} className="card-surface p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <Stars value={r.rating} />
                  <p className="text-sm font-semibold text-stone-800">
                    {r.name} <span className="font-normal text-stone-400">· {r.orderNumber} · {r.createdAt.toLocaleDateString()}</span>
                  </p>
                </div>
                <ReviewControls id={r.id} visible={r.visible} />
              </div>
              <p className="mt-2 whitespace-pre-line text-stone-700">{r.text}</p>
              {r.photoUrl && <img src={r.photoUrl} alt="" className="mt-2 h-28 rounded-lg object-cover" />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
