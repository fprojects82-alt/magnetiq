import { cookies } from "next/headers";
import { getDict, isLang, Lang, LANG_COOKIE } from "./i18n";

/** The visitor's language from the "lang" cookie (English by default). */
export function getLang(): Lang {
  const v = cookies().get(LANG_COOKIE)?.value;
  return isLang(v) ? v : "en";
}

export function getServerDict() {
  const lang = getLang();
  return { lang, t: getDict(lang) };
}
