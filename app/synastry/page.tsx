"use client";
import { useState, useMemo } from "react";

const MONTHS_TH = ["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"];
const DAYS = Array.from({length:31},(_,i)=>i+1);
const YEARS_BE = Array.from({length:90},(_,i)=>2568-i);
const HOURS = Array.from({length:24},(_,i)=>i);
const MINUTES = Array.from({length:60},(_,i)=>i);

type PersonData = { name:string; yearBE:string; month:string; day:string; hour:string; minute:string };
const emptyPerson = (): PersonData => ({ name:"", yearBE:"", month:"", day:"", hour:"", minute:"" });

function BirthForm({ label, emoji, data, onChange }: {
  label: string; emoji: string; data: PersonData; onChange: (d: PersonData) => void;
}) {
  const set = (k: keyof PersonData) => (e: React.ChangeEvent<HTMLSelectElement|HTMLInputElement>) =>
    onChange({ ...data, [k]: e.target.value });
  return (
    <div className="synastry-person-card">
      <div className="synastry-person-header">
        <span className="synastry-emoji">{emoji}</span>
        <h3>{label}</h3>
      </div>
      <label className="lux-field" style={{ marginBottom:14 }}>
        <span>ชื่อ (ไม่บังคับ)</span>
        <input value={data.name} onChange={set("name")} placeholder="เช่น A หรือ คุณ..." />
      </label>
      <div className="synastry-date-grid">
        <label className="lux-field">
          <span>วัน</span>
          <select value={data.day} onChange={set("day")}>
            <option value="">วัน</option>
            {DAYS.map(d=><option key={d} value={d}>{d}</option>)}
          </select>
        </label>
        <label className="lux-field">
          <span>เดือน</span>
          <select value={data.month} onChange={set("month")}>
            <option value="">เดือน</option>
            {MONTHS_TH.map((m,i)=><option key={i} value={i+1}>{m}</option>)}
          </select>
        </label>
        <label className="lux-field">
          <span>ปี พ.ศ.</span>
          <select value={data.yearBE} onChange={set("yearBE")}>
            <option value="">ปี</option>
            {YEARS_BE.map(y=><option key={y} value={y}>{y}</option>)}
          </select>
        </label>
      </div>
      <div className="synastry-date-grid" style={{gridTemplateColumns:"1fr 1fr"}}>
        <label className="lux-field">
          <span>ชั่วโมง</span>
          <select value={data.hour} onChange={set("hour")}>
            <option value="">ชั่วโมง</option>
            {HOURS.map(h=><option key={h} value={h}>{String(h).padStart(2,"0")} น.</option>)}
          </select>
        </label>
        <label className="lux-field">
          <span>นาที</span>
          <select value={data.minute} onChange={set("minute")}>
            <option value="">นาที</option>
            {MINUTES.map(m=><option key={m} value={m}>{String(m).padStart(2,"0")}</option>)}
          </select>
        </label>
      </div>
    </div>
  );
}

export default function SynastryPage() {
  const [personA, setPersonA] = useState<PersonData>(emptyPerson());
  const [personB, setPersonB] = useState<PersonData>(emptyPerson());
  const [reading, setReading] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(() =>
    personA.yearBE && personA.month && personA.day && personA.hour !== "" &&
    personB.yearBE && personB.month && personB.day && personB.hour !== "",
  [personA, personB]);

  function toBirthDate(p: PersonData) {
    const ce = Number(p.yearBE) - 543;
    return {
      birthDate: `${ce}-${String(p.month).padStart(2,"0")}-${String(p.day).padStart(2,"0")}`,
      birthTime: `${String(p.hour).padStart(2,"0")}:${String(p.minute||0).padStart(2,"0")}`,
    };
  }

  async function startReading() {
    setLoading(true);
    setReading("");
    try {
      const res = await fetch("/api/synastry", {
        method: "POST",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify({
          personA: { name: personA.name || "คนที่ 1", ...toBirthDate(personA) },
          personB: { name: personB.name || "คนที่ 2", ...toBirthDate(personB) },
        }),
      });
      if (!res.body) throw new Error();
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream:true });
        const lines = buf.split("\n"); buf = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = JSON.parse(line.slice(6));
          if (data.type === "delta") setReading(p => p + data.text);
          if (data.type === "done") setLoading(false);
          if (data.type === "error") { setReading(data.message); setLoading(false); }
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
        <a href="/" className="brand-lockup" style={{textDecoration:"none"}}>
          <span className="brand-sigil">✦</span>
          <span><strong>ASTRA GARDEN</strong><small>Astrology translated into gentle guidance</small></span>
        </a>
        <div className="topbar-meta"><span>Synastry</span><span>ความเข้ากันของดวง</span></div>
      </header>

      <div className="synastry-layout">
        <div className="synastry-header">
          <span className="kicker">✦ Synastry Reading</span>
          <h1 className="synastry-title">ดวงของคุณ<em>เข้ากันแค่ไหน</em></h1>
          <p>ใส่วันเกิดของทั้งสองคน ระบบจะเปรียบเทียบดวงและวิเคราะห์ความเข้ากันในทุกมิติ</p>
        </div>

        <div className="synastry-forms">
          <BirthForm label="คนที่ 1" emoji="🌙" data={personA} onChange={setPersonA} />
          <div className="synastry-vs">💞</div>
          <BirthForm label="คนที่ 2" emoji="☀️" data={personB} onChange={setPersonB} />
        </div>

        <div style={{textAlign:"center", marginTop:24}}>
          <button className="luxury-button" onClick={startReading} disabled={!canSubmit || loading} style={{minWidth:240}}>
            {loading ? "กำลังวิเคราะห์ดวง…" : "วิเคราะห์ความเข้ากัน"}
          </button>
        </div>

        {(reading || loading) && (
          <div className="synastry-result">
            {loading && !reading && (
              <div style={{display:"flex",gap:12,alignItems:"center",color:"var(--aurora)"}}>
                <div className="draw-orbit" style={{width:40,height:40}}/>
                <span>ดาวกำลังเปรียบเทียบดวงทั้งสองดวง…</span>
              </div>
            )}
            {reading && (
              <div className="synastry-text">
                {reading.split("\n").map((line, i) => {
                  if (line.startsWith("**") && line.endsWith("**"))
                    return <h3 key={i} className="synastry-section">{line.replace(/\*\*/g,"")}</h3>;
                  if (!line.trim()) return <br key={i}/>;
                  return <p key={i}>{line.replace(/\*\*/g,"")}</p>;
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <footer className="legal-line">คำทำนายนี้เป็นมุมมองประกอบ ไม่ใช่การรับประกันความสัมพันธ์</footer>
    </main>
  );
}
