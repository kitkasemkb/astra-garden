"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import UserMenu from "@/components/UserMenu";

const SECTION_KEYS = [
  "เงามืดของคุณคืออะไร",
  "รูปแบบที่ทำซ้ำโดยไม่รู้ตัว",
  "ความกลัวที่ซ่อนอยู่",
  "สิ่งที่มักหลีกเลี่ยง",
  "พลังที่ซ่อนอยู่ในเงามืด",
  "Shadow Work ที่แนะนำ",
  "ข้อความจากเงามืด",
] as const;

const SECTION_META: Record<string, { icon: string; color: string; accent: string }> = {
  "เงามืดของคุณคืออะไร":          { icon: "◑", color: "#a78bfa", accent: "rgba(167,139,250,.12)" },
  "รูปแบบที่ทำซ้ำโดยไม่รู้ตัว":   { icon: "↺", color: "#f472b6", accent: "rgba(244,114,182,.1)"  },
  "ความกลัวที่ซ่อนอยู่":           { icon: "▲", color: "#f87171", accent: "rgba(248,113,113,.1)"  },
  "สิ่งที่มักหลีกเลี่ยง":          { icon: "⊘", color: "#fbbf24", accent: "rgba(251,191,36,.1)"   },
  "พลังที่ซ่อนอยู่ในเงามืด":       { icon: "✦", color: "#34d399", accent: "rgba(52,211,153,.1)"   },
  "Shadow Work ที่แนะนำ":           { icon: "◉", color: "#5dcfff", accent: "rgba(93,207,255,.1)"   },
  "ข้อความจากเงามืด":              { icon: "★", color: "#e2e8f0", accent: "rgba(255,255,255,.06)"  },
};

function parseSections(raw: string) {
  const result: { title: string; body: string }[] = [];
  for (const key of SECTION_KEYS) {
    const pattern = new RegExp(
      `\\*\\*${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\*\\*([\\s\\S]*?)(?=\\*\\*|$)`,
      "i"
    );
    const m = raw.match(pattern);
    if (m) result.push({ title: key, body: m[1].trim() });
  }
  return result;
}

