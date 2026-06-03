"use client";
import { useLang } from "@/components/LangProvider";

export default function LangToggle() {
  const { lang, setLang } = useLang();
  return (
    <button
      className="lang-toggle"
      onClick={() => setLang(lang === "th" ? "en" : "th")}
      title={lang === "th" ? "Switch to English" : "เปลี่ยนเป็นภาษาไทย"}
    >
      {lang === "th" ? "EN" : "TH"}
    </button>
  );
}
