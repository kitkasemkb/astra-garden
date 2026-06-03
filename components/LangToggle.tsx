"use client";
import { useLang } from "@/components/LangProvider";
import { LANG_OPTIONS } from "@/lib/i18n";

export default function LangToggle() {
  const { lang, setLang } = useLang();
  return (
    <div className="lang-pill-group" role="group" aria-label="Language">
      {LANG_OPTIONS.map(opt => (
        <button
          key={opt.value}
          className={`lang-pill ${lang === opt.value ? "active" : ""}`}
          onClick={() => setLang(opt.value)}
          aria-pressed={lang === opt.value}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
