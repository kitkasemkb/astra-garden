"use client";
import { useState } from "react";
import UserMenu from "@/components/UserMenu";

const SIGNS = [
  { id:"aries",       th:"เมษ",      en:"Aries",       date:"21 มี.ค. – 19 เม.ย.", symbol:"♈", color:"rgba(255,80,80,.15)" },
  { id:"taurus",      th:"พฤษภ",     en:"Taurus",      date:"20 เม.ย. – 20 พ.ค.", symbol:"♉", color:"rgba(80,200,120,.15)" },
  { id:"gemini",      th:"เมถุน",    en:"Gemini",       date:"21 พ.ค. – 20 มิ.ย.", symbol:"♊", color:"rgba(255,220,80,.15)" },
  { id:"cancer",      th:"กรกฎ",     en:"Cancer",       date:"21 มิ.ย. – 22 ก.ค.", symbol:"♋", color:"rgba(160,200,255,.15)" },
  { id:"leo",         th:"สิงห์",    en:"Leo",          date:"23 ก.ค. – 22 ส.ค.", symbol:"♌", color:"rgba(255,180,60,.15)" },
  { id:"virgo",       th:"กันย์",    en:"Virgo",        date:"23 ส.ค. – 22 ก.ย.", symbol:"♍", color:"rgba(100,220,180,.15)" },
  { id:"libra",       th:"ตุลย์",    en:"Libra",        date:"23 ก.ย. – 22 ต.ค.", symbol:"♎", color:"rgba(220,160,255,.15)" },
  { id:"scorpio",     th:"พิจิก",    en:"Scorpio",      date:"23 ต.ค. – 21 พ.ย.", symbol:"♏", color:"rgba(180,60,100,.15)" },
  { id:"sagittarius", th:"ธนู",      en:"Sagittarius",  date:"22 พ.ย. – 21 ธ.ค.", symbol:"♐", color:"rgba(255,140,60,.15)" },
  { id:"capricorn",   th:"มังกร",    en:"Capricorn",    date:"22 ธ.ค. – 19 ม.ค.", symbol:"♑", color:"rgba(100,140,200,.15)" },
  { id:"aquarius",    th:"กุมภ์",    en:"Aquarius",     date:"20 ม.ค. – 18 ก.พ.", symbol:"♒", color:"rgba(79,200,255,.15)" },
  { id:"pisces",      th:"มีน",      en:"Pisces",       date:"19 ก.พ. – 20 มี.ค.", symbol:"♓", color:"rgba(167,139,250,.15)" },
];

const ASPECTS = ["ความรัก","การงาน","การเงิน","สุขภาพ","โชคลาภ"];

export default function HoroscopePage() {
  const [selected, setSelected] = useState<typeof SIGNS[0] | null>(null);
  const [reading, setReading] = useState("");
  const [loading, setLoading] = useState(false);
  const today = new Date().toLocaleDateString("th-TH", { weekday:"long", year:"numeric", month:"long", day:"numeric" });

  async function getHoroscope(sign: typeof SIGNS[0]) {
    setSelected(sign);
    setReading("");
    setLoading(true);
    try {
      const res = await fetch("/api/horoscope", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sign: sign.id, signTh: sign.th, date: today }),
      });
      if (!res.body) throw new Error();
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = JSON.parse(line.slice(6));
          if (data.type === "delta") setReading(p => p + data.text);
          if (data.type === "done") setLoading(false);
        }
      }
    } catch {
      setReading("เกิดข้อผิดพลาด กรุณาลองใหม่");
      setLoading(false);
    }
  }

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
            <span>ดวงรายวัน</span>
            <span>{today}</span>
          </div>
          <UserMenu />
        </div>
      </header>

      <div className="horoscope-layout">
        <div className="horoscope-header">
          <span className="kicker">Daily Horoscope</span>
          <h1 className="horoscope-title">ดวงประจำวัน</h1>
          <p>เลือกราศีของคุณเพื่อดูคำทำนายประจำวันนี้</p>
        </div>

        <div className="signs-grid">
          {SIGNS.map(s => (
            <button
              key={s.id}
              className={`sign-card ${selected?.id === s.id ? "active" : ""}`}
              style={{ "--sign-color": s.color } as React.CSSProperties}
              onClick={() => getHoroscope(s)}
            >
              <span className="sign-symbol">{s.symbol}</span>
              <strong>{s.th}</strong>
              <small>{s.en}</small>
              <span className="sign-date">{s.date}</span>
            </button>
          ))}
        </div>

        {(selected || loading) && (
          <div className="horoscope-reading">
            {selected && (
              <div className="horoscope-reading-header">
                <span className="sign-symbol-lg">{selected.symbol}</span>
                <div>
                  <h2>ราศี{selected.th} ({selected.en})</h2>
                  <p>{today}</p>
                </div>
              </div>
            )}

            {loading && !reading && (
              <div style={{ display:"flex", gap:12, alignItems:"center", color:"var(--aurora)", marginBottom:16 }}>
                <div className="draw-orbit" style={{width:36,height:36}} />
                <span>ดาวกำลังส่งพลังงานมาให้…</span>
              </div>
            )}

            {reading && (
              <div className="horoscope-text">
                {ASPECTS.map(aspect => {
                  const regex = new RegExp(`\\*\\*${aspect}\\*\\*[:\\s]*([^*]+)`, "i");
                  const match = reading.match(regex);
                  return null; // rendered inline below
                })}
                {reading.split("\n").map((line, i) => {
                  if (line.startsWith("**") && line.endsWith("**")) {
                    return <h3 key={i} className="horoscope-section">{line.replace(/\*\*/g,"")}</h3>;
                  }
                  if (!line.trim()) return <br key={i}/>;
                  return <p key={i}>{line.replace(/\*\*/g,"")}</p>;
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <footer className="legal-line">
        ดวงรายวันเป็นมุมมองประกอบการไตร่ตรอง ไม่ใช่การรับประกันอนาคต
      </footer>
    </main>
  );
}
