"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { translations, type Lang, type TKey } from "../lib/i18n";

interface LangCtx {
  lang: Lang;
  t: (key: TKey) => string;
}

const ctx = createContext<LangCtx>({
  lang: "en",
  t: (key) => translations.en[key],
});

function detect(): Lang {
  try {
    const langs = navigator.languages?.length ? Array.from(navigator.languages) : [navigator.language];
    return langs.some((l) => l.toLowerCase().startsWith("ru")) ? "ru" : "en";
  } catch {
    return "en";
  }
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");

  useEffect(() => { setLang(detect()); }, []);

  return (
    <ctx.Provider value={{ lang, t: (key) => translations[lang][key] }}>
      {children}
    </ctx.Provider>
  );
}

export function useLang() { return useContext(ctx); }
