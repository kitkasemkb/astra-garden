"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useLang } from "@/components/LangProvider";
import type { TranslationKey } from "@/lib/i18n";
import UserMenu from "@/components/UserMenu";

const CHECK = "✦";
const MUTED = "·";

const FREE_FEATURES: TranslationKey[] = [
  "pricing.feature.readings3",
  "pricing.feature.birthChart",
  "pricing.feature.tarot",
  "pricing.feature.history",
];

const PRO_FEATURES: TranslationKey[] = [
  "pricing.feature.readingsUnlimited",
  "pricing.feature.birthChart",
  "pricing.feature.tarot",
  "pricing.feature.history",
  "pricing.feature.synastry",
  "pricing.feature.priority",
];

export default function PricingPage() {
  const { t, lang } = useLang();
  const [tier, setTier] = useState<"free" | "pro">("free");
  const [loading, setLoading] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      const meta = data.session?.user?.user_metadata;
      setLoggedIn(!!data.session);
      setTier(meta?.subscription_tier === "pro" ? "pro" : "free");
    });
    // Handle redirect from Stripe
    const params = new URLSearchParams(window.location.search);
    if (params.get("success")) setMessage(lang === "th" ? "อัปเกรดสำเร็จ! ยินดีต้อนรับสู่ Pro" : "Upgrade successful! Welcome to Pro.");
    if (params.get("canceled")) setMessage(lang === "th" ? "ยกเลิกการชำระเงิน" : "Payment canceled.");
  }, [lang]);

  async function handleUpgrade() {
    if (!loggedIn) { window.location.href = "/auth"; return; }
    setLoading(true);
    const res = await fetch("/api/stripe/checkout", { method: "POST" });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else { setMessage(data.error || "Error"); setLoading(false); }
  }

  async function handlePortal() {
    setLoading(true);
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else { setMessage(data.error || "Error"); setLoading(false); }
  }

  return (
    <main className="premium-shell">
      <div className="grain" />
      <header className="studio-topbar">
        <a href="/" className="brand-lockup" style={{ textDecoration: "none" }}>
          <span className="brand-sigil">✦</span>
          <span><strong>ASTRA GARDEN</strong><small>Astrology translated into gentle guidance</small></span>
        </a>
        <div className="topbar-right">
          <UserMenu />
        </div>
      </header>

      <section style={{ maxWidth: 900, margin: "0 auto", padding: "60px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div className="kicker">Plans</div>
          <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", marginBottom: 12 }}>{t("pricing.title")}</h1>
          {message && (
            <div className="auth-message" style={{ display: "inline-block", marginTop: 8 }}>{message}</div>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
          {/* Free */}
          <div className="pricing-card">
            <div className="pricing-card-header">
              <span className="pricing-tier-badge">{t("pricing.free")}</span>
              <div className="pricing-price">{t("pricing.freePrice")}</div>
            </div>
            <ul className="pricing-features">
              {FREE_FEATURES.map(f => (
                <li key={f}><span className="pricing-check">{CHECK}</span>{t(f)}</li>
              ))}
              <li className="pricing-missing"><span>{MUTED}</span>{t("pricing.feature.synastry")}</li>
              <li className="pricing-missing"><span>{MUTED}</span>{t("pricing.feature.priority")}</li>
            </ul>
            {tier === "free" ? (
              <div className="pricing-current-badge">{t("pricing.currentPlan")}</div>
            ) : (
              <a href="/" className="ghost-button" style={{ display: "block", textAlign: "center", textDecoration: "none" }}>
                {t("pricing.freeCta")}
              </a>
            )}
          </div>

          {/* Pro */}
          <div className="pricing-card pricing-card-pro">
            <div className="pricing-card-header">
              <span className="pricing-tier-badge pro">{t("pricing.pro")}</span>
              <div className="pricing-price">{t("pricing.proPrice")}</div>
            </div>
            <ul className="pricing-features">
              {PRO_FEATURES.map(f => (
                <li key={f}><span className="pricing-check">{CHECK}</span>{t(f)}</li>
              ))}
            </ul>
            {tier === "pro" ? (
              <button className="luxury-button" onClick={handlePortal} disabled={loading}>
                {loading ? "…" : t("pricing.managePlan")}
              </button>
            ) : (
              <button className="luxury-button" onClick={handleUpgrade} disabled={loading}>
                {loading ? "…" : t("pricing.proCta")}
              </button>
            )}
          </div>
        </div>
      </section>

      <footer className="legal-line">{t("footer.disclaimer")}</footer>
    </main>
  );
}
