"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import UserMenu from "@/components/UserMenu";

const PERIOD_META = [
  { label: "ตอนนี้",   short: "Now",  color: "#5dcfff" },
  { label: "1 เดือน",  short: "+1M",  color: "#a78bfa" },
  { label: "3 เดือน",  short: "+3M",  color: "#34d399" },
  { label: "6 เดือน",  short: "+6M",  color: "#fbbf24" },
  { label: "12 เดือน", short: "+12M", color: "#f472b6" },
];

// แยก raw text ออกเป็น sections — รองรับทั้ง **Header** และ ## Header
function splitSections(raw: string): { title: string; body: string }[] {
  // normalize: แปลง ## Header เป็น **Header** ก่อน
  const normalized = raw
    .replace(/^#{1,3}\s+(.+)$/gm, "**$1**")
    .replace(/\*\*\s*\*\*/g, ""); // ลบ ** ซ้อนกัน
  const parts = normalized.split(/\*\*([^*\n]+)\*\*/);
  const result: { title: string; body: string }[] = [];
  for (let i = 1; i < parts.length; i += 2) {
    const title = parts[i].trim();
    const body  = (parts[i + 1] ?? "").trim();
    if (title) result.push({ title, body });
  }
  return result;
}

// หา section ที่มี keyword อยู่ใน title (case-insensitive)
function findSection(sections: { title: string; body: string }[], keyword: string) {
  return sections.find(s => s.title.includes(keyword)) ?? null;
}

function parseSections(raw: string) {
  const sections = splitSections(raw);
  const overviewSec = findSection(sections, "ภาพรวม");
  const goldenSec   = findSection(sections, "หน้าต่างทอง");
  const periodKeywords = ["ตอนนี้", "1 เดือน", "3 เดือน", "6 เดือน", "12 เดือน"];
  const periods = PERIOD_META.map((p, i) => {
    const sec = findSection(sections, periodKeywords[i]);
    return { ...p, body: sec?.body ?? "" };
  });
  return {
    overview: overviewSec?.body ?? "",
    golden:   goldenSec?.body ?? "",
    periods,
  };
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
                </div>
                {activePeriod.body ? (
                  <div className="timeline-raw">
                    {activePeriod.body.split("\n").filter(l => l.trim()).map((line, i) => {
                      const isAction = /^[-•*]\s|^\d+[.)]\s/.test(line.trim());
                      const clean = line.replace(/\*\*/g, "").replace(/^[-•*]\s*|^\d+[.)]\s*/,"").trim();
                      return isAction ? (
                        <div key={i} className="timeline-action-item">
                          <span style={{ color: activePeriod.color }}>→</span>
                          <span>{clean}</span>
                        </div>
                      ) : (
                        <p key={i}>{clean}</p>
                      );
                    })}
                  </div>
                ) : (
                  <p className="timeline-meaning" style={{ color: "var(--star-dim)", fontStyle: "italic" }}>
                    กำลังโหลด…
                  </p>
                )}
              </div>
            )}

            {/* Mini timeline strip */}
            <div className="timeline-strip">
              {parsed.periods.map((p, i) => (
                <button key={i} className="timeline-strip-item" onClick={() => setActive(i)}>
                  <div className={`timeline-strip-dot ${active === i ? "active" : ""}`} style={{ background: p.color }} />
                  <span className="timeline-strip-label" style={{ color: active === i ? p.color : "var(--star-dim)" }}>{p.short}</span>
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
