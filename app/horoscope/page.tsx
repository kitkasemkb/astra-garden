"use client";
import { useState, useEffect } from "react";
import UserMenu from "@/components/UserMenu";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";

type TransitAspect = {
  transitPlanet: string;
  natalPlanet: string;
  type: string;
  orb: number;
  energy: "harmonious" | "challenging" | "neutral";
  influence: "major" | "minor";
  meaningTh: string;
  daysAhead?: number;
};

type TransitReport = {
  currentDate: string;
  aspects: TransitAspect[];
  summary: string;
};

const ENERGY_LABEL: Record<string, { label: string; color: string; icon: string }> = {
  harmonious:  { label: "เสริม",    color: "var(--aurora)",  icon: "✦" },
  challenging: { label: "ท้าทาย",   color: "#f87171",        icon: "⚡" },
  neutral:     { label: "กลาง",     color: "var(--star-dim)", icon: "◈" },
};

export default function DailyBriefingPage() {
  const router = useRouter();
  const [userName, setUserName]   = useState("");
  const [hasBirth, setHasBirth]   = useState(false);
  const [loading, setLoading]     = useState(true);
  const [generating, setGenerating] = useState(false);
  const [reading, setReading]     = useState("");
  const [transitReport, setTransitReport] = useState<TransitReport | null>(null);
  const [upcoming, setUpcoming]   = useState<TransitAspect[]>([]);
  const [birthMeta, setBirthMeta] = useState<Record<string, unknown>>({});

  const today = new Date().toLocaleDateString("th-TH", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

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
        loadBriefing(meta, String(name));
      } else {
        setLoading(false);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadBriefing(meta: Record<string, unknown>, name: string) {
    setGenerating(true); setReading(""); setTransitReport(null); setUpcoming([]);
    try {
      const ce = Number(meta.birth_year_be) - 543;
      const birthDate = `${ce}-${String(meta.birth_month).padStart(2,"0")}-${String(meta.birth_day).padStart(2,"0")}`;
      const birthTime = `${String(meta.birth_hour).padStart(2,"0")}:${String(meta.birth_minute ?? 0).padStart(2,"0")}`;

      const res = await fetch("/api/horoscope", {
        method: "POST",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify({
          birthDate, birthTime,
          latitude: meta.latitude,
          longitude: meta.longitude,
          province: meta.province,
          userName: name,
        }),
      });
      if (!res.body) throw new Error();
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
          if (data.type === "transit") {
            setTransitReport(data.report);
            setUpcoming(data.upcoming ?? []);
            setLoading(false);
          }
          if (data.type === "delta") setReading(p => p + data.text);
          if (data.type === "done")  setGenerating(false);
          if (data.type === "error") { setReading(data.message); setGenerating(false); setLoading(false); }
        }
      }
    } catch {
      setReading("เกิดข้อผิดพลาด กรุณาลองใหม่");
      setGenerating(false); setLoading(false);
    }
  }

  const sections = reading.split("\n").reduce<{ title: string; body: string[] }[]>((acc, line) => {
    if (line.startsWith("**") && line.endsWith("**")) {
      acc.push({ title: line.replace(/\*\*/g, ""), body: [] });
    } else if (acc.length > 0 && line.trim()) {
      acc[acc.length - 1].body.push(line);
    }
    return acc;
  }, []);

  const SECTION_ICONS: Record<string, string> = {
    "พลังงานวันนี้": "☀️",
    "ความรักและความสัมพันธ์": "💞",
    "การงานและโอกาส": "💼",
    "การเงิน": "💰",
    "สุขภาพและพลังงาน": "🌿",
    "สิ่งที่ควรทำวันนี้": "✦",
    "ข้อความจากดวงดาว": "🌌",
  };

  return (
    <main className="premium-shell">
      <div className="grain" />
      <header className="studio-topbar">
        <a href="/" className="brand-lockup" style={{ textDecoration:"none" }}>
          <span className="brand-sigil">✦</span>
          <span><strong>ASTRA GARDEN</strong><small>Astrology translated into gentle guidance</small></span>
        </a>
        <div className="topbar-right">
          <div className="topbar-meta">
            <span>Daily Briefing</span>
            <span style={{ fontSize:11 }}>{today}</span>
          </div>
          <UserMenu />
        </div>
      </header>

      <div className="horoscope-layout">

        {/* Header */}
        <div className="horoscope-header">
          <span className="kicker">✦ Personal Daily Briefing</span>
          <h1 className="horoscope-title">
            {userName ? `สวัสดี คุณ${userName}` : "Daily Briefing ของคุณ"}
          </h1>
          <p style={{ color:"var(--star-dim)", marginTop:4 }}>{today}</p>
        </div>

        {/* No birth data */}
        {!loading && !hasBirth && (
          <div style={{ textAlign:"center", padding:"40px 20px" }}>
            <p style={{ marginBottom:20, color:"var(--star-dim)" }}>
              กรุณากรอกข้อมูลเกิดเพื่อรับ Daily Briefing ส่วนตัว
            </p>
            <button className="luxury-button" onClick={() => router.push("/auth/birth")}>
              กรอกข้อมูลเกิด →
            </button>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:16, padding:"60px 20px", color:"var(--aurora)" }}>
            <div className="draw-orbit" style={{ width:48, height:48 }} />
            <span>กำลังคำนวณดาวประจำวันของคุณ…</span>
          </div>
        )}

        {/* Transit summary bar */}
        {transitReport && (
          <div className="briefing-transit-bar">
            <div className="briefing-transit-summary">
              <span className="briefing-transit-icon">◈</span>
              <span>{transitReport.summary}</span>
            </div>
            <div className="briefing-transit-aspects">
              {transitReport.aspects.slice(0, 4).map((a, i) => {
                const e = ENERGY_LABEL[a.energy];
                return (
                  <div key={i} className="transit-pill" style={{ borderColor: e.color }}>
                    <span style={{ color: e.color }}>{e.icon}</span>
                    <span>{a.transitPlanet} → {a.natalPlanet}</span>
                    <small style={{ color: e.color }}>{e.label}</small>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* AI Briefing sections */}
        {sections.length > 0 && (
          <div className="briefing-grid">
            {sections.map((sec, i) => (
              <div key={i} className={`briefing-card ${i === 0 ? "briefing-card-wide" : ""}`}>
                <div className="briefing-card-icon">{SECTION_ICONS[sec.title] ?? "✦"}</div>
                <h3 className="briefing-card-title">{sec.title}</h3>
                {sec.body.map((line, j) => <p key={j}>{line}</p>)}
              </div>
            ))}
          </div>
        )}

        {/* Generating indicator */}
        {generating && !sections.length && (
          <div style={{ display:"flex", gap:12, alignItems:"center", color:"var(--aurora)", padding:"20px 0" }}>
            <div className="draw-orbit" style={{ width:36, height:36 }} />
            <span>ดวงดาวกำลังส่ง briefing ของคุณ…</span>
          </div>
        )}

        {/* Transit Alerts — Coming Up */}
        {upcoming.length > 0 && (
          <div className="transit-alerts-section">
            <div className="transit-alerts-header">
              <span className="kicker">⚡ Transit Alerts</span>
              <h2>ดาวที่กำลังจะมาถึง</h2>
            </div>
            <div className="transit-alerts-grid">
              {upcoming.map((a, i) => {
                const e = ENERGY_LABEL[a.energy];
                return (
                  <div key={i} className="alert-card" style={{ borderLeftColor: e.color }}>
                    <div className="alert-card-header">
                      <span style={{ color: e.color, fontSize:18 }}>{e.icon}</span>
                      <strong>{a.transitPlanet} {a.type} {a.natalPlanet}</strong>
                      <span className="alert-badge" style={{ background: e.color + "22", color: e.color }}>
                        อีก {a.daysAhead} วัน
                      </span>
                    </div>
                    <p>{a.meaningTh}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Refresh button */}
        {hasBirth && !loading && (
          <div style={{ textAlign:"center", marginTop:16, marginBottom:32 }}>
            <button
              className="ghost-button"
              onClick={() => loadBriefing(birthMeta, userName)}
              disabled={generating}
            >
              {generating ? "กำลังสร้าง…" : "↻ สร้าง Briefing ใหม่"}
            </button>
          </div>
        )}
      </div>

      <footer className="legal-line">
        Daily Briefing คำนวณจากดวงกำเนิดและ transit ดาวจริงของคุณ ใช้เป็นมุมมองประกอบ ไม่ใช่การรับประกันอนาคต
      </footer>
    </main>
  );
}
