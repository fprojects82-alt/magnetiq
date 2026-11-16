import { Dict } from "@/lib/i18n";

/**
 * The 5 ordering steps shown at the top of checkout and the order page:
 * details → total → send money → upload screenshot → confirm.
 * `current` is 1-based; steps before it show a tick.
 */
export function OrderSteps({ current, t }: { current: number; t: Dict }) {
  const labels = t.steps.labels;
  return (
    <ol className="grid grid-cols-5 gap-1" aria-label={t.steps.progress}>
      {labels.map((label, i) => {
        const n = i + 1;
        const done = n < current;
        const active = n === current;
        return (
          <li key={label} className="flex flex-col items-center text-center" aria-current={active ? "step" : undefined}>
            <span className="flex w-full items-center">
              <span className={`h-1 flex-1 rounded ${i === 0 ? "invisible" : n <= current ? "bg-brand" : "bg-stone-200"}`} />
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  done ? "bg-brand text-white" : active ? "bg-brand text-white ring-4 ring-brand/20" : "bg-stone-200 text-stone-500"
                }`}
              >
                {done ? "✓" : n}
              </span>
              <span className={`h-1 flex-1 rounded ${i === labels.length - 1 ? "invisible" : n < current ? "bg-brand" : "bg-stone-200"}`} />
            </span>
            <span className={`mt-1 text-[11px] leading-tight sm:text-xs ${active ? "font-bold text-brand" : done ? "text-stone-700" : "text-stone-400"}`}>
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/** "Stuck? Contact us on WhatsApp" box shown during checkout and payment. */
export function StuckBox({ t, href }: { t: Dict; href: string }) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-2xl border border-[#1f9e4f]/30 bg-green-50 p-4 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-sm text-stone-700">
        <strong className="block text-stone-800">{t.pay.stuckTitle}</strong>
        {t.pay.stuckText}
      </span>
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-full bg-[#1f9e4f] px-5 text-sm font-semibold text-white hover:bg-[#178a42]"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden>
          <path d="M12.05 2.7a9.35 9.35 0 0 0-8.1 14.03L2.7 21.3l4.7-1.23A9.35 9.35 0 1 0 12.05 2.7m0 1.6a7.75 7.75 0 1 1-3.95 14.42l-.28-.17-2.8.73.75-2.73-.18-.29A7.75 7.75 0 0 1 12.05 4.3M8.6 7.6c-.17 0-.45.06-.69.32-.24.26-.9.88-.9 2.15s.92 2.5 1.05 2.67c.13.17 1.8 2.86 4.43 3.9 2.18.86 2.63.69 3.1.65.48-.04 1.54-.63 1.76-1.24.22-.6.22-1.13.15-1.24-.06-.1-.24-.17-.5-.3-.26-.13-1.54-.76-1.78-.85-.24-.09-.41-.13-.58.13-.17.26-.67.85-.82 1.02-.15.17-.3.2-.56.07-.26-.13-1.1-.4-2.1-1.29-.77-.69-1.3-1.54-1.45-1.8-.15-.26-.02-.4.11-.53.12-.12.26-.3.39-.45.13-.15.17-.26.26-.43.09-.17.04-.32-.02-.45-.07-.13-.58-1.42-.8-1.94-.2-.5-.42-.44-.58-.45z" />
        </svg>
        {t.pay.stuckBtn}
      </a>
    </div>
  );
}
