"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import UserMenu from "@/components/UserMenu";

const CATEGORIES = [
  { id: "career",       label: "การงาน",        icon: "◉", hint: "ลาออก เปลี่ยนงาน เลื่อนตำแหน่ง" },
  { id: "business",     label: "ธุรกิจ",         icon: "✦", hint: "เปิดกิจการ ลงทุน ขยายธุรกิจ" },
  { id: "relationship", label: "ความสัมพันธ์",   icon: "♥", hint: "เริ่มความสัมพันธ์ แต่งงาน เลิกกัน" },
  { id: "money",        label: "การเงิน",        icon: "◈", hint: "ซื้อบ้าน ลงทุน กู้เงิน" },
  { id: "move",         label: "การย้าย",        icon: "→", hint: "ย้ายบ้าน ย้ายเมือง ย้ายประเทศ" },
  { id: "education",    label: "การศึกษา",       icon: "✧", hint: "เรียนต่อ เปลี่ยนสาย คอร์สใหม่" },
];

const VERDICT_META: Record<string, { color: string; bg: string; icon: string; label: string }> = {
  "เอื้ออย่างยิ่ง":   { color: "#34d399", bg: "rgba(52,211,153,.15)",  icon: "✦✦", label: "เอื้ออย่างยิ่ง" },
  "เอื้อ":            { color: "#5dcfff", bg: "rgba(93,207,255,.12)",  icon: "✦",  label: "เอื้อ" },
  "กลางๆ":            { color: "#fbbf24", bg: "rgba(251,191,36,.12)",  icon: "◈",  label: "กลางๆ" },
  "ท้าทาย":           { color: "#f87171", bg: "rgba(248,113,113,.12)", icon: "⚡",  label: "ท้าทาย" },
  "ท้าทายอย่างยิ่ง":  { color: "#f472b6", bg: "rgba(244,114,182,.12)", icon: "⚡⚡", label: "ท้าทายอย่างยิ่ง" },
};

const SECTION_KEYS = [
  "คำตัดสิน",
  "ดาวที่ส่งผลต่อการตัดสินใจนี้",
  "ถ้าลงมือวันนี้",
  "หน้าต่างเวลาที่ดีที่สุด",
  "สิ่งที่ควรทำก่อนตัดสินใจ",
  "ข้อความจากดวงดาว",
] as const;

