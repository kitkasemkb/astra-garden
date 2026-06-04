"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import UserMenu from "@/components/UserMenu";

export default function PurposeLetterPage() {
  const router = useRouter();
  const [userName, setUserName]     = useState("");
  const [hasBirth, setHasBirth]     = useState(false);
  const [loading, setLoading]       = useState(true);
  const [generating, setGenerating] = useState(false);
  const [letter, setLetter]         = useState("");
  const [birthMeta, setBirthMeta]   = useState<Record<string,unknown>>({});
  const letterRef = useRef<HTMLDivElement>(null);

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

  async function load(meta: Record<string,unknown>, name: string) {
    setGenerating(true); setLetter(""); setLoading(true);
    try {
      const ce = Number(meta.birth_year_be) - 543;
      const birthDate = `${ce}-${String(meta.birth_month).padStart(2,"0")}-${String(meta.birth_day).padStart(2,"0")}`;
      const birthTime = `${String(meta.birth_hour).padStart(2,"0")}:${String(meta.birth_minute ?? 0).padStart(2,"0")}`;
      const res = await fetch("/api/purpose-letter", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
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
          if (d.type === "delta") setLetter(p => p + d.text);
          if (d.type === "done")  setGenerating(false);
          if (d.type === "error") { setLetter(d.message); setGenerating(false); setLoading(false); }
        }
      }
    } catch { setGenerating(false); setLoading(false); }
  }

  function formatLetter(raw: string) {
    return raw
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .split("\n")
      .map((line, i) => line.trim() ? `<p>${line}</p>` : "<br/>")
      .join("");
  }

  function handlePrint() {
    window.print();
  }

  const today = new Date().toLocaleDateString("th-TH", { year:"numeric", month:"long", day:"numeric" });

  return (
    <main className="premium-shell">
      <div className="grain" />
      <header className="studio-topbar no-print">
        <a href="/" className="brand-lockup" style={{textDecoration:"none"}}>
          <span className="brand-sigil">✦</span>
          <span><strong>ASTRA GARDEN</strong><small>Astrology translated into gentle guidance</small></span>
        </a>
        <div className="topbar-right">
          <div className="topbar-meta"><span>Life Purpose Letter</span><small style={{fontSize:11}}>จดหมายจากดวงดาว</small></div>
          <UserMenu />
        </div>
      </header>

      <div className="letter-layout">

        <div className="horoscope-header no-print">
          <span className="kicker">★ Life Purpose Letter</span>
          <h1 className="horoscope-title" style={{fontSize:"clamp(26px,5vw,56px)",wordBreak:"keep-all"}}>
            {userName ? `จดหมายถึงคุณ${userName}` : "จดหมายจากดวงดาว"}
          </h1>
          <p style={{color:"var(--star-dim)",marginTop:4,maxWidth:560,margin:"8px auto 0"}}>
            จดหมายส่วนตัวจากดวงดาวที่ดูแลคุณมาตั้งแต่วันแรก
          </p>
        </div>

        {!loading && !hasBirth && (
          <div style={{textAlign:"center",padding:"40px 20px"}}>
            <p style={{marginBottom:20,color:"var(--star-dim)"}}>กรุณากรอกข้อมูลเกิดเพื่อรับจดหมาย</p>
            <button className="luxury-button" onClick={() => router.push("/auth/birth")}>กรอกข้อมูลเกิด →</button>
          </div>
        )}

        {loading && (
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:16,padding:"60px 20px",color:"var(--aurora)"}}>
            <div className="draw-orbit" style={{width:48,height:48}} />
            <span>ดวงดาวกำลังเขียนจดหมายให้คุณ…</span>
          </div>
        )}

        {generating && !loading && (
          <div style={{display:"flex",gap:12,alignItems:"center",color:"var(--aurora)",padding:"12px 0",justifyContent:"center"}} className="no-print">
            <div className="draw-orbit" style={{width:28,height:28}} />
            <span style={{fontSize:14}}>กำลังเขียน…</span>
          </div>
        )}

        {letter && (
          <div className="letter-paper" ref={letterRef}>
            {/* Print header */}
            <div className="letter-print-header">
              <div className="letter-sigil">✦</div>
              <div className="letter-brand">ASTRA GARDEN</div>
              <div className="letter-date">{today}</div>
            </div>

            {/* Letter body */}
            <div
              className="letter-body"
              dangerouslySetInnerHTML={{ __html: formatLetter(letter) }}
            />

            {/* Wax seal effect */}
            {!generating && (
              <div className="letter-seal">
                <div className="letter-seal-circle">✦</div>
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        {letter && !generating && (
          <div className="letter-actions no-print">
            <button className="ghost-button" onClick={handlePrint}>
              🖨 พิมพ์จดหมาย
            </button>
            <button className="ghost-button" onClick={() => load(birthMeta, userName)}>
              ↻ ขอจดหมายใหม่
            </button>
          </div>
        )}
      </div>

      <footer className="legal-line no-print">
        Life Purpose Letter สร้างจากดวงกำเนิดจริง ใช้เป็นมุมมองประกอบการค้นหาตัวเอง
      </footer>
    </main>
  );
}
