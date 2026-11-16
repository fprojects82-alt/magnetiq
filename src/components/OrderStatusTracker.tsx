import { CUSTOMER_STATUS_STEPS } from "@/lib/types";

/** Customer-facing progress of an order; the admin changes the status. */
export function OrderStatusTracker({ status, paid }: { status: string; paid: boolean }) {
  if (status === "CANCELLED") {
    return (
      <div className="rounded-2xl bg-stone-100 p-4 text-center text-sm font-semibold text-stone-600" role="status">
        This order was cancelled. Message us on WhatsApp if you have any questions.
      </div>
    );
  }
  const current = Math.max(0, CUSTOMER_STATUS_STEPS.findIndex((s) => s.status === status));

  return (
    <div className="rounded-2xl bg-white p-4 text-left shadow-sm sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-semibold text-stone-800">Order status</h2>
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold ${
            paid ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
          }`}
        >
          {paid ? "✓ Payment confirmed" : "Waiting for payment"}
        </span>
      </div>
      <ol className="mt-4 grid grid-cols-5 gap-1" aria-label="Order progress">
        {CUSTOMER_STATUS_STEPS.map((step, i) => {
          const done = i <= current;
          return (
            <li key={step.status} className="flex flex-col items-center text-center" aria-current={i === current ? "step" : undefined}>
              <span className="flex w-full items-center">
                <span className={`h-1 flex-1 rounded ${i === 0 ? "invisible" : done ? "bg-brand" : "bg-stone-200"}`} />
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    done ? "bg-brand text-white" : "bg-stone-200 text-stone-500"
                  }`}
                >
                  {done ? "✓" : i + 1}
                </span>
                <span
                  className={`h-1 flex-1 rounded ${
                    i === CUSTOMER_STATUS_STEPS.length - 1 ? "invisible" : i < current ? "bg-brand" : "bg-stone-200"
                  }`}
                />
              </span>
              <span className={`mt-1 text-[11px] leading-tight sm:text-xs ${done ? "font-semibold text-stone-800" : "text-stone-400"}`}>
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
