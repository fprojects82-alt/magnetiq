import { db } from "@/lib/db";
import { isAllowedUploadUrl } from "@/lib/orders";
import { MAGNET_OPTIONS } from "@/lib/cardRequest";
import { CardRequestStatusSelect } from "@/components/admin/CardRequestStatusSelect";

export const dynamic = "force-dynamic";

function parseUrls(raw: string): string[] {
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v.filter((u): u is string => typeof u === "string" && isAllowedUploadUrl(u)) : [];
  } catch {
    return [];
  }
}

export default async function AdminCardRequestsPage() {
  const requests = await db.cardRequest.findMany({ orderBy: { createdAt: "desc" }, take: 200 });

  return (
    <div>
      <h1 className="text-2xl font-bold text-stone-800">Event card requests</h1>
      <p className="mt-1 text-sm text-stone-500">Quotes requested from the Event Cards page. Reply on WhatsApp, then update the status.</p>

      {requests.length === 0 ? (
        <p className="card-surface mt-6 p-6 text-stone-500">No requests yet.</p>
      ) : (
        <div className="mt-6 space-y-4">
          {requests.map((r) => {
            const demos = parseUrls(r.demoImageUrls);
            const magnet = MAGNET_OPTIONS.find((m) => m.value === r.magnetType)?.label ?? r.magnetType;
            return (
              <article key={r.id} className="card-surface p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-stone-800">
                      {r.cardType} · {r.cardCount} cards
                    </h2>
                    <p className="text-sm text-stone-500">
                      {r.withMagnets ? `With ${r.magnetCount} × ${magnet}` : "No magnets"}
                    </p>
                    <p className="mt-1 text-xs text-stone-400">{r.createdAt.toLocaleString()}</p>
                  </div>
                  <CardRequestStatusSelect id={r.id} status={r.status} />
                </div>
                <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                  <div><dt className="text-stone-500">Customer</dt><dd>{r.customerName}</dd></div>
                  <div>
                    <dt className="text-stone-500">Phone</dt>
                    <dd>
                      <a href={`https://wa.me/${r.phone.replace(/^\+/, "").replace(/^0/, "20")}`} target="_blank" rel="noreferrer" className="font-semibold text-brand underline">
                        {r.phone}
                      </a>
                    </dd>
                  </div>
                  {r.names && <div><dt className="text-stone-500">Names</dt><dd>{r.names}</dd></div>}
                  {r.eventDate && <div><dt className="text-stone-500">Event date</dt><dd>{r.eventDate}</dd></div>}
                  {r.notes && <div className="sm:col-span-2"><dt className="text-stone-500">Notes</dt><dd className="whitespace-pre-wrap">{r.notes}</dd></div>}
                </dl>
                {demos.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {demos.map((url, i) => (
                      <a key={i} href={url} target="_blank" rel="noreferrer" className="h-20 w-20 overflow-hidden rounded-lg border border-stone-200">
                        <img src={url} alt={`Design ${i + 1}`} className="h-full w-full object-cover" />
                      </a>
                    ))}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
