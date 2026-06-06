"use client";
import { useState, useRef, useEffect } from "react";
import { CELTIC_CROSS_POSITIONS, type CelticCrossSpread, type DrawnCard } from "@/lib/tarot";
import UserMenu from "@/components/UserMenu";
import { IconRelationship, IconWork, IconMoney, IconLife, IconBalance, IconGalaxy, IconCrystalBall, IconStar } from "@/components/AstraIcons";

const CATEGORIES = [
  { id: "love",     label: "ความรัก",      icon: <IconRelationship size={22}/> },
  { id: "career",   label: "การงาน",       icon: <IconWork size={22}/> },
  { id: "money",    label: "การเงิน",      icon: <IconMoney size={22}/> },
  { id: "life",     label: "ชีวิตทั่วไป",  icon: <IconLife size={22}/> },
  { id: "decision", label: "การตัดสินใจ",  icon: <IconBalance size={22}/> },
];

export default function TarotPage() {
  const [step, setStep] = useState<"intro" | "question" | "shuffling" | "drawing" | "reading">("intro");
  const [category, setCategory] = useState("life");
  const [question, setQuestion] = useState("");
  const [spread, setSpread] = useState<CelticCrossSpread | null>(null);
  const [revealedCards, setRevealedCards] = useState<Set<number>>(new Set());
  const [interpretation, setInterpretation] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const interpretRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // ไม่ auto-scroll — ให้ user เลื่อนเอง
  }, [interpretation, isStreaming]);

  async function startReading() {
    // แสดง shuffle animation ก่อน 2.8 วินาที
    setStep("shuffling");
    setRevealedCards(new Set());
    await new Promise(r => setTimeout(r, 2800));
    setStep("drawing");
    setInterpretation("");
    setSelectedCard(null);

    // Reveal cards one by one with delay
    try {
      const res = await fetch("/api/tarot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, category }),
      });

      if (!res.ok || !res.body) throw new Error("ไม่สามารถเชื่อมต่อได้");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let drawenSpread: CelticCrossSpread | null = null;
      let revealIndex = 0;

      const revealInterval = setInterval(() => {
        if (drawenSpread && revealIndex < 10) {
          setRevealedCards(prev => new Set([...prev, revealIndex]));
          revealIndex++;
        }
      }, 400);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = JSON.parse(line.slice(6));
          if (data.type === "spread") {
            drawenSpread = data.spread;
            setSpread(data.spread);
            setStep("reading");
          } else if (data.type === "delta") {
            setIsStreaming(true);
            setInterpretation(prev => prev + data.text);
          } else if (data.type === "done") {
            setIsStreaming(false);
            clearInterval(revealInterval);
            setRevealedCards(new Set(Array.from({ length: 10 }, (_, i) => i)));
          } else if (data.type === "error") {
            setInterpretation("เกิดข้อผิดพลาด: " + data.message);
            setIsStreaming(false);
            clearInterval(revealInterval);
          }
        }
      }
    } catch (err) {
      setInterpretation("เชื่อมต่อไม่สำเร็จ กรุณาลองใหม่");
      setIsStreaming(false);
      setStep("question");
    }
  }

  function reset() {
    setStep("intro");
    setQuestion("");
    setSpread(null);
    setRevealedCards(new Set());
    setInterpretation("");
    setSelectedCard(null);
  }

  const CardDisplay = ({ card, index }: { card: DrawnCard; index: number }) => {
    const pos = CELTIC_CROSS_POSITIONS[index];
    const isRevealed = revealedCards.has(index);
    const isSelected = selectedCard === index;
    const imgSrc = `/tarot/${card.id}.jpg`;

    return (
      <div
        className={`tarot-card-slot ${isRevealed ? "revealed" : ""} ${isSelected ? "selected" : ""}`}
        onClick={() => isRevealed && setSelectedCard(isSelected ? null : index)}
        title={pos.nameTh}
      >
        <div className="tarot-card-inner">
          {/* Back */}
          <div className="tarot-card-back">
            <div className="tarot-back-pattern">
              <div className="tarot-back-inner">✦</div>
            </div>
          </div>
          {/* Front with real image */}
          <div className={`tarot-card-front ${card.isReversed ? "reversed" : ""}`}>
            <div className="card-img-wrapper">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imgSrc}
                alt={card.name}
                className="card-img"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
              />
              <div className="card-img-overlay" />
            </div>
            <div className="card-label-bar">
              <span className="card-name-th">{card.nameTh}</span>
              {card.isReversed && <span className="reversed-dot" title="กลับหัว">↓</span>}
            </div>
          </div>
        </div>
      </div>
    );
  };

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
            <span>Tarot Reading</span>
            <span>Celtic Cross · 10 Cards</span>
          </div>
          <UserMenu />
        </div>
      </header>

      {/* INTRO */}
      {step === "intro" && (
        <section className="tarot-hero">
          <div className="tarot-hero-content">
            <div className="kicker">✦ Golden Dawn · Rider-Waite · Thoth</div>
            <h1 className="tarot-title">ไพ่ทาโร่<br /><em>เปิดเผยชะตาชีวิต</em></h1>
            <p>ไพ่ทาโร่ 78 ใบที่สะท้อนพลังงานจักรวาล Celtic Cross Spread 10 ใบ อ่านทุกมิติของชีวิตด้วยระบบที่แม่นยำที่สุดในโลก</p>
            <div className="tarot-features">
              <div><IconGalaxy size={22}/><p>Golden Dawn + RWS + Thoth</p></div>
              <div><IconCrystalBall size={22}/><p>Celtic Cross 10 ใบ</p></div>
              <div><IconStar size={22}/><p>AI ตีความเชื่อมดวงดาว</p></div>
            </div>
            <button className="luxury-button" onClick={() => setStep("question")}>
              เปิดไพ่เปิดชะตา
            </button>
          </div>
          <div className="tarot-hero-cards">
            {["✦","☽","☉","♄","♃"].map((s, i) => (
              <div key={i} className={`tarot-float-card float-${i}`}>{s}</div>
            ))}
          </div>
        </section>
      )}

      {/* SHUFFLE ANIMATION */}
      {step === "shuffling" && (
        <section className="tarot-shuffle-screen">
          <div className="shuffle-bg-glow" />
          <div className="shuffle-cards-wrap">
            {Array.from({length:7}).map((_,i) => (
              <div key={i} className={`shuffle-card sc-${i}`}>
                <div className="tarot-back-pattern" style={{width:"100%",height:"100%",display:"grid",placeItems:"center"}}>
                  <span style={{fontFamily:"var(--serif)",fontSize:28,color:"rgba(167,139,250,.7)"}}>✦</span>
                </div>
              </div>
            ))}
          </div>
          <div className="shuffle-text">
            <div className="draw-orbit" style={{width:56,height:56,margin:"0 auto 16px"}} />
            <h2>กำลังสับไพ่…</h2>
            <p>จักรวาลกำลังเลือกไพ่ที่เหมาะกับคุณ</p>
          </div>
        </section>
      )}

      {/* QUESTION */}
      {step === "question" && (
        <section className="tarot-question-section">
          <div className="tarot-question-panel">
            <div className="panel-heading">
              <span>Set your intention</span>
              <h2>ตั้งจิตก่อนเปิดไพ่</h2>
              <p>ความชัดเจนของคำถามคือกุญแจสู่การวิเคราะห์ที่ตรงจุด</p>
            </div>

            <div className="tarot-cat-grid">
              {CATEGORIES.map(c => (
                <button
                  key={c.id}
                  className={`premium-choice ${category === c.id ? "selected" : ""}`}
                  onClick={() => setCategory(c.id)}
                >
                  <span>{c.icon}</span>
                  <small>{c.label}</small>
                </button>
              ))}
            </div>

            <label className="lux-field story-field" style={{ marginBottom: "24px" }}>
              <span>คำถามหรือสิ่งที่อยากรู้</span>
              <textarea
                value={question}
                onChange={e => setQuestion(e.target.value)}
                placeholder="เช่น ความสัมพันธ์นี้จะไปในทิศทางไหน? หรือ ช่วงนี้การงานจะเป็นอย่างไร?"
                rows={3}
              />
            </label>

            <div style={{ display: "flex", gap: "10px" }}>
              <button className="ghost-button" onClick={() => setStep("intro")}>ย้อนกลับ</button>
              <button className="luxury-button" onClick={startReading} style={{ flex: 1 }}>
                สับไพ่และเปิดชะตา
              </button>
            </div>
          </div>
        </section>
      )}

      {/* DRAWING / READING */}
      {(step === "drawing" || step === "reading") && spread && (
        <section className="tarot-reading-section">
          {/* Celtic Cross Layout */}
          <div className="celtic-cross-container">
            <div className="celtic-cross-title">
              <span className="kicker">Celtic Cross Spread</span>
              <h2>ไพ่แห่งชะตาชีวิต</h2>
            </div>

            <div className="celtic-cross-grid">
              {/* Center cross: positions 0-5 */}
              <div className="cross-center">
                <div className="cross-pos cross-present">
                  <CardDisplay card={spread.cards[0]} index={0} />
                </div>
                <div className="cross-pos cross-challenge">
                  <CardDisplay card={spread.cards[1]} index={1} />
                </div>
                <div className="cross-pos cross-crown">
                  <CardDisplay card={spread.cards[4]} index={4} />
                </div>
                <div className="cross-pos cross-foundation">
                  <CardDisplay card={spread.cards[2]} index={2} />
                </div>
                <div className="cross-pos cross-past">
                  <CardDisplay card={spread.cards[3]} index={3} />
                </div>
                <div className="cross-pos cross-future">
                  <CardDisplay card={spread.cards[5]} index={5} />
                </div>
              </div>
              {/* Staff: positions 6-9 */}
              <div className="cross-staff">
                {[9, 8, 7, 6].map((posIdx, i) => (
                  <div key={i} className="staff-pos">
                    <CardDisplay card={spread.cards[posIdx]} index={posIdx} />
                  </div>
                ))}
              </div>
            </div>

            {/* Selected card detail */}
            {selectedCard !== null && spread.cards[selectedCard] && (
              <div className="card-detail-popup">
                <button className="card-detail-close" onClick={() => setSelectedCard(null)}>✕</button>
                <div className="card-detail-layout">
                  <div className="card-detail-image-wrap">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/tarot/${spread.cards[selectedCard].id}.jpg`}
                      alt={spread.cards[selectedCard].name}
                      className={`card-detail-img ${spread.cards[selectedCard].isReversed ? "reversed" : ""}`}
                    />
                    <div className="card-detail-orientation">
                      {spread.cards[selectedCard].isReversed ? "↓ กลับหัว" : "↑ ตรง"}
                    </div>
                  </div>
                  <div className="card-detail-info">
                    <div className="card-detail-pos">{CELTIC_CROSS_POSITIONS[selectedCard].nameTh}</div>
                    <h3>{spread.cards[selectedCard].nameTh}</h3>
                    <p className="card-detail-name-en">{spread.cards[selectedCard].name}</p>
                    <div className="card-detail-astro">
                      <span>🔭 {spread.cards[selectedCard].astro}</span>
                    </div>
                    <div className="card-detail-keywords">
                      {spread.cards[selectedCard].keywordsTh.map(k => (
                        <span key={k} className="keyword-tag">{k}</span>
                      ))}
                    </div>
                    <p className="card-detail-meaning">
                      {spread.cards[selectedCard].isReversed
                        ? spread.cards[selectedCard].reversed
                        : spread.cards[selectedCard].upright}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Interpretation */}
          <div className="tarot-interpretation" ref={interpretRef}>
            <div className="report-opener">
              <span>AI Interpretation · Celtic Cross</span>
              <h2>คำแนะนำจากไพ่</h2>
              <p>คลิกที่ไพ่แต่ละใบเพื่อดูความหมายโดยละเอียด</p>
            </div>

            {isStreaming && (
              <div className="tarot-streaming-indicator">
                <div className="draw-orbit" style={{ width: "40px", height: "40px" }} />
                <span>กำลังอ่านพลังงานจักรวาล…</span>
              </div>
            )}

            {interpretation && (
              <div className="tarot-interpretation-text">
                {interpretation.split("\n").map((line, i) => {
                  if (line.startsWith("**✦")) {
                    return <h3 key={i} className="tarot-section-heading">{line.replace(/\*\*/g, "")}</h3>;
                  }
                  if (line.trim() === "") return <br key={i} />;
                  return <p key={i}>{line}</p>;
                })}
              </div>
            )}

            {!isStreaming && interpretation && (
              <div className="tarot-actions">
                <button className="ghost-button" onClick={reset}>เปิดไพ่ใหม่</button>
                <a href="/" className="luxury-button" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
                  รับคำแนะนำจากดวง →
                </a>
              </div>
            )}
          </div>
        </section>
      )}

      <footer className="legal-line">
        ไพ่ทาโร่ใช้เป็นมุมมองสะท้อนพลังงานและแนวโน้ม ไม่ใช่การการันตีอนาคต
      </footer>
    </main>
  );
}
