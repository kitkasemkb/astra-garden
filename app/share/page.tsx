"use client";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { IconCrystalBall } from "@/components/AstraIcons";

function ShareContent() {
  const params = useSearchParams();
  const topic    = params.get("topic") || "รายงาน";
  const category = params.get("category") || "ชีวิตทั่วไป";
  const asc      = params.get("asc") || "";
  const mc       = params.get("mc") || "";
  const preview  = params.get("preview") || "";

  return (
    <div className="share-card-wrapper">
      <div className="share-card" id="share-card">
        <div className="share-card-bg" />
        <div className="share-card-stars">
          {Array.from({length:20}).map((_,i) => (
            <div key={i} className="share-star" style={{
              left: `${Math.sin(i*7.3)*50+50}%`,
              top:  `${Math.cos(i*5.7)*50+50}%`,
              animationDelay: `${i*0.3}s`,
            }} />
          ))}
        </div>
        <header className="share-card-header">
          <span className="share-brand">✦ ASTRA GARDEN</span>
          <span className="share-subtitle">Personal Reading</span>
        </header>
        <div className="share-card-body">
          <div className="share-category">{category}</div>
          <h2 className="share-topic">{topic}</h2>
          {(asc || mc) && (
            <div className="share-chart-info">
              {asc && <span>ASC {asc}</span>}
              {mc  && <span>MC {mc}</span>}
            </div>
          )}
          {preview && (
            <p className="share-preview">{preview.slice(0, 120)}{preview.length > 120 ? "…" : ""}</p>
          )}
        </div>
        <footer className="share-card-footer">
          <span>astra-garden.vercel.app</span>
          <span style={{display:"inline-flex",alignItems:"center",gap:6}}><IconCrystalBall size={14}/> รับคำแนะนำจากดวงดาว</span>
        </footer>
      </div>
      <div className="share-actions">
        <button
          className="luxury-button"
          onClick={() => {
            const url = window.location.href;
            navigator.clipboard.writeText(url).then(() => alert("คัดลอก URL แล้ว!"));
          }}
        >
          📋 คัดลอกลิงก์
        </button>
        <a href="/" className="ghost-button" style={{ textDecoration:"none", display:"inline-flex", alignItems:"center" }}>
          รับคำแนะนำใหม่
        </a>
      </div>
    </div>
  );
}

export default function SharePage() {
  return (
    <main className="premium-shell" style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh" }}>
      <div className="grain" />
      <Suspense fallback={<div style={{color:"var(--star)"}}>กำลังโหลด…</div>}>
        <ShareContent />
      </Suspense>
    </main>
  );
}
