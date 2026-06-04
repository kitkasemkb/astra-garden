"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import UserMenu from "@/components/UserMenu";

type TopCareer = {
  name: string;
  match: string;
  reason: string;
  roles: string;
  start: string;
};

type AltCareer = { name: string; match: string; reason: string };

type CareerData = {
  strength: string;
  top: TopCareer[];
  alternatives: AltCareer[];
  caution: string;
  firstStep: string;
};

const TOP_COLORS = [
  { border: "#fbbf24", bg: "rgba(251,191,36,.1)",  icon: "✦", label: "อันดับ 1" },
  { border: "#a78bfa", bg: "rgba(167,139,250,.1)", icon: "✧", label: "อันดับ 2" },
  { border: "#5dcfff", bg: "rgba(93,207,255,.1)",  icon: "◈", label: "อันดับ 3" },
];

function parseCareerData(raw: string): CareerData | null {
  if (!raw || raw.length < 100) return null;

  function extract(key: string) {
    const pattern = new RegExp(
      `\\*\\*${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\*\\*([\\s\\S]*?)(?=\\*\\*|$)`,
      "i"
    );
    return raw.match(pattern)?.[1]?.trim() ?? "";
  }

  function extractTopCareer(n: number): TopCareer {
    const block = extract(`อาชีพที่ใช่ที่สุด ${n}`);
    const field = (key: string) => {
      const m = block.match(new RegExp(`${key}[:：]\\s*([^\\n]+)`));
      return m?.[1]?.trim() ?? "";
    };
    const multiline = (key: string) => {
      const m = block.match(new RegExp(`${key}[:：]\\s*([\\s\\S]*?)(?=ชื่ออาชีพ|ความเข้ากัน|เหตุผลจากดวง|ตำแหน่งงานจริง|วิธีเริ่มต้น|$)`));
      return m?.[1]?.trim() ?? "";
    };
    return {
      name:   field("ชื่ออาชีพ"),
      match:  field("ความเข้ากัน"),
      reason: multiline("เหตุผลจากดวง"),
      roles:  field("ตำแหน่งงานจริง"),
      start:  multiline("วิธีเริ่มต้น"),
    };
  }

  function parseAlts(block: string): AltCareer[] {
    return block
      .split("\n")
      .map(l => l.trim())
      .filter(l => l.startsWith("-"))
      .map(l => {
        const m = l.match(/^-\s*(.+?)\s*\((\d+%)\)\s*[—–-]\s*(.+)$/);
        if (m) return { name: m[1].trim(), match: m[2], reason: m[3].trim() };
        return { name: l.replace(/^-\s*/, ""), match: "", reason: "" };
      });
  }

  return {
    strength:     extract("จุดแข็งด้านอาชีพ"),
    top:          [1, 2, 3].map(extractTopCareer),
    alternatives: parseAlts(extract("ทางเลือกที่น่าสนใจ")),
    caution:      extract("อาชีพที่ควรระวัง"),
    firstStep:    extract("ก้าวแรกที่ทำได้เลย"),
  };
}

