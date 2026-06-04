"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import UserMenu from "@/components/UserMenu";
import BirthLocationPicker from "@/components/BirthLocationPicker";

const MONTHS_TH = ["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"];
const DAYS    = Array.from({length:31},(_,i)=>i+1);
const HOURS   = Array.from({length:24},(_,i)=>i);
const MINUTES = Array.from({length:60},(_,i)=>i);
const YEARS_BE = Array.from({length:90},(_,i)=>2568-i);

// normalize ## headers → **headers** แล้วหา section
function normalizeHeaders(raw: string): string {
  return raw.replace(/^#{1,3}\s+(.+)$/gm, "**$1**");
}

function parseSection(raw: string, title: string) {
  const normalized = normalizeHeaders(raw);
  const escaped = title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // match **title** หรือ title ที่ขึ้นต้น section (loose)
  const pattern = new RegExp(
    `\\*\\*[^*]*${escaped}[^*]*\\*\\*([\\s\\S]*?)(?=\\*\\*[^*]+\\*\\*|$)`, "i"
  );
  return normalized.match(pattern)?.[1]?.trim().replace(/\*\*/g, "") ?? "";
}

export default function RelationshipIkigaiPage() {
  const router = useRouter();
  const [userName, setUserName]     = useState("");
  const [hasBirth, setHasBirth]     = useState(false);
  const [myMeta, setMyMeta]         = useState<Record<string,unknown>>({});
  const [reading, setReading]       = useState("");
  const [generating, setGenerating] = useState(false);
  const [ready, setReady]           = useState(false);
  const [showForm, setShowForm]     = useState(false);

  // Partner form state
  const [partnerName, setPartnerName]         = useState("");
  const [partnerDay, setPartnerDay]           = useState("");
  const [partnerMonth, setPartnerMonth]       = useState("");
  const [partnerYearBE, setPartnerYearBE]     = useState("");
  const [partnerHour, setPartnerHour]         = useState("");
  const [partnerMinute, setPartnerMinute]     = useState("");
  const [partnerCountry, setPartnerCountry]   = useState("Thailand");
  const [partnerProvince, setPartnerProvince] = useState("กรุงเทพมหานคร");
  const [partnerCity, setPartnerCity]         = useState("");
  const [partnerLat, setPartnerLat]           = useState(13.7563);
  const [partnerLon, setPartnerLon]           = useState(100.5018);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      const meta = data.session?.user?.user_metadata;
      if (!data.session) { router.push("/auth"); return; }
      if (meta?.birth_year_be) {
        setHasBirth(true);
        setMyMeta(meta);
        const name = meta.full_name || meta.display_name || data.session.user.email?.split("@")[0] || "";
        setUserName(String(name));
        setShowForm(true);
      } else {
        setShowForm(false);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canSubmit = partnerDay && partnerMonth && partnerYearBE && partnerHour !== "" && partnerMinute !== "";

  async function analyse() {
    if (!canSubmit) return;
    setGenerating(true); setReading(""); setReady(false);
    try {
      const myCE = Number(myMeta.birth_year_be) - 543;
      const myBirthDate = `${myCE}-${String(myMeta.birth_month).padStart(2,"0")}-${String(myMeta.birth_day).padStart(2,"0")}`;
      const myBirthTime = `${String(myMeta.birth_hour).padStart(2,"0")}:${String(myMeta.birth_minute ?? 0).padStart(2,"0")}`;
      const pCE = Number(partnerYearBE) - 543;
      const pBirthDate = `${pCE}-${partnerMonth.padStart(2,"0")}-${partnerDay.padStart(2,"0")}`;
      const pBirthTime = `${partnerHour.padStart(2,"0")}:${partnerMinute.padStart(2,"0")}`;

      const res = await fetch("/api/relationship-ikigai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          birthDate: myBirthDate, birthTime: myBirthTime,
          latitude: myMeta.latitude, longitude: myMeta.longitude, province: myMeta.province, userName,
          partnerBirthDate: pBirthDate, partnerBirthTime: pBirthTime,
          partnerLatitude: partnerLat, partnerLongitude: partnerLon,
          partnerProvince, partnerName,
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
          if (d.type === "ready") setReady(true);
          if (d.type === "delta") setReading(p => p + d.text);
          if (d.type === "done")  setGenerating(false);
          if (d.type === "error") { setReading(d.message); setGenerating(false); }
        }
      }
    } catch { setGenerating(false); }
  }

  const me = userName || "คุณ";
  const partner = partnerName || "คู่ของคุณ";
  const myIkigai      = parseSection(reading, `Ikigai ของ ${me}`);
  const partnerIkigai = parseSection(reading, `Ikigai ของ ${partner}`);
  const synergy       = parseSection(reading, "จุดที่เสริมกัน");
  const conflict      = parseSection(reading, "จุดที่อาจขัดกัน");
  const power         = parseSection(reading, "พลังของคู่นี้เมื่ออยู่ด้วยกัน");
  const path          = parseSection(reading, "วิธีเดินทางสู่ Ikigai ร่วมกัน");
  const message       = parseSection(reading, "ข้อความจากดวงดาวถึงคู่นี้");

  return (
    <main className="premium-shell">
      <div className="grain" />
      <header className="studio-topbar">
        <a href="/" className="brand-lockup" style={{textDecoration:"none"}}>
          <span className="brand-sigil">✦</span>
          <span><strong>ASTRA GARDEN</strong><small>Astrology translated into gentle guidance</small></span>
        </a>
        <div className="topbar-right">
          <div className="topbar-meta"><span>Relationship Ikigai</span><small style={{fontSize:11}}>Ikigai ของสองคน</small></div>
          <UserMenu />
        </div>
      </header>

      <div className="ikigai-layout">
        <div className="horoscope-header">
          <span className="kicker">♥ Relationship Ikigai</span>
          <h1 className="horoscope-title" style={{fontSize:"clamp(26px,5vw,58px)",wordBreak:"keep-all"}}>
            Ikigai ของสองคน
          </h1>
          <p style={{color:"var(--star-dim)",marginTop:4,maxWidth:560,margin:"8px auto 0"}}>
            เปรียบ Ikigai จากดวงชะตาของคุณกับคู่ — ดูว่าจุดประสงค์ชีวิตเสริมหรือขัดกันในจุดใด
          </p>
        </div>

        {!hasBirth && (
          <div style={{textAlign:"center",padding:"40px 20px"}}>
            <p style={{marginBottom:20,color:"var(--star-dim)"}}>กรุณากรอกข้อมูลเกิดของคุณก่อน</p>
            <button className="luxury-button" onClick={() => router.push("/auth/birth")}>กรอกข้อมูลเกิด →</button>
          </div>
        )}

        {/* Partner form */}
        {showForm && !ready && !generating && (
          <div className="ri-form-card">
            <span className="kicker">กรอกข้อมูลเกิดของคู่</span>
            <h2 style={{margin:"8px 0 20px",fontSize:"clamp(18px,3vw,22px)"}}>ข้อมูลเกิดของคู่</h2>

            <label className="lux-field" style={{marginBottom:16}}>
              <span>ชื่อคู่ (ไม่บังคับ)</span>
              <input value={partnerName} onChange={e => setPartnerName(e.target.value)} placeholder="เช่น มายด์, แบงค์" />
            </label>

            <div className="birth-grid" style={{gap:12,marginBottom:16}}>
              <label className="lux-field">
                <span>วันเกิด</span>
                <select value={partnerDay} onChange={e => setPartnerDay(e.target.value)}>
                  <option value="">-- วัน --</option>
                  {DAYS.map(d => <option key={d} value={String(d)}>{d}</option>)}
                </select>
              </label>
              <label className="lux-field">
                <span>เดือนเกิด</span>
                <select value={partnerMonth} onChange={e => setPartnerMonth(e.target.value)}>
                  <option value="">-- เดือน --</option>
                  {MONTHS_TH.map((m,i) => <option key={i} value={String(i+1)}>{m}</option>)}
                </select>
              </label>
              <label className="lux-field">
                <span>ปีเกิด (พ.ศ.)</span>
                <select value={partnerYearBE} onChange={e => setPartnerYearBE(e.target.value)}>
                  <option value="">-- ปี --</option>
                  {YEARS_BE.map(y => <option key={y} value={String(y)}>{y}</option>)}
                </select>
              </label>
            </div>

            <div className="birth-grid" style={{gap:12,marginBottom:16}}>
              <label className="lux-field">
                <span>เวลาเกิด (ชั่วโมง)</span>
                <select value={partnerHour} onChange={e => setPartnerHour(e.target.value)}>
                  <option value="">-- ชั่วโมง --</option>
                  {HOURS.map(h => <option key={h} value={String(h)}>{String(h).padStart(2,"0")} น.</option>)}
                </select>
              </label>
              <label className="lux-field">
                <span>นาที</span>
                <select value={partnerMinute} onChange={e => setPartnerMinute(e.target.value)}>
                  <option value="">-- นาที --</option>
                  {MINUTES.map(m => <option key={m} value={String(m)}>{String(m).padStart(2,"0")}</option>)}
                </select>
              </label>
            </div>

            <BirthLocationPicker
              country={partnerCountry}
              province={partnerProvince}
              city={partnerCity}
              lat={partnerLat}
              lon={partnerLon}
              onChangeCountry={setPartnerCountry}
              onChangeProvince={setPartnerProvince}
              onChangeCity={setPartnerCity}
              onChangeLat={setPartnerLat}
              onChangeLon={setPartnerLon}
            />

            <button className="luxury-button" onClick={analyse} disabled={!canSubmit} style={{width:"100%"}}>
              วิเคราะห์ Ikigai ร่วมกัน →
            </button>
          </div>
        )}

        {generating && (
          <div style={{display:"flex",gap:12,alignItems:"center",color:"var(--aurora)",padding:"20px 0",justifyContent:"center"}}>
            <div className="draw-orbit" style={{width:36,height:36}} />
            <span>ดวงดาวกำลังเปรียบ Ikigai ของสองคน…</span>
          </div>
        )}

        {/* Results */}
        {(myIkigai || partnerIkigai) && (
          <div className="ri-pair-grid">
            {myIkigai && (
              <div className="ri-ikigai-card" style={{borderColor:"#5dcfff",background:"rgba(93,207,255,.08)"}}>
                <span className="ri-ikigai-icon" style={{color:"#5dcfff"}}>✦</span>
                <span className="kicker" style={{color:"#5dcfff"}}>Ikigai ของ{me}</span>
                <p>{myIkigai}</p>
              </div>
            )}
            {partnerIkigai && (
              <div className="ri-ikigai-card" style={{borderColor:"#f472b6",background:"rgba(244,114,182,.08)"}}>
                <span className="ri-ikigai-icon" style={{color:"#f472b6"}}>♥</span>
                <span className="kicker" style={{color:"#f472b6"}}>Ikigai ของ{partner}</span>
                <p>{partnerIkigai}</p>
              </div>
            )}
          </div>
        )}

        {synergy && (
          <div className="ri-section-card" style={{borderColor:"#34d399",background:"rgba(52,211,153,.08)"}}>
            <div className="ri-section-header">
              <span style={{color:"#34d399",fontSize:"1.4rem"}}>◎</span>
              <h3 style={{color:"#34d399",margin:0}}>จุดที่เสริมกัน</h3>
            </div>
            <div className="ri-section-body">
              {synergy.split("\n").filter(l=>l.trim()).map((line,i) => (
                <p key={i}>{line.replace(/^เช่น:\s*/,"").replace(/\*\*/g,"")}</p>
              ))}
            </div>
          </div>
        )}

        {conflict && (
          <div className="ri-section-card" style={{borderColor:"#f87171",background:"rgba(248,113,113,.07)"}}>
            <div className="ri-section-header">
              <span style={{color:"#f87171",fontSize:"1.4rem"}}>⚡</span>
              <h3 style={{color:"#f87171",margin:0}}>จุดที่อาจขัดกัน</h3>
            </div>
            <div className="ri-section-body">
              {conflict.split("\n").filter(l=>l.trim()).map((line,i) => (
                <p key={i}>{line.replace(/^เช่น:\s*/,"").replace(/\*\*/g,"")}</p>
              ))}
            </div>
          </div>
        )}

        {power && (
          <div className="ri-power-card">
            <span className="ri-power-icon">✧</span>
            <span className="kicker" style={{color:"#a78bfa"}}>พลังของคู่นี้เมื่ออยู่ด้วยกัน</span>
            <p className="ri-power-body">{power}</p>
          </div>
        )}

        {path && (
          <div className="ikigai-path-section">
            <div className="transit-alerts-header">
              <span className="kicker">→ วิธีเดินทางสู่ Ikigai ร่วมกัน</span>
              <h2>ขั้นตอนสำหรับทั้งคู่</h2>
            </div>
            <div className="ikigai-path-body">
              {path.split("\n").filter(l=>l.trim()).map((line,i) => (
                <div key={i} className="ikigai-step">
                  <span className="ikigai-step-num" style={{color:"#fbbf24"}}>{String(i+1).padStart(2,"0")}</span>
                  <p>{line.replace(/^[0-9]+[\.\)]\s*/,"").replace(/\*\*/g,"")}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {message && (
          <div className="shadow-message-card">
            <div className="shadow-message-glyph">★</div>
            <p className="shadow-message-text">{message}</p>
          </div>
        )}

        {ready && !generating && (
          <div style={{textAlign:"center",marginTop:16,marginBottom:32}}>
            <button className="ghost-button" onClick={() => {setReading("");setReady(false);}}>
              ← เปลี่ยนข้อมูลคู่
            </button>
          </div>
        )}
      </div>

      <footer className="legal-line">Relationship Ikigai คำนวณจากดวงกำเนิดจริง ใช้เป็นมุมมองประกอบ ไม่ใช่การรับประกัน</footer>
    </main>
  );
}
