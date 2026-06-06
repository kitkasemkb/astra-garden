"use client";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import UserMenu from "@/components/UserMenu";

type DayScore = {
  date: string;
  score: number;
  color: "good" | "mixed" | "caution";
  topAspect: string | null;
};

type DayDetail = {
  score: number;
  color: "good" | "mixed" | "caution";
  aspects: { transitPlanet: string; natalPlanet: string; type: string; energy: string; meaningTh: string }[];
  advice: string;
};

const CATEGORIES = [
  { id: "general",  label: "ชีวิตโดยรวม", icon: "✦" },
  { id: "career",   label: "การงาน",       icon: "◈" },
  { id: "love",     label: "ความรัก",      icon: "♥" },
  { id: "money",    label: "การเงิน",      icon: "◉" },
  { id: "health",   label: "สุขภาพ",       icon: "★" },
];

const COLOR_STYLE: Record<string, { bg: string; border: string; label: string; dot: string }> = {
  good:    { bg: "rgba(74,222,128,.12)",  border: "rgba(74,222,128,.4)",  label: "วันดี",    dot: "#4ade80" },
  mixed:   { bg: "rgba(251,191,36,.10)",  border: "rgba(251,191,36,.35)", label: "ปานกลาง", dot: "#fbbf24" },
  caution: { bg: "rgba(248,113,113,.10)", border: "rgba(248,113,113,.35)",label: "ควรระวัง",dot: "#f87171" },
};

const MONTH_TH = ["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"];
const DAY_TH   = ["อา","จ","อ","พ","พฤ","ศ","ส"];