export default function CareerPage() {
  const router = useRouter();
  const [userName, setUserName]   = useState("");
  const [hasBirth, setHasBirth]   = useState(false);
  const [loading, setLoading]     = useState(true);
  const [generating, setGenerating] = useState(false);
  const [reading, setReading]     = useState("");
  const [birthMeta, setBirthMeta] = useState<Record<string, unknown>>({});

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
        loadCareer(meta, String(name));
      } else {
        setLoading(false);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadCareer(meta: Record<string, unknown>, name: string) {
    setGenerating(true);
    setReading("");
    setLoading(true);
    try {
      const ce = Number(meta.birth_year_be) - 543;
      const birthDate = `${ce}-${String(meta.birth_month).padStart(2,"0")}-${String(meta.birth_day).padStart(2,"0")}`;
      const birthTime = `${String(meta.birth_hour).padStart(2,"0")}:${String(meta.birth_minute ?? 0).padStart(2,"0")}`;

      const res = await fetch("/api/career", {
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

  const data = parseCareerData(reading);

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
            <span>Career Path</span>
            <small style={{ fontSize: 11 }}>จากเรือนชะตา</small>
          </div>
          <UserMenu />
        </div>
      </header>

      <div className="ikigai-layout">

        <div className="horoscope-header">
          <span className="kicker">✦ Astro Career</span>
          <h1 className="horoscope-title" style={{ fontSize: "clamp(26px,5vw,58px)", wordBreak: "keep-all" }}>
            {userName ? `เส้นทางอาชีพของคุณ${userName}` : "เส้นทางอาชีพจากเรือนชะตา"}
          </h1>
          <p style={{ color: "var(--star-dim)", marginTop: 4, maxWidth: 560, margin: "8px auto 0" }}>
            อาชีพที่เหมาะกับดวง ทักษะ และจุดประสงค์ชีวิตของคุณโดยเฉพาะ
          </p>
        </div>

        {/* No birth data */}
        {!loading && !hasBirth && (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <p style={{ marginBottom: 20, color: "var(--star-dim)" }}>กรุณากรอกข้อมูลเกิดเพื่อดูเส้นทางอาชีพ</p>
            <button className="luxury-button" onClick={() => router.push("/auth/birth")}>กรอกข้อมูลเกิด →</button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "60px 20px", color: "var(--aurora)" }}>
            <div className="draw-orbit" style={{ width: 48, height: 48 }} />
            <span>กำลังวิเคราะห์เส้นทางอาชีพจากดวงชะตา…</span>
          </div>
        )}

        {/* Generating */}
        {generating && !loading && (
          <div style={{ display: "flex", gap: 12, alignItems: "center", color: "var(--aurora)", padding: "20px 0", justifyContent: "center" }}>
            <div className="draw-orbit" style={{ width: 36, height: 36 }} />
            <span>ดวงดาวกำลังสร้าง Career Report ของคุณ…</span>
          </div>
        )}

        {/* Strength overview */}
        {data?.strength && (
          <div className="career-strength-card">
            <div className="career-strength-icon">◉</div>
            <div>
              <span className="kicker" style={{ color: "var(--aurora)" }}>จุดแข็งด้านอาชีพ</span>
              <p className="career-strength-body">{data.strength}</p>
            </div>
          </div>
        )}

        {/* Top 3 careers */}
        {data?.top && data.top.filter(c => c.name).length > 0 && (
          <div className="career-top-grid">
            {data.top.filter(c => c.name).map((career, i) => {
              const col = TOP_COLORS[i];
              const matchNum = parseInt(career.match) || 0;
              return (
                <div key={i} className="career-top-card" style={{ borderColor: col.border, background: col.bg }}>
                  <div className="career-top-header">
                    <span className="career-top-rank" style={{ color: col.border }}>{col.label}</span>
                    <span className="career-top-icon" style={{ color: col.border }}>{col.icon}</span>
                  </div>
                  <h2 className="career-top-name" style={{ color: col.border }}>{career.name}</h2>

                  {/* Match bar */}
                  <div className="career-match-wrap">
                    <div className="career-match-bar">
                      <div className="career-match-fill" style={{ width: `${matchNum}%`, background: col.border }} />
                    </div>
                    <span className="career-match-pct" style={{ color: col.border }}>{career.match}</span>
                  </div>

                  {career.reason && (
                    <div className="career-top-section">
                      <span className="career-field-label">เหตุผลจากดวง</span>
                      <p>{career.reason}</p>
                    </div>
                  )}
                  {career.roles && (
                    <div className="career-top-section">
                      <span className="career-field-label">ตำแหน่งงานจริง</span>
                      <p className="career-roles">{career.roles}</p>
                    </div>
                  )}
                  {career.start && (
                    <div className="career-top-section career-start">
                      <span className="career-field-label">วิธีเริ่มต้น</span>
                      <p>{career.start}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Alternatives */}
        {data?.alternatives && data.alternatives.filter(a => a.name).length > 0 && (
          <div className="career-alts-section">
            <div className="transit-alerts-header">
              <span className="kicker">◈ ทางเลือกที่น่าสนใจ</span>
              <h2>อาชีพทางเลือก</h2>
            </div>
            <div className="career-alts-grid">
              {data.alternatives.filter(a => a.name).map((alt, i) => (
                <div key={i} className="career-alt-card">
                  <div className="career-alt-top">
                    <span className="career-alt-name">{alt.name}</span>
                    {alt.match && <span className="career-alt-match">{alt.match}</span>}
                  </div>
                  {alt.reason && <p className="career-alt-reason">{alt.reason}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Caution */}
        {data?.caution && (
          <div className="career-caution-card">
            <span className="career-caution-icon">⚡</span>
            <div>
              <span className="kicker" style={{ color: "#f87171" }}>อาชีพที่ควรระวัง</span>
              <p className="career-caution-body">{data.caution}</p>
            </div>
          </div>
        )}

        {/* First steps */}
        {data?.firstStep && (
          <div className="ikigai-path-section">
            <div className="transit-alerts-header">
              <span className="kicker">→ ก้าวแรกที่ทำได้เลย</span>
              <h2>เริ่มต้นภายใน 30 วัน</h2>
            </div>
            <div className="ikigai-path-body">
              {data.firstStep.split("\n").filter(l => l.trim()).map((line, i) => (
                <div key={i} className="ikigai-step">
                  <span className="ikigai-step-num">{String(i + 1).padStart(2, "0")}</span>
                  <p>{line.replace(/^[0-9]+[\.\)]\s*/, "").replace(/\*\*/g, "")}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Refresh */}
        {hasBirth && !loading && (
          <div style={{ textAlign: "center", marginTop: 16, marginBottom: 32 }}>
            <button className="ghost-button" onClick={() => loadCareer(birthMeta, userName)} disabled={generating}>
              {generating ? "กำลังสร้าง…" : "↻ วิเคราะห์ใหม่"}
            </button>
          </div>
        )}

      </div>

      <footer className="legal-line">
        Career Path คำนวณจากดวงกำเนิดจริง ใช้เป็นมุมมองประกอบการตัดสินใจ ไม่ใช่การรับประกันความสำเร็จ
      </footer>
    </main>
  );
}
