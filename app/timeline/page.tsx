"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import UserMenu from "@/components/UserMenu";

const PERIOD_KEYS = [
  "ตอนนี้ — สิ่งที่ดาวเปิดให้",
  "1 เดือนข้างหน้า — สิ่งที่ดาวเปิดให้",
  "3 เดือนข้างหน้า — สิ่งที่ดาวเปิดให้",
  "6 เดือนข้างหน้า — สิ่งที่ดาวเปิดให้",
  "12 เดือนข้างหน้า — สิ่งที่ดาวเปิดให้",
] as const;

const PERIOD_META = [
  { label: "ตอนนี้",         short: "Now",   color: "#5dcfff", months: 0 },
  { label: "1 เดือน",        short: "+1M",   color: "#a78bfa", months: 1 },
  { label: "3 เดือน",        short: "+3M",   color: "#34d399", months: 3 },
  { label: "6 เดือน",        short: "+6M",   color: "#fbbf24", months: 6 },
  { label: "12 เดือน",       short: "+12M",  color: "#f472b6", months: 12 },
];

const QUADRANT_COLOR: Record<string, string> = {
  "สิ่งที่รัก":       "#f472b6",
  "เชี่ยวชาญ":        "#a78bfa",
  "โลกต้องการ":       "#34d399",
  "มีรายได้":         "#fbbf24",
};

const ENERGY_COLOR: Record<string, string> = {
  harmonious: "#34d399",
  challenging: "#f87171",
  mixed: "#fbbf24",
};

type PeriodData = {
  quadrant: string;
  energy: string;
  meaning: string;
  actions: string[];
};

function parsePeriod(raw: string, key: string): PeriodData {
  const pattern = new RegExp(
    `\\*\\*${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\*\\*([\\s\\S]*?)(?=\\*\\*|$)`, "i"
  );
  const block = raw.match(pattern)?.[1]?.trim() ?? "";
  const field = (k: string) => {
    const m = block.match(new RegExp(`${k}[:：]\\s*([^\\n]+)`));
    return m?.[1]?.trim() ?? "";
  };
  const meaningMatch = block.match(/ความหมาย[:：]\s*([\s\S]*?)(?=ลงมือทำ|$)/);
  const actionsMatch = block.match(/ลงมือทำ[:：]\s*([\s\S]*?)$/);
  const actions = (actionsMatch?.[1] ?? "")
    .split("\n")
    .map(l => l.replace(/^[-•0-9.)\s]+/, "").replace(/\*\*/g, "").trim())
    .filter(Boolean);
  return {
    quadrant: field("วง Ikigai ที่เปิดอยู่"),
    energy:   field("พลังงาน"),
    meaning:  meaningMatch?.[1]?.trim().replace(/\*\*/g, "") ?? "",
    actions,
  };
}

function parseSections(raw: string) {
  const overview = (() => {
    const m = raw.match(/\*\*ภาพรวม Ikigai Timeline\*\*([\s\S]*?)(?=\*\*|$)/i);
    return m?.[1]?.trim() ?? "";
  })();
  const golden = (() => {
    const m = raw.match(/\*\*หน้าต่างทองของ 12 เดือนนี้\*\*([\s\S]*?)(?=\*\*|$)/i);
    return m?.[1]?.trim() ?? "";
  })();
  const periods = PERIOD_KEYS.map((key, i) => ({
    ...PERIOD_META[i],
    key,
    data: parsePeriod(raw, key),
  }));
  return { overview, golden, periods };
}