export default function ShadowPage() {
  const router = useRouter();
  const [userName, setUserName]     = useState("");
  const [hasBirth, setHasBirth]     = useState(false);
  const [loading, setLoading]       = useState(true);
  const [generating, setGenerating] = useState(false);
  const [reading, setReading]       = useState("");
  const [birthMeta, setBirthMeta]   = useState<Record<string, unknown>>({});

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
        loadShadow(meta, String(name));
      } else {
        setLoading(false);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadShadow(meta: Record<string, unknown>, name: string) {
    setGenerating(true);
    setReading("");
    setLoading(true);
    try {
      const ce = Number(meta.birth_year_be) - 543;
      const birthDate = `${ce}-${String(meta.birth_month).padStart(2,"0")}-${String(meta.birth_day).padStart(2,"0")}`;
      const birthTime = `${String(meta.birth_hour).padStart(2,"0")}:${String(meta.birth_minute ?? 0).padStart(2,"0")}`;

      const res = await fetch("/api/shadow", {
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
  const overviewSection   = sections.find(s => s.title === "เงามืดของคุณคืออะไร");
  const mainSections      = sections.filter(s => ["รูปแบบที่ทำซ้ำโดยไม่รู้ตัว","ความกลัวที่ซ่อนอยู่","สิ่งที่มักหลีกเลี่ยง"].includes(s.title));
  const powerSection      = sections.find(s => s.title === "พลังที่ซ่อนอยู่ในเงามืด");
  const workSection       = sections.find(s => s.title === "Shadow Work ที่แนะนำ");
  const messageSection    = sections.find(s => s.title === "ข้อความจากเงามืด");

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
            <span>Shadow Side</span>
            <small style={{ fontSize: 11 }}>จากเรือนชะตา</small>
          </div>
          <UserMenu />
        </div>
      </header>

      <div className="ikigai-layout">

        {/* Header */}
        <div className="horoscope-header">
          <span className="kicker">◑ Shadow Side</span>
          <h1 className="horoscope-title" style={{ fontSize: "clamp(26px,5vw,58px)", wordBreak: "keep-all" }}>
            {userName ? `เงามืดของคุณ${userName}` : "เงามืดจากเรือนชะตา"}
          </h1>
          <p style={{ color: "var(--star-dim)", marginTop: 4, maxWidth: 560, margin: "8px auto 0" }}>
            ส่วนที่ซ่อนอยู่ในดวงชะตา — ความกลัว รูปแบบซ้ำ และพลังที่ยังไม่ถูกปลดปล่อย<br />
            <em>เงามืดไม่ใช่ศัตรู แต่คือส่วนหนึ่งของตัวเองที่รอการยอมรับ</em>
          </p>
        </div>

        {/* No birth data */}
        {!loading && !hasBirth && (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <p style={{ marginBottom: 20, color: "var(--star-dim)" }}>กรุณากรอกข้อมูลเกิดเพื่อดู Shadow Side</p>
            <button className="luxury-button" onClick={() => router.push("/auth/birth")}>กรอกข้อมูลเกิด →</button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "60px 20px", color: "var(--aurora-2)" }}>
            <div className="draw-orbit" style={{ width: 48, height: 48 }} />
            <span>กำลังสำรวจเงามืดในดวงชะตา…</span>
          </div>
        )}

        {/* Generating */}
        {generating && !loading && (
          <div style={{ display: "flex", gap: 12, alignItems: "center", color: "var(--aurora-2)", padding: "20px 0", justifyContent: "center" }}>
            <div className="draw-orbit" style={{ width: 36, height: 36 }} />
            <span>ดวงดาวกำลังเปิดเผยเงามืดของคุณ…</span>
          </div>
        )}

        {/* Overview */}
        {overviewSection && (
          <div className="shadow-overview-card">
            <div className="shadow-overview-icon">◑</div>
            <div>
              <span className="kicker" style={{ color: "#a78bfa" }}>เงามืดของคุณคืออะไร</span>
              <p className="shadow-overview-body">{overviewSection.body}</p>
            </div>
          </div>
        )}

        {/* Main 3 sections: patterns, fears, avoidance */}
        {mainSections.length > 0 && (
          <div className="shadow-main-grid">
            {mainSections.map(sec => {
              const m = SECTION_META[sec.title];
              const lines = sec.body.split("\n").filter(l => l.trim());
              const introLines = lines.filter(l => !l.startsWith("เช่น:"));
              const exampleLine = lines.find(l => l.startsWith("เช่น:"));
              const examples = exampleLine
                ? exampleLine.replace("เช่น:", "").split(",").map(s => s.trim()).filter(Boolean)
                : [];
              return (
                <div key={sec.title} className="shadow-section-card" style={{ borderColor: m.color, background: m.accent }}>
                  <div className="shadow-section-icon" style={{ color: m.color }}>{m.icon}</div>
                  <h3 className="shadow-section-title" style={{ color: m.color }}>{sec.title}</h3>
                  <div className="shadow-section-body">
                    {introLines.map((line, i) => (
                      <p key={i}>{line.replace(/\*\*/g, "")}</p>
                    ))}
                  </div>
                  {examples.length > 0 && (
                    <div className="shadow-examples">
                      <span className="shadow-examples-label">เช่น</span>
                      <div className="shadow-examples-list">
                        {examples.map((ex, i) => (
                          <span key={i} className="shadow-example-chip" style={{ borderColor: m.color, color: m.color }}>
                            {ex}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Power in the shadow — featured */}
        {powerSection && (
          <div className="shadow-power-card">
            <div className="shadow-power-header">
              <span className="shadow-power-icon">✦</span>
              <div>
                <span className="kicker" style={{ color: "#34d399" }}>พลังที่ซ่อนอยู่ในเงามืด</span>
                <h2 className="shadow-power-title">Hidden Power</h2>
              </div>
            </div>
            <div className="shadow-power-body">
              {powerSection.body.split("\n").filter(l => l.trim()).map((line, i) => {
                const isReframe = line.includes("→");
                return isReframe ? (
                  <div key={i} className="shadow-reframe">
                    {line.replace(/\*\*/g, "").split("→").map((part, j) => (
                      <span key={j} className={j === 0 ? "shadow-reframe-from" : "shadow-reframe-to"}>
                        {j === 1 && <span className="shadow-reframe-arrow">→</span>}
                        {part.replace(/^เช่น:\s*/, "").trim()}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p key={i}>{line.replace(/^เช่น:\s*/, "").replace(/\*\*/g, "")}</p>
                );
              })}
            </div>
          </div>
        )}

        {/* Shadow Work exercises */}
        {workSection && (
          <div className="ikigai-path-section">
            <div className="transit-alerts-header">
              <span className="kicker">◉ Shadow Work</span>
              <h2>แบบฝึกหัดที่แนะนำ</h2>
            </div>
            <div className="ikigai-path-body">
              {workSection.body.split("\n").filter(l => l.trim()).map((line, i) => (
                <div key={i} className="ikigai-step">
                  <span className="ikigai-step-num" style={{ color: "#5dcfff" }}>{String(i + 1).padStart(2, "0")}</span>
                  <p>{line.replace(/^[0-9]+[\.\)]\s*/, "").replace(/\*\*/g, "")}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Message from shadow */}
        {messageSection && (
          <div className="shadow-message-card">
            <div className="shadow-message-glyph">◑</div>
            <p className="shadow-message-text">{messageSection.body}</p>
          </div>
        )}

        {/* Refresh */}
        {hasBirth && !loading && (
          <div style={{ textAlign: "center", marginTop: 16, marginBottom: 32 }}>
            <button className="ghost-button" onClick={() => loadShadow(birthMeta, userName)} disabled={generating}>
              {generating ? "กำลังสร้าง…" : "↻ สำรวจเงามืดใหม่"}
            </button>
          </div>
        )}

      </div>

      <footer className="legal-line">
        Shadow Side คำนวณจากดวงกำเนิดจริง ใช้เป็นเครื่องมือการรู้จักตัวเอง ไม่ใช่การวินิจฉัยทางจิตวิทยา
      </footer>
    </main>
  );
}
