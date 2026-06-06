"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import UserMenu from "@/components/UserMenu";

const QUADRANT_KEYS = [
  "สิ่งที่คุณรัก",
  "สิ่งที่คุณเชี่ยวชาญ",
  "สิ่งที่โลกต้องการ",
  "สิ่งที่ทำแล้วมีรายได้",
  "Ikigai ของคุณ",
  "เส้นทางสู่ Ikigai",
  "มุมมองจากดวงดาว",
] as const;

const QUADRANT_META: Record<string, { color: string; accent: string; icon: string; eng: string }> = {
  "สิ่งที่คุณรัก":           { color: "#f472b6", accent: "rgba(244,114,182,.15)", icon: "♥", eng: "What You Love" },
  "สิ่งที่คุณเชี่ยวชาญ":     { color: "#a78bfa", accent: "rgba(167,139,250,.15)", icon: "✦", eng: "What You're Good At" },
  "สิ่งที่โลกต้องการ":       { color: "#34d399", accent: "rgba(52,211,153,.15)",  icon: "◈", eng: "What the World Needs" },
  "สิ่งที่ทำแล้วมีรายได้":   { color: "#fbbf24", accent: "rgba(251,191,36,.15)",  icon: "◉", eng: "What You Can Be Paid For" },
  "Ikigai ของคุณ":            { color: "#5dcfff", accent: "rgba(93,207,255,.18)",  icon: "✧", eng: "Your Ikigai" },
  "เส้นทางสู่ Ikigai":        { color: "#b89dfc", accent: "rgba(184,157,252,.15)", icon: "→", eng: "Path to Ikigai" },
  "มุมมองจากดวงดาว":           { color: "#e2e8f0", accent: "rgba(255,255,255,.08)", icon: "★", eng: "Star Perspective" },
};

function parseSections(raw: string) {
  const result: { title: string; body: string }[] = [];
  for (const key of QUADRANT_KEYS) {
    const pattern = new RegExp(
      `\\*\\*${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\*\\*([\\s\\S]*?)(?=\\*\\*|$)`,
      "i"
    );
    const m = raw.match(pattern);
    if (m) result.push({ title: key, body: m[1].trim() });
  }
  return result;
}