function buildSectionMap(raw: string): Map<string, string> {
  const marked = raw
    .replace(/^#{1,3}\s+(.+)$/gm, "@@HDR@@$1@@END@@")
    .replace(/^\*\*([^*\n]{2,60})\*\*\s*$/gm, "@@HDR@@$1@@END@@");
  const map = new Map<string, string>();
  const pat = /@@HDR@@([^@]+)@@END@@/g;
  let lastIdx = 0, lastTitle = "", m: RegExpExecArray | null;
  while ((m = pat.exec(marked)) !== null) {
    if (lastTitle) map.set(lastTitle.trim(), marked.slice(lastIdx, m.index).replace(/@@HDR@@[^@]+@@END@@/g,"").replace(/\*\*/g,"").trim());
    lastTitle = m[1].trim(); lastIdx = m.index + m[0].length;
  }
  if (lastTitle) map.set(lastTitle.trim(), marked.slice(lastIdx).replace(/@@HDR@@[^@]+@@END@@/g,"").replace(/\*\*/g,"").trim());
  return map;
}

function getSection(map: Map<string, string>, key: string): string {
  for (const [k, v] of map) {
    if (k.includes(key) || key.includes(k)) return v;
  }
  return "";
}

function detectVerdict(text: string): string {
  for (const key of Object.keys(VERDICT_META)) {
    if (text.includes(key)) return key;
  }
  return "";
}

export default function DecisionPage() {
  const router = useRouter();
  const [userName, setUserName]     = useState("");
  const [hasBirth, setHasBirth]     = useState(false);
  const [birthMeta, setBirthMeta]   = useState<Record<string,unknown>>({});
  const [loading, setLoading]       = useState(true);
  const [generating, setGenerating] = useState(false);
  const [reading, setReading]       = useState("");
  const [decision, setDecision]     = useState("");
  const [category, setCategory]     = useState("career");
  const [hasResult, setHasResult]   = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const today = new Date().toLocaleDateString("th-TH", { weekday:"long", year:"numeric", month:"long", day:"numeric" });

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
      }
      setLoading(false);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function analyse() {
    if (!decision.trim() || generating) return;
    setGenerating(true); setReading(""); setHasResult(false);
    try {
      const ce = Number(birthMeta.birth_year_be) - 543;
      const birthDate = `${ce}-${String(birthMeta.birth_month).padStart(2,"0")}-${String(birthMeta.birth_day).padStart(2,"0")}`;
      const birthTime = `${String(birthMeta.birth_hour).padStart(2,"0")}:${String(birthMeta.birth_minute ?? 0).padStart(2,"0")}`;

      const res = await fetch("/api/decision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          birthDate, birthTime,
          latitude: birthMeta.latitude, longitude: birthMeta.longitude,
          province: birthMeta.province, userName, decision,
          category: CATEGORIES.find(c => c.id === category)?.label ?? category,
        }),
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
          if (d.type === "delta") setReading(p => p + d.text);
          if (d.type === "done")  { setGenerating(false); setHasResult(true); }
          if (d.type === "error") { setReading(d.message); setGenerating(false); }
        }
      }
    } catch { setGenerating(false); }
  }

  const sectionMap = reading.length > 50 ? buildSectionMap(reading) : new Map<string, string>();
  const verdictBlock = getSection(sectionMap, "คำตัดสิน");
  const verdict = detectVerdict(verdictBlock);
  const vm = VERDICT_META[verdict];
  const planets  = getSection(sectionMap, "ดาวที่ส่งผล");
  const today_   = getSection(sectionMap, "ถ้าลงมือวันนี้");
  const window_  = getSection(sectionMap, "หน้าต่างเวลา");
  const checklist = getSection(sectionMap, "สิ่งที่ควรทำก่อน");
  const starmsg  = getSection(sectionMap, "ข้อความจากดวงดาว");

  const currentCat = CATEGORIES.find(c => c.id === category)!;

  return (
    <main className="premium-shell">
      <div className="grain" />
      <header className="studio-topbar">
        <a href="/" className="brand-lockup" style={{textDecoration:"none"}}>
          <span className="brand-sigil">✦</span>
          <span><strong>ASTRA GARDEN</strong><small>Astrology translated into gentle guidance</small></span>
        </a>
        <div className="topbar-right">
          <div className="topbar-meta"><span>Decision Engine</span><small style={{fontSize:11}}>{today}</small></div>
          <UserMenu />
        </div>
      </header>

      <div className="decision-layout">

        {/* Header */}
        <div className="horoscope-header">
          <span className="kicker">✦ Astro Decision Engine</span>
          <h1 className="horoscope-title" style={{fontSize:"clamp(26px,5vw,56px)",wordBreak:"keep-all"}}>
            ดวงรองรับการตัดสินใจนี้ไหม?
          </h1>
          <p style={{color:"var(--star-dim)",marginTop:4,maxWidth:560,margin:"8px auto 0"}}>
            พิมพ์การตัดสินใจที่กำลังลังเล — ดาวจะบอกว่าจังหวะนี้เหมาะหรือไม่ และควรรอช่วงไหน
          </p>
        </div>

        {/* No birth */}
        {!loading && !hasBirth && (
          <div style={{textAlign:"center",padding:"40px 20px"}}>
            <p style={{marginBottom:20,color:"var(--star-dim)"}}>กรุณากรอกข้อมูลเกิดเพื่อใช้ Decision Engine</p>
            <button className="luxury-button" onClick={() => router.push("/auth/birth")}>กรอกข้อมูลเกิด →</button>
          </div>
        )}

        {/* Input form */}
        {!loading && hasBirth && (
          <div className="decision-form-card">
            {/* Category selector */}
            <div className="decision-cats">
              {CATEGORIES.map(c => (
                <button
                  key={c.id}
                  className={`decision-cat-btn ${category === c.id ? "active" : ""}`}
                  onClick={() => setCategory(c.id)}
                >
                  <span>{c.icon}</span>
                  <span>{c.label}</span>
                </button>
              ))}
            </div>

            <div className="decision-input-wrap">
              <textarea
                ref={textareaRef}
                className="decision-textarea"
                value={decision}
                onChange={e => setDecision(e.target.value)}
                placeholder={`พิมพ์การตัดสินใจของคุณ เช่น "${currentCat.hint}"`}
                rows={3}
                disabled={generating}
                onKeyDown={e => {
                  if (e.key === "Enter" && !e.shiftKey && decision.trim()) {
                    e.preventDefault(); analyse();
                  }
                }}
              />
              <button
                className="decision-submit-btn"
                onClick={analyse}
                disabled={!decision.trim() || generating}
              >
                {generating ? (
                  <div className="draw-orbit" style={{width:22,height:22}} />
                ) : "ถามดาว →"}
              </button>
            </div>
            <small style={{color:"var(--star-dim)",fontSize:11}}>
              กด Enter หรือ "ถามดาว" เพื่อวิเคราะห์ • Shift+Enter ขึ้นบรรทัดใหม่
            </small>
          </div>
        )}

        {/* Generating state */}
        {generating && (
          <div style={{display:"flex",gap:12,alignItems:"center",color:"var(--aurora)",justifyContent:"center",padding:"8px 0"}}>
            <div className="draw-orbit" style={{width:32,height:32}} />
            <span>ดวงดาวกำลังวิเคราะห์การตัดสินใจของคุณ…</span>
          </div>
        )}

        {/* VERDICT — featured */}
        {verdictBlock && vm && (
          <div className="decision-verdict-card" style={{borderColor: vm.color, background: vm.bg}}>
            <div className="decision-verdict-badge" style={{background: vm.color}}>
              <span>{vm.icon}</span>
              <span>{vm.label}</span>
            </div>
            <div className="decision-question-echo">
              <span style={{color:"var(--star-dim)",fontSize:13}}>การตัดสินใจ:</span>
              <span className="decision-question-text">"{decision}"</span>
            </div>
            <p className="decision-verdict-body">
              {verdictBlock.replace(verdict, "").trim()}
            </p>
          </div>
        )}

        {/* Detail sections */}
        {(planets || today_ || window_) && (
          <div className="decision-detail-grid">
            {planets && (
              <div className="decision-detail-card">
                <span className="decision-detail-icon" style={{color:"var(--aurora)"}}>◉</span>
                <h3 className="decision-detail-title">ดาวที่ส่งผล</h3>
                <div className="decision-detail-body">
                  {planets.split("\n").filter(l=>l.trim()).map((line,i)=>(
                    <p key={i}>{line.replace(/^[-•]\s*/,"")}</p>
                  ))}
                </div>
              </div>
            )}
            {today_ && (
              <div className="decision-detail-card">
                <span className="decision-detail-icon" style={{color:"#fbbf24"}}>⚡</span>
                <h3 className="decision-detail-title">ถ้าลงมือวันนี้</h3>
                <div className="decision-detail-body">
                  {today_.split("\n").filter(l=>l.trim()).map((line,i)=>(
                    <p key={i}>{line.replace(/^[-•]\s*/,"")}</p>
                  ))}
                </div>
              </div>
            )}
            {window_ && (
              <div className="decision-detail-card decision-detail-wide">
                <span className="decision-detail-icon" style={{color:"#34d399"}}>◈</span>
                <h3 className="decision-detail-title">หน้าต่างเวลาที่ดีที่สุด</h3>
                <div className="decision-detail-body">
                  {window_.split("\n").filter(l=>l.trim()).map((line,i)=>(
                    <p key={i}>{line.replace(/^[-•]\s*/,"")}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Checklist */}
        {checklist && (
          <div className="decision-checklist-card">
            <div className="decision-checklist-header">
              <span style={{color:"#a78bfa",fontSize:"1.3rem"}}>✦</span>
              <h3 style={{margin:0,color:"#a78bfa"}}>สิ่งที่ควรทำก่อนตัดสินใจ</h3>
            </div>
            <div className="decision-checklist-body">
              {checklist.split("\n").filter(l=>l.trim()).map((line,i)=>(
                <div key={i} className="decision-check-item">
                  <span className="decision-check-num">{String(i+1).padStart(2,"0")}</span>
                  <p>{line.replace(/^[0-9]+[\.\)]\s*|^[-•]\s*/,"")}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Star message */}
        {starmsg && (
          <div className="shadow-message-card">
            <div className="shadow-message-glyph">✦</div>
            <p className="shadow-message-text">{starmsg}</p>
          </div>
        )}

        {/* Ask again */}
        {hasResult && (
          <div style={{textAlign:"center",marginBottom:32}}>
            <button className="ghost-button" onClick={() => {
              setReading(""); setHasResult(false); setDecision("");
              setTimeout(() => textareaRef.current?.focus(), 100);
            }}>
              ← ถามการตัดสินใจใหม่
            </button>
          </div>
        )}

      </div>

      <footer className="legal-line">
        Astro Decision Engine วิเคราะห์จากดวงกำเนิดและ transit ดาวจริง ใช้เป็นมุมมองประกอบการตัดสินใจ ไม่ใช่การรับประกันผลลัพธ์
      </footer>
    </main>
  );
}