export default function AstroTimerPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year,  setYear]  = useState(now.getFullYear());
  const [category, setCategory] = useState("general");
  const [days, setDays]   = useState<DayScore[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [detail, setDetail] = useState<DayDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [birthData, setBirthData] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState("");

  // โหลดข้อมูลเกิดจาก profile
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      const meta = data.session?.user?.user_metadata;
      if (meta?.birth_year_be) {
        const ce = Number(meta.birth_year_be) - 543;
        const birthDate = `${ce}-${String(meta.birth_month).padStart(2,"0")}-${String(meta.birth_day).padStart(2,"0")}`;
        const birthTime = `${String(meta.birth_hour ?? 12).padStart(2,"0")}:${String(meta.birth_minute ?? 0).padStart(2,"0")}`;
        setBirthData({ birthDate, birthTime, latitude: meta.latitude ?? 13.7563, longitude: meta.longitude ?? 100.5018 });
      }
    });
  }, []);

  const loadMonth = useCallback(async () => {
    if (!birthData) return;
    setLoading(true);
    setError("");
    setDays([]);
    setSelectedDay(null);
    setDetail(null);
    try {
      const res = await fetch("/api/astro-timer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...birthData, category, month, year, mode: "month" }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); return; }
      setDays(data.days);
    } catch {
      setError("เชื่อมต่อไม่สำเร็จ กรุณาลองใหม่");
    } finally {
      setLoading(false);
    }
  }, [birthData, category, month, year]);

  useEffect(() => {
    if (birthData) loadMonth();
  }, [loadMonth, birthData]);

  async function loadDetail(date: string) {
    if (!birthData) return;
    setSelectedDay(date);
    setDetail(null);
    setDetailLoading(true);
    try {
      const res = await fetch("/api/astro-timer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...birthData, category, date, mode: "day" }),
      });
      const data = await res.json();
      setDetail(data);
    } catch {
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  }

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  }

  // สร้าง calendar grid
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const blanks = Array(firstDay).fill(null);
  const todayStr = now.toISOString().split("T")[0];

  return (
    <main className="premium-shell">
      <div className="grain" />
      <header className="studio-topbar">
        <a href="/" className="brand-lockup" style={{ textDecoration: "none" }}>
          <span className="brand-sigil">✦</span>
          <span><strong>ASTRA GARDEN</strong><small>Astrology translated into gentle guidance</small></span>
        </a>
        <div className="topbar-right"><UserMenu /></div>
      </header>

      <section style={{ maxWidth: 960, margin: "0 auto", padding: "40px 20px" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div className="kicker">✦ Astro Timer</div>
          <h1 style={{ fontSize: "clamp(1.6rem,4vw,2.4rem)", marginBottom: 8 }}>ฤกษ์งามยามดีของคุณ</h1>
          <p style={{ color: "var(--star-dim)", fontSize: 14 }}>
            วิเคราะห์พลังงานรายวันจาก planetary transits เทียบกับดวงชะตาของคุณ
          </p>
        </div>

        {!birthData ? (
          <div style={{ textAlign: "center", padding: 40 }}>
            <p style={{ color: "var(--star-dim)", marginBottom: 16 }}>ต้องล็อกอินและบันทึกวันเกิดก่อนครับ</p>
            <a href="/auth" className="luxury-button" style={{ textDecoration: "none" }}>เข้าสู่ระบบ</a>
          </div>
        ) : (
          <>
            {/* Category selector */}
            <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: 24 }}>
              {CATEGORIES.map(c => (
                <button
                  key={c.id}
                  onClick={() => setCategory(c.id)}
                  style={{
                    padding: "8px 16px", borderRadius: 20, fontSize: 13, cursor: "pointer",
                    background: category === c.id ? "var(--aurora)" : "rgba(255,255,255,.06)",
                    border: `1px solid ${category === c.id ? "var(--aurora)" : "rgba(255,255,255,.15)"}`,
                    color: category === c.id ? "#0a0a12" : "var(--star-mid)",
                    fontWeight: category === c.id ? 600 : 400,
                    transition: "all .2s",
                  }}
                >
                  {c.icon} {c.label}
                </button>
              ))}
            </div>

            {/* Month nav */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, marginBottom: 20 }}>
              <button className="ghost-button" onClick={prevMonth} style={{ padding: "6px 14px" }}>‹</button>
              <span style={{ fontSize: 18, fontWeight: 600, color: "var(--star)" }}>
                {MONTH_TH[month]} {year + 543}
              </span>
              <button className="ghost-button" onClick={nextMonth} style={{ padding: "6px 14px" }}>›</button>
            </div>

            {/* Legend */}
            <div style={{ display: "flex", gap: 16, justifyContent: "center", marginBottom: 16, flexWrap: "wrap" }}>
              {Object.entries(COLOR_STYLE).map(([k, v]) => (
                <div key={k} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--star-dim)" }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: v.dot }} />
                  {v.label}
                </div>
              ))}
            </div>

            {error && <p style={{ textAlign: "center", color: "#f87171", marginBottom: 16 }}>{error}</p>}

            {loading ? (
              <div style={{ textAlign: "center", padding: 60 }}>
                <div className="draw-orbit" style={{ width: 48, height: 48, margin: "0 auto 16px" }} />
                <p style={{ color: "var(--star-dim)", fontSize: 14 }}>กำลังคำนวณพลังงานรายวัน...</p>
              </div>
            ) : (
              <div style={{ display: "grid", gap: 20, gridTemplateColumns: days.length ? "1fr" : "1fr" }}>
                {/* Calendar */}
                <div style={{
                  background: "rgba(255,255,255,.03)",
                  border: "1px solid rgba(255,255,255,.08)",
                  borderRadius: 16,
                  padding: 20,
                }}>
                  {/* Day headers */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, marginBottom: 8 }}>
                    {DAY_TH.map(d => (
                      <div key={d} style={{ textAlign: "center", fontSize: 11, color: "var(--star-dim)", padding: "4px 0" }}>{d}</div>
                    ))}
                  </div>

                  {/* Calendar cells */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4 }}>
                    {blanks.map((_, i) => <div key={`b${i}`} />)}
                    {Array.from({ length: daysInMonth }, (_, i) => {
                      const d = i + 1;
                      const dateStr = `${year}-${String(month + 1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
                      const dayData = days.find(x => x.date === dateStr);
                      const style = dayData ? (COLOR_STYLE[dayData.color] ?? COLOR_STYLE.mixed) : null;
                      const isToday = dateStr === todayStr;
                      const isSelected = dateStr === selectedDay;

                      return (
                        <button
                          key={d}
                          onClick={() => dayData && loadDetail(dateStr)}
                          disabled={!dayData}
                          style={{
                            aspectRatio: "1",
                            borderRadius: 10,
                            border: `1px solid ${isSelected ? "var(--aurora)" : style?.border ?? "rgba(255,255,255,.06)"}`,
                            background: isSelected ? "rgba(93,207,255,.15)" : style?.bg ?? "rgba(255,255,255,.02)",
                            color: isToday ? "var(--aurora)" : "var(--star-mid)",
                            fontWeight: isToday ? 700 : 400,
                            fontSize: 13,
                            cursor: dayData ? "pointer" : "default",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 3,
                            padding: 4,
                            transition: "all .15s",
                            outline: isToday ? "1.5px solid var(--aurora)" : "none",
                          }}
                        >
                          {d}
                          {dayData && (
                            <div style={{
                              width: 5, height: 5, borderRadius: "50%",
                              background: COLOR_STYLE[dayData.color].dot,
                            }} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Day detail */}
                {selectedDay && (
                  <div style={{
                    background: "rgba(255,255,255,.03)",
                    border: "1px solid rgba(255,255,255,.08)",
                    borderRadius: 16,
                    padding: 24,
                  }}>
                    <div style={{ marginBottom: 16 }}>
                      <span className="kicker">
                        {new Date(selectedDay + "T12:00:00").toLocaleDateString("th-TH", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                      </span>
                      {detail && (
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                          <div style={{ width: 10, height: 10, borderRadius: "50%", background: (COLOR_STYLE[detail.color] ?? COLOR_STYLE.mixed).dot }} />
                          <span style={{ color: (COLOR_STYLE[detail.color] ?? COLOR_STYLE.mixed).dot, fontWeight: 600, fontSize: 15 }}>
                            {(COLOR_STYLE[detail.color] ?? COLOR_STYLE.mixed).label}
                          </span>
                        </div>
                      )}
                    </div>

                    {detailLoading ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 12, color: "var(--star-dim)", fontSize: 14 }}>
                        <div className="draw-orbit" style={{ width: 24, height: 24, flexShrink: 0 }} />
                        กำลังวิเคราะห์พลังงานวันนี้...
                      </div>
                    ) : detail ? (
                      <>
                        {/* AI advice */}
                        <div style={{
                          background: "rgba(93,207,255,.06)",
                          border: "1px solid rgba(93,207,255,.15)",
                          borderRadius: 12,
                          padding: 16,
                          marginBottom: 16,
                          fontSize: 14,
                          lineHeight: 1.7,
                          color: "var(--star-mid)",
                          whiteSpace: "pre-line",
                        }}>
                          {detail.advice}
                        </div>

                        {/* Aspects */}
                        <div>
                          <span className="rail-label">มุมดาวที่มีผล</span>
                          <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
                            {detail.aspects.map((a, i) => (
                              <div key={i} style={{
                                display: "flex", alignItems: "flex-start", gap: 10,
                                fontSize: 12, color: "var(--star-dim)",
                              }}>
                                <span style={{
                                  color: a.energy === "harmonious" ? "#4ade80" : a.energy === "challenging" ? "#f87171" : "#fbbf24",
                                  flexShrink: 0, fontSize: 14,
                                }}>
                                  {a.energy === "harmonious" ? "✦" : a.energy === "challenging" ? "⚡" : "◈"}
                                </span>
                                <span>{a.meaningTh}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : null}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </section>

      <footer className="legal-line">
        การวิเคราะห์นี้เป็นมุมมองประกอบ ไม่ใช่การรับประกันเหตุการณ์ในอนาคต
      </footer>
    </main>
  );
}