export default function IkigaiPage() {
  const router = useRouter();
  const [userName, setUserName]   = useState("");
  const [hasBirth, setHasBirth]   = useState(false);
  const [loading, setLoading]     = useState(true);
  const [generating, setGenerating] = useState(false);
  const [reading, setReading]     = useState("");
  const [birthMeta, setBirthMeta] = useState<Record<string, unknown>>({});

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      const meta = data.session?.user?.user_metadata;
      if (!data.session) { router.push("/auth"); return; }
      if (meta?.birth_year_be) {
        setHasBirth(true);
        setBirthMeta(meta);
        const name = meta.full_name || meta.display_name || data.session.user.email?.split("@")[0] || "";
        setUserName(String(name));
        loadIkigai(meta, String(name));
      } else {
        setLoading(false);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadIkigai(meta: Record<string, unknown>, name: string) {
    setGenerating(true);
    setReading("");
    setLoading(true);
    try {
      const ce = Number(meta.birth_year_be) - 543;
      const birthDate = `${ce}-${String(meta.birth_month).padStart(2,"0")}-${String(meta.birth_day).padStart(2,"0")}`;
      const birthTime = `${String(meta.birth_hour).padStart(2,"0")}:${String(meta.birth_minute ?? 0).padStart(2,"0")}`;

      const res = await fetch("/api/ikigai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          birthDate, birthTime,
          latitude: meta.latitude,
          longitude: meta.longitude,
          province: meta.province,
          userName: name,
        }),
      });
      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n"); buf = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = JSON.parse(line.slice(6));
          if (data.type === "chart") setLoading(false);
          if (data.type === "delta") setReading(p => p + data.text);
          if (data.type === "done")  setGenerating(false);
          if (data.type === "error") { setReading(data.message); setGenerating(false); setLoading(false); }
        }
      }
    } catch {
      setReading("เกิดข้อผิดพลาด กรุณาลองใหม่");
      setGenerating(false);
      setLoading(false);
    }
  }

  const sections = parseSections(reading);
  const coreSection  = sections.find(s => s.title === "Ikigai ของคุณ");
  const quadrants    = sections.filter(s => ["สิ่งที่คุณรัก","สิ่งที่คุณเชี่ยวชาญ","สิ่งที่โลกต้องการ","สิ่งที่ทำแล้วมีรายได้"].includes(s.title));
  const pathSection  = sections.find(s => s.title === "เส้นทางสู่ Ikigai");
  const starSection  = sections.find(s => s.title === "มุมมองจากดวงดาว");

  return (
    <main className="premium-shell">
      <div className="grain" />
      <header className="studio-topbar">
        <a href="/" className="brand-lockup" style={{ textDecoration: "none" }}>
          <span className="brand-sigil">✦</span>
          <span>
            <strong>ASTRA GARDEN</strong>
            <small>Astrology translated into gentle guidance</small>
          </span>
        </a>
        <div className="topbar-right">
          <div className="topbar-meta">
            <span>Ikigai</span>
            <small style={{ fontSize: 11 }}>จากเรือนชะตา</small>
          </div>
          <UserMenu />
        </div>
      </header>

      <div className="ikigai-layout">

        <div className="horoscope-header">
          <span className="kicker">✦ Astro Ikigai</span>
          <h1 className="horoscope-title" style={{ fontSize: "clamp(26px,5vw,58px)", wordBreak: "keep-all" }}>
            {userName ? `Ikigai ของคุณ${userName}` : "Ikigai จากเรือนชะตาของคุณ"}
          </h1>
          <p style={{ color: "var(--star-dim)", marginTop: 4, maxWidth: 560, margin: "8px auto 0" }}>
            จุดรวมของ <em>สิ่งที่รัก · สิ่งที่เชี่ยวชาญ · สิ่งที่โลกต้องการ · สิ่งที่ทำแล้วมีรายได้</em><br />
            คำนวณจากดวงกำเนิดของคุณโดยเฉพาะ
          </p>
        </div>

        {/* No birth data */}
        {!loading && !hasBirth && (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <p style={{ marginBottom: 20, color: "var(--star-dim)" }}>
              กรุณากรอกข้อมูลเกิดเพื่อสร้าง Ikigai จากเรือนชะตา
            </p>
            <button className="luxury-button" onClick={() => router.push("/auth/birth")}>
              กรอกข้อมูลเกิด →
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "60px 20px", color: "var(--aurora)" }}>
            <div className="draw-orbit" style={{ width: 48, height: 48 }} />
            <span>กำลังคำนวณ Ikigai จากดวงชะตา…</span>
          </div>
        )}

        {/* Ikigai Diagram — always show after loading */}
        {!loading && hasBirth && (
          <div className="ikigai-diagram-wrap">
            <div className="ikigai-diagram" aria-hidden="true">
              {/* Four overlapping circles */}
              <div className="ikigai-circle ikigai-love">
                <span className="ikigai-circle-label">
                  <span className="ikigai-circle-icon">♥</span>
                  สิ่งที่คุณรัก
                  <small>What You Love</small>
                </span>
              </div>
              <div className="ikigai-circle ikigai-good">
                <span className="ikigai-circle-label">
                  <span className="ikigai-circle-icon">✦</span>
                  สิ่งที่เชี่ยวชาญ
                  <small>What You're Good At</small>
                </span>
              </div>
              <div className="ikigai-circle ikigai-needs">
                <span className="ikigai-circle-label">
                  <span className="ikigai-circle-icon">◈</span>
                  สิ่งที่โลกต้องการ
                  <small>What the World Needs</small>
                </span>
              </div>
              <div className="ikigai-circle ikigai-paid">
                <span className="ikigai-circle-label">
                  <span className="ikigai-circle-icon">◉</span>
                  สิ่งที่มีรายได้
                  <small>What You Can Be Paid For</small>
                </span>
              </div>

              {/* Intersection labels */}
              <div className="ikigai-inter ikigai-inter-passion">Passion</div>
              <div className="ikigai-inter ikigai-inter-mission">Mission</div>
              <div className="ikigai-inter ikigai-inter-vocation">Vocation</div>
              <div className="ikigai-inter ikigai-inter-profession">Profession</div>

              {/* Center */}
              <div className="ikigai-center">
                <span>✧</span>
                <strong>IKIGAI</strong>
              </div>
            </div>
          </div>
        )}

        {/* Generating indicator */}
        {generating && (
          <div style={{ display: "flex", gap: 12, alignItems: "center", color: "var(--aurora)", padding: "20px 0", justifyContent: "center" }}>
            <div className="draw-orbit" style={{ width: 36, height: 36 }} />
            <span>ดวงดาวกำลังสร้าง Ikigai ของคุณ…</span>
          </div>
        )}

        {/* Core Ikigai — featured */}
        {coreSection && (
          <div className="ikigai-core-card">
            <div className="ikigai-core-sigil">✧</div>
            <span className="kicker" style={{ color: "var(--aurora)" }}>Ikigai ของคุณ</span>
            <h2 className="ikigai-core-title">Your Ikigai</h2>
            <p className="ikigai-core-body">{coreSection.body}</p>
          </div>
        )}

        {/* Four quadrant cards */}
        {quadrants.length > 0 && (
          <div className="ikigai-quadrant-grid">
            {quadrants.map(sec => {
              const m = QUADRANT_META[sec.title];
              return (
                <div key={sec.title} className="ikigai-quad-card" style={{ borderColor: m.color, background: m.accent }}>
                  <div className="ikigai-quad-icon" style={{ color: m.color }}>{m.icon}</div>
                  <div className="ikigai-quad-eng">{m.eng}</div>
                  <h3 className="ikigai-quad-title" style={{ color: m.color }}>{sec.title}</h3>
                  <p className="ikigai-quad-body">{sec.body}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* Path steps */}
        {pathSection && (
          <div className="ikigai-path-section">
            <div className="transit-alerts-header">
              <span className="kicker">→ เส้นทางสู่ Ikigai</span>
              <h2>ขั้นตอนที่เป็นรูปธรรม</h2>
            </div>
            <div className="ikigai-path-body">
              {pathSection.body.split("\n").filter(l => l.trim()).map((line, i) => (
                <div key={i} className="ikigai-step">
                  <span className="ikigai-step-num">{String(i + 1).padStart(2, "0")}</span>
                  <p>{line.replace(/^[0-9]+[\.\)]\s*/, "").replace(/\*\*/g, "")}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Star prophecy */}
        {starSection && (
          <div className="ikigai-star-card">
            <span className="ikigai-star-icon">★</span>
            <p className="ikigai-star-text">{starSection.body}</p>
          </div>
        )}

        {/* Refresh */}
        {hasBirth && !loading && (
          <div style={{ textAlign: "center", marginTop: 16, marginBottom: 32 }}>
            <button
              className="ghost-button"
              onClick={() => loadIkigai(birthMeta, userName)}
              disabled={generating}
            >
              {generating ? "กำลังสร้าง…" : "↻ สร้าง Ikigai ใหม่"}
            </button>
          </div>
        )}
      </div>

      <footer className="legal-line">
        Ikigai คำนวณจากดวงกำเนิดจริง ใช้เป็นมุมมองประกอบการค้นหาตัวเอง ไม่ใช่การกำหนดชะตาชีวิต
      </footer>
    </main>
  );
}
