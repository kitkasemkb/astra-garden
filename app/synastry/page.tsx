"use client";
import { useState, useMemo, useEffect } from "react";
import UserMenu from "@/components/UserMenu";
import { createClient } from "@/lib/supabase";

const MONTHS_TH = ["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"];
const DAYS    = Array.from({length:31},(_,i)=>i+1);
const YEARS_BE = Array.from({length:90},(_,i)=>2568-i);
const HOURS   = Array.from({length:24},(_,i)=>i);
const MINUTES = Array.from({length:60},(_,i)=>i);

type PersonData = { name:string; yearBE:string; month:string; day:string; hour:string; minute:string };
const emptyPerson = (): PersonData => ({ name:"", yearBE:"", month:"", day:"", hour:"", minute:"0" });

function BirthForm({ label, emoji, data, onChange, locked }: {
  label: string; emoji: string; data: PersonData; onChange: (d: PersonData) => void; locked?: boolean;
}) {
  const set = (k: keyof PersonData) => (e: React.ChangeEvent<HTMLSelectElement|HTMLInputElement>) =>
    onChange({ ...data, [k]: e.target.value });
  return (
    <div className="synastry-person-card">
      <div className="synastry-person-header">
        <span className="synastry-emoji">{emoji}</span>
        <h3>{label}</h3>
        {locked && <span style={{ fontSize:11, color:"var(--aurora)", marginLeft:"auto" }}>✦ จากโปรไฟล์คุณ</span>}
      </div>
      <label className="lux-field" style={{ marginBottom:14 }}>
        <span>ชื่อ</span>
        <input value={data.name} onChange={set("name")} placeholder="เช่น ฉัน หรือ คุณ..." />
      </label>
      <div className="synastry-date-grid">
        <label className="lux-field">
          <span>วัน</span>
          <select value={data.day} onChange={set("day")} disabled={locked}>
            <option value="">วัน</option>
            {DAYS.map(d=><option key={d} value={d}>{d}</option>)}
          </select>
        </label>
        <label className="lux-field">
          <span>เดือน</span>
          <select value={data.month} onChange={set("month")} disabled={locked}>
            <option value="">เดือน</option>
            {MONTHS_TH.map((m,i)=><option key={i} value={i+1}>{m}</option>)}
          </select>
        </label>
        <label className="lux-field">
          <span>ปี พ.ศ.</span>
          <select value={data.yearBE} onChange={set("yearBE")} disabled={locked}>
            <option value="">ปี</option>
            {YEARS_BE.map(y=><option key={y} value={y}>{y}</option>)}
          </select>
        </label>
      </div>
      <div className="synastry-date-grid" style={{gridTemplateColumns:"1fr 1fr"}}>
        <label className="lux-field">
          <span>ชั่วโมง</span>
          <select value={data.hour} onChange={set("hour")} disabled={locked}>
            <option value="">ชั่วโมง</option>
            {HOURS.map(h=><option key={h} value={h}>{String(h).padStart(2,"0")} น.</option>)}
          </select>
        </label>
        <label className="lux-field">
          <span>นาที</span>
          <select value={data.minute} onChange={set("minute")} disabled={locked}>
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
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [reading, setReading]   = useState("");
  const [loading, setLoading]   = useState(false);
  const [copied, setCopied]     = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      const meta = data.session?.user?.user_metadata;
      if (meta?.birth_year_be) {
        const name = meta.full_name || meta.display_name || data.session!.user.email?.split("@")[0] || "ฉัน";
        setPersonA({
          name: String(name),
          yearBE: String(meta.birth_year_be),
          month: String(meta.birth_month),
          day: String(meta.birth_day),
          hour: String(meta.birth_hour),
          minute: String(meta.birth_minute ?? 0),
        });
        setProfileLoaded(true);
      }
    });
  }, []);

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
    setLoading(true); setReading("");
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
          if (data.type === "done")  setLoading(false);
          if (data.type === "error") { setReading(data.message); setLoading(false); }
        }
      }
    } catch {
      setReading("เกิดข้อผิดพลาด กรุณาลองใหม่");
      setLoading(false);
    }
  }

  function shareResult() {
    const nameA = personA.name || "คนที่ 1";
    const nameB = personB.name || "คนที่ 2";
    const preview = reading.slice(0, 150).replace(/\*\*/g, "");
    const url = `${window.location.origin}/share?topic=${encodeURIComponent(`ความเข้ากันของ${nameA}กับ${nameB}`)}&category=${encodeURIComponent("Synastry")}&preview=${encodeURIComponent(preview)}`;
    if (navigator.share) {
      navigator.share({ title: `Synastry: ${nameA} × ${nameB}`, text: preview, url });
    } else {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
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
        <div className="topbar-right">
          <div className="topbar-meta"><span>Synastry</span><span>ความเข้ากันของดวง</span></div>
          <UserMenu />
        </div>
      </header>

      <div className="synastry-layout">
        <div className="synastry-header">
          <span className="kicker">✦ Synastry Reading</span>
          <h1 className="synastry-title">ดวงของคุณ<em>เข้ากันแค่ไหน</em></h1>
          <p>เปรียบดวงกับคนใกล้ชิดได้ไม่จำกัด — คนรัก เพื่อน ครอบครัว หุ้นส่วน</p>
        </div>

        <div className="synastry-forms">
          <BirthForm label="คุณ" emoji="🌙" data={personA} onChange={setPersonA} locked={profileLoaded} />
          {profileLoaded && (
            <div style={{ textAlign:"center" }}>
              <button
                className="auth-link"
                style={{ fontSize:11 }}
                onClick={() => setProfileLoaded(false)}
              >
                แก้ไขข้อมูล
              </button>
            </div>
          )}
          <div className="synastry-vs">💞</div>
          <BirthForm label="อีกคน" emoji="☀️" data={personB} onChange={setPersonB} />
        </div>

        <div style={{textAlign:"center", marginTop:24}}>
          <button
            className="luxury-button"
            onClick={startReading}
            disabled={!canSubmit || loading}
            style={{minWidth:240}}
          >
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
              <>
                <div className="synastry-text">
                  {reading.split("\n").map((line, i) => {
                    if (line.startsWith("**") && line.endsWith("**"))
                      return <h3 key={i} className="synastry-section">{line.replace(/\*\*/g,"")}</h3>;
                    if (!line.trim()) return <br key={i}/>;
                    return <p key={i}>{line.replace(/\*\*/g,"")}</p>;
                  })}
                </div>

                {!loading && (
                  <div style={{ textAlign:"center", marginTop:24, display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
                    <button className="share-btn" onClick={shareResult} style={{ display:"inline-flex", alignItems:"center", gap:8 }}>
                      🔗 {copied ? "คัดลอกแล้ว!" : "แชร์ผลเปรียบดวงนี้"}
                    </button>
                    <button className="ghost-button" onClick={() => { setReading(""); setPersonB(emptyPerson()); }}>
                      เปรียบกับคนใหม่
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <footer className="legal-line">คำทำนายนี้เป็นมุมมองประกอบ ไม่ใช่การรับประกันความสัมพันธ์</footer>
    </main>
  );
}
