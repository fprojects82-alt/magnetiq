"use client";

import { createContext, ReactNode, useContext } from "react";
import { Dict, getDict, Lang, money } from "@/lib/i18n";

const LangContext = createContext<Lang>("en");

export function LangProvider({ lang, children }: { lang: Lang; children: ReactNode }) {
  return <LangContext.Provider value={lang}>{children}</LangContext.Provider>;
}

/** Current language, its dictionary and a price formatter for client components. */
export function useLang(): { lang: Lang; t: Dict; fmt: (n: number) => string } {
  const lang = useContext(LangContext);
  return { lang, t: getDict(lang), fmt: (n: number) => money(n, lang) };
}
