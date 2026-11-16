"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useLang } from "@/context/LangContext";
import { LANG_COOKIE } from "@/lib/i18n";

/** English ⇄ Arabic toggle. Saves the choice for a year and re-renders the page. */
export function LangSwitch({ className = "" }: { className?: string }) {
  const { lang, t } = useLang();
  const router = useRouter();
  const [pending, start] = useTransition();
  const next = lang === "ar" ? "en" : "ar";

  return (
    <button
      type="button"
      onClick={() => {
        document.cookie = `${LANG_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
        document.documentElement.lang = next;
        document.documentElement.dir = next === "ar" ? "rtl" : "ltr";
        start(() => router.refresh());
      }}
      aria-label={t.common.switchToLabel}
      lang={next}
      className={`flex h-11 items-center rounded-full border border-stone-200 px-3 text-sm font-bold text-brand hover:border-brand disabled:opacity-60 ${className}`}
      disabled={pending}
    >
      {t.common.switchTo}
    </button>
  );
}
