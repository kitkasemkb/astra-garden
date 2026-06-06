"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useConversation } from "@11labs/react";
import UserMenu from "@/components/UserMenu";
import { IconCrystalBall } from "@/components/AstraIcons";
import { TAROT_DECK, CELTIC_CROSS_POSITIONS } from "@/lib/tarot";

const AGENT_ID = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID!;

type DrawnCard = {
  id: string;
  name: string;
  nameTh: string;
  isReversed: boolean;
  position: string;
  positionTh: string;
};

function drawCards(): DrawnCard[] {
  const shuffled = [...TAROT_DECK].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 10).map((card, i) => ({
    id: card.id,
    name: card.name,
    nameTh: card.nameTh,
    isReversed: Math.random() > 0.7,
    position: CELTIC_CROSS_POSITIONS[i].name,
    positionTh: CELTIC_CROSS_POSITIONS[i].nameTh,
  }));
}

export default function TarotVoicePage() {
  const [cards, setCards] = useState<DrawnCard[]>([]);
  const [revealedCount, setRevealedCount] = useState(0);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [statusText, setStatusText] = useState("กดปุ่มเพื่อเริ่มต้นการอ่านไพ่");
  // map หัวข้อ Celtic Cross → หมายเลขไพ่ (1-based)
  const POSITION_MAP: { pattern: RegExp; card: number }[] = [
    { pattern: /สถานการณ์ปัจจุบัน/, card: 1 },
    { pattern: /สิ่งที่ขัดขวาง/,    card: 2 },
    { pattern: /จิตใต้สำนึก/,       card: 3 },
    { pattern: /อดีตที่ผ่านมา/,     card: 4 },
    { pattern: /ความเป็นไปได้/,     card: 5 },
    { pattern: /อนาคตใกล้/,         card: 6 },
    { pattern: /ตัวคุณเอง/,         card: 7 },
    { pattern: /สิ่งแวดล้อม/,       card: 8 },
    { pattern: /ความหวังและความกลัว|ความหวัง(?:และ|หรือ)ความกลัว/, card: 9 },
    { pattern: /ผลลัพธ์สุดท้าย/,   card: 10 },
  ];

  const conversation = useConversation({
    onConnect: () => {
      setStatusText("เชื่อมต่อแล้ว กำลังรอ Astra...");
    },
    onDisconnect: () => {
      setStatusText("สิ้นสุดการสนทนา");
      setSessionStarted(false);
    },
    onMessage: (msg: unknown) => {
      const raw = msg as { message?: string; source?: string };
      if (raw?.source !== "ai" || !raw?.message) return;
      const text = raw.message;

      for (const { pattern, card } of POSITION_MAP) {
        if (pattern.test(text)) {
          setRevealedCount(prev => Math.max(prev, card));
          break;
        }
      }
    },
    onError: (err: unknown) => {
      console.error("ElevenLabs error:", err);
      setStatusText("เกิดข้อผิดพลาด กรุณาลองใหม่");
    },
  });

  const { status, isSpeaking } = conversation;

  useEffect(() => {
    if (status === "connected") {
      if (isSpeaking) setStatusText("Astra กำลังพูด...");
      else setStatusText("กำลังฟังคุณอยู่...");
    }
  }, [status, isSpeaking]);

  const startSession = useCallback(async () => {
    const drawn = drawCards();
    setCards(drawn);
    setRevealedCount(0);
    setSessionStarted(true);
    setStatusText("กำลังเชื่อมต่อ...");

    await conversation.startSession({
      agentId: AGENT_ID,
      dynamicVariables: {
        cards: drawn.map((c, i) =>
          `ตำแหน่ง ${i + 1} (${c.positionTh}): ${c.nameTh}${c.isReversed ? " (กลับหัว)" : ""}`
        ).join(", "),
      },
    });
  }, [conversation]);

  const endSession = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  const revealAll = () => setRevealedCount(10);

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
          <a href="/tarot" className="ghost-button" style={{ textDecoration: "none", fontSize: 13 }}>
            ไพ่แบบข้อความ
          </a>
          <UserMenu />
        </div>
      </header>

      <section style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>
        {/* Title */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div className="kicker">✦ Voice Tarot Session</div>
          <h1 style={{ fontSize: "clamp(1.6rem,4vw,2.4rem)", marginBottom: 8 }}>
            คุยกับ Astra
          </h1>
          <p style={{ color: "var(--star-dim)", fontSize: 15 }}>
            พูดคุยกับที่ปรึกษาไพ่ทาโร่ด้วยเสียง — ไพ่จะเปิดเผยทีละใบขณะสนทนา
          </p>
        </div>

        {/* Cards grid */}
        {cards.length > 0 && (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: 10,
            marginBottom: 32,
          }}>
            {cards.map((card, i) => {
              const revealed = i < revealedCount;
              return (
                <div key={i} style={{
                  background: revealed ? "rgba(93,207,255,.08)" : "rgba(255,255,255,.04)",
                  border: `1px solid ${revealed ? "var(--aurora)" : "rgba(255,255,255,.1)"}`,
                  borderRadius: 12,
                  padding: "10px 8px",
                  textAlign: "center",
                  transition: "all 0.6s ease",
                  cursor: revealed ? "default" : "pointer",
                }} onClick={() => !revealed && setRevealedCount(i + 1)}>
                  <div style={{ fontSize: 22, marginBottom: 4 }}>
                    {revealed ? "✦" : "🂠"}
                  </div>
                  {revealed ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`/tarot/${card.id}.jpg`}
                        alt={card.nameTh}
                        style={{
                          width: "100%",
                          borderRadius: 6,
                          transform: card.isReversed ? "rotate(180deg)" : "none",
                          marginBottom: 6,
                        }}
                      />
                      <div style={{ fontSize: 10, color: "var(--star-dim)", marginBottom: 2 }}>
                        {card.positionTh}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--star-mid)", fontWeight: 600 }}>
                        {card.nameTh}
                      </div>
                      {card.isReversed && (
                        <div style={{ fontSize: 9, color: "var(--aurora)", marginTop: 2 }}>
                          กลับหัว
                        </div>
                      )}
                    </>
                  ) : (
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,.3)", marginTop: 4 }}>
                      ใบที่ {i + 1}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Controls */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          {/* Status indicator */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 20px",
            background: "rgba(255,255,255,.04)",
            borderRadius: 20,
            border: "1px solid rgba(255,255,255,.1)",
          }}>
            <div style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: status === "connected"
                ? (isSpeaking ? "#5dcfff" : "#4ade80")
                : "rgba(255,255,255,.3)",
              boxShadow: status === "connected" ? "0 0 8px currentColor" : "none",
              transition: "all 0.3s",
            }} />
            <span style={{ fontSize: 13, color: "var(--star-mid)" }}>{statusText}</span>
          </div>

          {/* Main button */}
          {!sessionStarted ? (
            <button
              className="luxury-button"
              onClick={startSession}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 32px", fontSize: 16 }}
            >
              <IconCrystalBall size={20} />
              เริ่มสนทนากับ Astra
            </button>
          ) : (
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
              {revealedCount < 10 && (
                <button className="ghost-button" onClick={revealAll} style={{ fontSize: 13 }}>
                  เปิดไพ่ทั้งหมด
                </button>
              )}
              <button
                className="ghost-button"
                onClick={endSession}
                style={{ fontSize: 13, borderColor: "rgba(255,100,100,.4)", color: "rgba(255,150,150,.8)" }}
              >
                จบการสนทนา
              </button>
            </div>
          )}

          {/* Hint */}
          {sessionStarted && status === "connected" && !isSpeaking && (
            <p style={{ fontSize: 12, color: "var(--star-dim)", textAlign: "center", margin: 0 }}>
              พูดได้เลยครับ — Astra กำลังฟังอยู่
            </p>
          )}
        </div>
      </section>

      <footer className="legal-line">
        คำแนะนำนี้เป็นมุมมองประกอบ ไม่ใช่การรับประกันอนาคต
      </footer>
    </main>
  );
}
