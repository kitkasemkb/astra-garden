"use client";
import { useEffect, useState } from "react";
import { createClient, type Reading } from "@/lib/supabase";
import UserMenu from "@/components/UserMenu";
import { IconWork, IconTrophy, IconMoney, IconRelationship, IconLife, IconBalance, IconCrystalBall, IconStar, IconHistory, IconGalaxy } from "@/components/AstraIcons";

const CATEGORY_ICON: Record<string, React.ReactNode> = {
  business:     <IconWork size={18}/>,
  career:       <IconTrophy size={18}/>,
  money:        <IconMoney size={18}/>,
  relationship: <IconRelationship size={18}/>,
  life:         <IconLife size={18}/>,
  love:         <IconRelationship size={18}/>,
  decision:     <IconBalance size={18}/>,
  tarot:        <IconCrystalBall size={18}/>,
};

export default function HistoryPage() {
  const supabase = createClient();
  const [readings, setReadings] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ email?: string; display_name?: string } | null>(null);
  const [selected, setSelected] = useState<Reading | null>(null);

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { window.location.href = "/auth"; return; }
      setUser({ email: session.user.email, display_name: session.user.user_metadata?.display_name });

      const { data } = await supabase
        .from("readings")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      setReadings(data || []);
      setLoading(false);
    }
    load();
  }, []);

  async function deleteReading(id: string) {
    await supabase.from("readings").delete().eq("id", id);
    setReadings(prev => prev.filter(r => r.id !== id));
    if (selected?.id === id) setSelected(null);
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("th-TH", {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  }

  return (
    <main className="premium-shell">
      <div className="grain" />
      <header className="studio-topbar">
        <a href="/" className="brand-lockup" style={{ textDecoration:"none" }}>
          <span className="brand-sigil">✦</span>
          <span>
            <strong>ASTRA GARDEN</strong>
            <small>Astrology translated into gentle guidance</small>
          </span>
        </a>
        <div className="topbar-right">
          <div className="topbar-meta"><span>ประวัติรายงาน</span></div>
          <UserMenu />
        </div>
      </header>

      <div className="history-layout">
        {/* Sidebar list */}
        <aside className="history-sidebar">
          <div className="history-sidebar-header">
            <span className="kicker">Reading History</span>
            <h2>รายงานของคุณ</h2>
            {user && <p>{user.display_name || user.email}</p>}
          </div>

          {loading && <div className="history-loading"><div className="draw-orbit" style={{width:40,height:40}}/></div>}

          {!loading && readings.length === 0 && (
            <div className="history-empty">
              <span><IconCrystalBall size={40}/></span>
              <p>ยังไม่มีประวัติรายงาน<br/>เริ่มรับคำแนะนำแล้วบันทึกได้เลย</p>
              <a href="/" className="luxury-button" style={{textDecoration:"none",display:"inline-block",marginTop:12}}>เริ่มรับคำแนะนำ</a>
            </div>
          )}

          <div className="history-list">
            {readings.map(r => (
              <button
                key={r.id}
                className={`history-item ${selected?.id === r.id ? "active" : ""}`}
                onClick={() => setSelected(r)}
              >
                <span className="history-emoji">
                  {CATEGORY_ICON[r.category || r.type] || <IconGalaxy size={18}/>}
                </span>
                <div className="history-item-info">
                  <strong>{r.topic || (r.type === "tarot" ? "ไพ่ทาโร่" : "รายงาน")}</strong>
                  <small>{formatDate(r.created_at)}</small>
                </div>
                <span className="history-type-badge">{r.type === "tarot" ? <IconCrystalBall size={13}/> : <IconStar size={13}/>}</span>
              </button>
            ))}
          </div>
        </aside>

        {/* Detail view */}
        <section className="history-detail">
          {!selected && (
            <div className="history-detail-empty">
              <span><IconHistory size={40}/></span>
              <p>เลือกรายงานจากรายการเพื่อดูรายละเอียด</p>
            </div>
          )}
          {selected && (
            <div className="history-detail-content">
              <div className="history-detail-header">
                <div>
                  <span className="kicker">{selected.type === "tarot" ? "ไพ่ทาโร่" : "โหราศาสตร์"}</span>
                  <h2>{selected.topic || "รายงาน"}</h2>
                  <p className="history-date">{formatDate(selected.created_at)}</p>
                </div>
                <button
                  className="history-delete-btn"
                  onClick={() => { if (confirm("ลบรายงานนี้?")) deleteReading(selected.id); }}
                >
                  🗑️
                </button>
              </div>

              {selected.birth_date && (
                <div className="history-meta-row">
                  <span>🎂 {selected.birth_date} {selected.birth_time}</span>
                  {selected.province && <span>📍 {selected.province}</span>}
                </div>
              )}

              {selected.answer && (
                <div className="history-answer">
                  {selected.answer.split("\n").map((line, i) => {
                    if (line.match(/^\d+\./)) return <h3 key={i} className="history-section-heading">{line}</h3>;
                    if (line.startsWith("**✦")) return <h3 key={i} className="history-section-heading">{line.replace(/\*\*/g,"")}</h3>;
                    if (!line.trim()) return <br key={i}/>;
                    return <p key={i}>{line}</p>;
                  })}
                </div>
              )}

              <div className="history-actions">
                <button className="luxury-button" onClick={() => window.location.href = "/"}>
                  รับคำแนะนำใหม่
                </button>
              </div>
            </div>
          )}
        </section>
      </div>

      <footer className="legal-line">
        รายงานบันทึกไว้สำหรับตัวคุณเท่านั้น ไม่แชร์กับผู้อื่น
      </footer>
    </main>
  );
}