export default function TimelinePage() {
  const router = useRouter();
  const [userName, setUserName]     = useState("");
  const [hasBirth, setHasBirth]     = useState(false);
  const [loading, setLoading]       = useState(true);
  const [generating, setGenerating] = useState(false);
  const [reading, setReading]       = useState("");
  const [birthMeta, setBirthMeta]   = useState<Record<string, unknown>>({});
  const [active, setActive]         = useState(0);

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
        load(meta, String(name));
      } else {
        setLoading(false);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load(meta: Record<string, unknown>, name: string) {
    setGenerating(true); setReading(""); setLoading(true);
    try {
      const ce = Number(meta.birth_year_be) - 543;
      const birthDate = `${ce}-${String(meta.birth_month).padStart(2,"0")}-${String(meta.birth_day).padStart(2,"0")}`;
      const birthTime = `${String(meta.birth_hour).padStart(2,"0")}:${String(meta.birth_minute ?? 0).padStart(2,"0")}`;
      const res = await fetch("/api/timeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ birthDate, birthTime, latitude: meta.latitude, longitude: meta.longitude, province: meta.province, userName: name }),
      });
      if (!res.body) throw new Error();
      const reader = res.body.getReader(); const decoder = new TextDecoder(); let buf = "";
      while (true) {
        const { done, value } = await reader.read(); if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n"); buf = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const d = JSON.parse(line.slice(6));
          if (d.type === "ready") setLoading(false);
          if (d.type === "delta") setReading(p => p + d.text);
          if (d.type === "done")  setGenerating(false);
          if (d.type === "error") { setReading(d.message); setGenerating(false); setLoading(false); }
        }
      }
    } catch { setReading("เกิดข้อผิดพลาด"); setGenerating(false); setLoading(false); }
  }

  const parsed = reading.length > 100 ? parseSections(reading) : null;
  const activePeriod = parsed?.periods[active];
  const qColor = activePeriod ? (QUADRANT_COLOR[activePeriod.data.quadrant] ?? "var(--aurora)") : "var(--aurora)";
  const eColor = activePeriod ? (ENERGY_COLOR[activePeriod.data.energy] ?? "var(--aurora)") : "var(--aurora)";

  return (
    <main className="premium-shell">
      <div className="grain" />
      <header className="studio-topbar">
        <a href="/" className="brand-lockup" style={{ textDecoration:"none" }}>
          <span className="brand-sigil">✦</span>
          <span><strong>ASTRA GARDEN</strong><small>Astrology translated into gentle guidance</small></span>
        </a>
        <div className="topbar-right">
          <div className="topbar-meta"><span>Ikigai Timeline</span><small style={{fontSize:11}}>12 เดือนข้างหน้า</small></div>
          <UserMenu />
        </div>
      </header>

      <div className="ikigai-layout">
        <div className="horoscope-header">
          <span className="kicker">◈ Ikigai Timeline</span>
          <h1 className="horoscope-title" style={{ fontSize:"clamp(26px,5vw,58px)", wordBreak:"keep-all" }}>
            {userName ? `Timeline ของคุณ${userName}` : "Ikigai Timeline ของคุณ"}
          </h1>
          <p style={{ color:"var(--star-dim)", marginTop:4, maxWidth:560, margin:"8px auto 0" }}>
            ดาวกำลังเปิดประตูให้ Ikigai วงไหน — และควรลงมือทำอะไรในช่วงใด
          </p>
        </div>

        {!loading && !hasBirth && (
          <div style={{textAlign:"center",padding:"40px 20px"}}>
            <p style={{marginBottom:20,color:"var(--star-dim)"}}>กรุณากรอกข้อมูลเกิดเพื่อดู Timeline</p>
            <button className="luxury-button" onClick={() => router.push("/auth/birth")}>กรอกข้อมูลเกิด →</button>
          </div>
        )}
        {loading && (
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:16,padding:"60px 20px",color:"var(--aurora)"}}>
            <div className="draw-orbit" style={{width:48,height:48}} />
            <span>กำลังคำนวณ Transit ดาว 12 เดือน…</span>
          </div>
        )}
        {generating && !loading && (
          <div style={{display:"flex",gap:12,alignItems:"center",color:"var(--aurora)",padding:"20px 0",justifyContent:"center"}}>
            <div className="draw-orbit" style={{width:36,height:36}} />
            <span>ดวงดาวกำลังสร้าง Timeline ของคุณ…</span>
          </div>
        )}

        {/* Overview */}
        {parsed?.overview && (
          <div className="timeline-overview">
            <span className="kicker" style={{color:"var(--aurora)"}}>ภาพรวม 12 เดือน</span>
            <p>{parsed.overview}</p>
          </div>
        )}

        {/* Period tabs */}
        {parsed && (
          <>
            <div className="timeline-tabs">
              {PERIOD_META.map((p, i) => (
                <button
                  key={i}
                  className={`timeline-tab ${active === i ? "active" : ""}`}
                  style={active === i ? { borderColor: p.color, color: p.color } : {}}
                  onClick={() => setActive(i)}
                >
                  <span className="timeline-tab-short">{p.short}</span>
                  <span className="timeline-tab-label">{p.label}</span>
                </button>
              ))}
            </div>

            {activePeriod && (
              <div className="timeline-panel" style={{ borderColor: activePeriod.color }}>
                <div className="timeline-panel-header">
                  <div className="timeline-period-label" style={{ color: activePeriod.color }}>
                    {activePeriod.label}
                  </div>
                  <div className="timeline-panel-badges">
                    {activePeriod.data.quadrant && (
                      <span className="timeline-badge" style={{ background: qColor + "22", color: qColor, borderColor: qColor }}>
                        วง: {activePeriod.data.quadrant}
                      </span>
                    )}
                    {activePeriod.data.energy && (
                      <span className="timeline-badge" style={{ background: eColor + "22", color: eColor, borderColor: eColor }}>
                        {activePeriod.data.energy}
                      </span>
                    )}
                  </div>
                </div>
                {activePeriod.data.meaning && (
                  <p className="timeline-meaning">{activePeriod.data.meaning}</p>
                )}
                {activePeriod.data.actions.length > 0 && (
                  <div className="timeline-actions">
                    <span className="career-field-label">ลงมือทำ</span>
                    {activePeriod.data.actions.map((a, i) => (
                      <div key={i} className="timeline-action-item">
                        <span style={{ color: activePeriod.color }}>→</span>
                        <span>{a}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Mini timeline strip */}
            <div className="timeline-strip">
              {parsed.periods.map((p, i) => (
                <button key={i} className="timeline-strip-item" onClick={() => setActive(i)}>
                  <div className={`timeline-strip-dot ${active === i ? "active" : ""}`} style={{ background: p.color }} />
                  <span className="timeline-strip-label" style={{ color: active === i ? p.color : "var(--star-dim)" }}>{p.short}</span>
                  {p.data.quadrant && (
                    <span className="timeline-strip-quad" style={{ color: QUADRANT_COLOR[p.data.quadrant] ?? "var(--star-dim)" }}>
                      {p.data.quadrant}
                    </span>
                  )}
                  {i < parsed.periods.length - 1 && <div className="timeline-strip-line" />}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Golden window */}
        {parsed?.golden && (
          <div className="ikigai-star-card">
            <span className="ikigai-star-icon" style={{ color:"#fbbf24" }}>✦</span>
            <p className="ikigai-star-text">{parsed.golden}</p>
          </div>
        )}

        {hasBirth && !loading && (
          <div style={{textAlign:"center",marginTop:16,marginBottom:32}}>
            <button className="ghost-button" onClick={() => load(birthMeta, userName)} disabled={generating}>
              {generating ? "กำลังสร้าง…" : "↻ คำนวณ Timeline ใหม่"}
            </button>
          </div>
        )}
      </div>

      <footer className="legal-line">Ikigai Timeline คำนวณจาก transit ดาวจริง ใช้เป็นมุมมองประกอบ ไม่ใช่การรับประกัน</footer>
    </main>
  );
}
