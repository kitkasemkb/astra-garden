"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AspectLegend, AstrologyWheel } from "@/components/AstrologyWheel";
import { createClient } from "@/lib/supabase";

type Chart = {
  ascendant: { longitude: number; sign: string; degreeInSign: number };
  midheaven: { longitude: number; sign: string; degreeInSign: number };
  planets: Array<{
    name: string;
    longitude: number;
    sign: string;
    degreeInSign: number;
    house: number;
  }>;
  aspects: Array<{ p1: string; p2: string; type: string; orb: number }>;
};

const provincePresets = [
  // จังหวัดประเทศไทย 77 จังหวัด: ใช้พิกัดตัวเมือง/ศาลากลางโดยประมาณ เพื่อเลือกได้เร็ว
  { name: "กรุงเทพมหานคร", lat: 13.7563, lon: 100.5018 },
  { name: "กระบี่", lat: 8.0863, lon: 98.9063 },
  { name: "กาญจนบุรี", lat: 14.0228, lon: 99.5328 },
  { name: "กาฬสินธุ์", lat: 16.4322, lon: 103.5066 },
  { name: "กำแพงเพชร", lat: 16.4828, lon: 99.5227 },
  { name: "ขอนแก่น", lat: 16.4419, lon: 102.835 },
  { name: "จันทบุรี", lat: 12.6113, lon: 102.1038 },
  { name: "ฉะเชิงเทรา", lat: 13.6904, lon: 101.0779 },
  { name: "ชลบุรี", lat: 13.3611, lon: 100.9847 },
  { name: "ชัยนาท", lat: 15.1852, lon: 100.1251 },
  { name: "ชัยภูมิ", lat: 15.8068, lon: 102.0315 },
  { name: "ชุมพร", lat: 10.493, lon: 99.18 },
  { name: "เชียงราย", lat: 19.9105, lon: 99.8406 },
  { name: "เชียงใหม่", lat: 18.7883, lon: 98.9853 },
  { name: "ตรัง", lat: 7.5594, lon: 99.6114 },
  { name: "ตราด", lat: 12.2428, lon: 102.5175 },
  { name: "ตาก", lat: 16.8838, lon: 99.1258 },
  { name: "นครนายก", lat: 14.2069, lon: 101.2131 },
  { name: "นครปฐม", lat: 13.8199, lon: 100.0622 },
  { name: "นครพนม", lat: 17.392, lon: 104.7696 },
  { name: "นครราชสีมา", lat: 14.9799, lon: 102.0977 },
  { name: "นครศรีธรรมราช", lat: 8.4304, lon: 99.9631 },
  { name: "นครสวรรค์", lat: 15.7047, lon: 100.1372 },
  { name: "นนทบุรี", lat: 13.8621, lon: 100.5144 },
  { name: "นราธิวาส", lat: 6.4255, lon: 101.8253 },
  { name: "น่าน", lat: 18.7756, lon: 100.773 },
  { name: "บึงกาฬ", lat: 18.3609, lon: 103.6466 },
  { name: "บุรีรัมย์", lat: 14.993, lon: 103.1029 },
  { name: "ปทุมธานี", lat: 14.0208, lon: 100.525 },
  { name: "ประจวบคีรีขันธ์", lat: 11.8124, lon: 99.7973 },
  { name: "ปราจีนบุรี", lat: 14.05, lon: 101.372 },
  { name: "ปัตตานี", lat: 6.8695, lon: 101.2505 },
  { name: "พระนครศรีอยุธยา", lat: 14.3532, lon: 100.5689 },
  { name: "พะเยา", lat: 19.1665, lon: 99.9019 },
  { name: "พังงา", lat: 8.4501, lon: 98.5255 },
  { name: "พัทลุง", lat: 7.6167, lon: 100.074 },
  { name: "พิจิตร", lat: 16.4418, lon: 100.3488 },
  { name: "พิษณุโลก", lat: 16.8211, lon: 100.2659 },
  { name: "เพชรบุรี", lat: 13.1112, lon: 99.939 },
  { name: "เพชรบูรณ์", lat: 16.419, lon: 101.1606 },
  { name: "แพร่", lat: 18.1446, lon: 100.1403 },
  { name: "ภูเก็ต", lat: 7.8804, lon: 98.3923 },
  { name: "มหาสารคาม", lat: 16.1848, lon: 103.3007 },
  { name: "มุกดาหาร", lat: 16.5422, lon: 104.7209 },
  { name: "แม่ฮ่องสอน", lat: 19.301, lon: 97.9654 },
  { name: "ยโสธร", lat: 15.7926, lon: 104.1453 },
  { name: "ยะลา", lat: 6.5411, lon: 101.2804 },
  { name: "ร้อยเอ็ด", lat: 16.0538, lon: 103.652 },
  { name: "ระนอง", lat: 9.9529, lon: 98.6085 },
  { name: "ระยอง", lat: 12.6814, lon: 101.2816 },
  { name: "ราชบุรี", lat: 13.5283, lon: 99.8134 },
  { name: "ลพบุรี", lat: 14.7995, lon: 100.6534 },
  { name: "ลำปาง", lat: 18.2888, lon: 99.4909 },
  { name: "ลำพูน", lat: 18.5745, lon: 99.0087 },
  { name: "เลย", lat: 17.486, lon: 101.7223 },
  { name: "ศรีสะเกษ", lat: 15.1186, lon: 104.322 },
  { name: "สกลนคร", lat: 17.1546, lon: 104.1348 },
  { name: "สงขลา", lat: 7.1898, lon: 100.5951 },
  { name: "สตูล", lat: 6.6238, lon: 100.0674 },
  { name: "สมุทรปราการ", lat: 13.5991, lon: 100.5998 },
  { name: "สมุทรสงคราม", lat: 13.4098, lon: 100.0023 },
  { name: "สมุทรสาคร", lat: 13.5475, lon: 100.2744 },
  { name: "สระแก้ว", lat: 13.824, lon: 102.0646 },
  { name: "สระบุรี", lat: 14.5289, lon: 100.9101 },
  { name: "สิงห์บุรี", lat: 14.8936, lon: 100.3967 },
  { name: "สุโขทัย", lat: 17.0056, lon: 99.8264 },
  { name: "สุพรรณบุรี", lat: 14.4745, lon: 100.1177 },
  { name: "สุราษฎร์ธานี", lat: 9.1382, lon: 99.3215 },
  { name: "สุรินทร์", lat: 14.8829, lon: 103.4937 },
  { name: "หนองคาย", lat: 17.8783, lon: 102.7413 },
  { name: "หนองบัวลำภู", lat: 17.2218, lon: 102.426 },
  { name: "อ่างทอง", lat: 14.5896, lon: 100.4551 },
  { name: "อำนาจเจริญ", lat: 15.8585, lon: 104.6288 },
  { name: "อุดรธานี", lat: 17.4138, lon: 102.7872 },
  { name: "อุตรดิตถ์", lat: 17.6201, lon: 100.0993 },
  { name: "อุทัยธานี", lat: 15.3835, lon: 100.0246 },
  { name: "อุบลราชธานี", lat: 15.2287, lon: 104.8564 },
];

type WizardStep = 0 | 1 | 2 | 3 | 4;

type ResultSection = { title: string; body: string };

const categories = [
  {
    id: "business",
    label: "ธุรกิจ",
    hint: "ขยายกิจการ ลงทุน หุ้นส่วน โปรเจกต์ใหม่",
    prompt: "ฉันกำลังตัดสินใจเรื่องธุรกิจ",
  },
  {
    id: "career",
    label: "การงาน",
    hint: "เปลี่ยนงาน เติบโต ภาระงาน ทิศทางอาชีพ",
    prompt: "ฉันอยากมองทิศทางการงานให้ชัดขึ้น",
  },
  {
    id: "money",
    label: "การเงิน",
    hint: "รายรับ รายจ่าย ความเสี่ยง แผนสำรอง",
    prompt: "ฉันอยากวางแผนการเงินให้รอบคอบขึ้น",
  },
  {
    id: "relationship",
    label: "ความสัมพันธ์",
    hint: "คนรัก ครอบครัว หุ้นส่วน ความเข้าใจกัน",
    prompt: "ฉันอยากเข้าใจความสัมพันธ์นี้ให้มากขึ้น",
  },
  {
    id: "life",
    label: "ชีวิตทั่วไป",
    hint: "ความกังวล ตัวตน จังหวะชีวิต การตัดสินใจ",
    prompt: "ฉันรู้สึกว่าช่วงนี้ชีวิตต้องการทิศทาง",
  },
];

const tones = [
  { id: "gentle", label: "อ่อนโยน", hint: "เหมือนมีคนค่อย ๆ ช่วยฟัง" },
  { id: "direct", label: "ตรงประเด็น", hint: "ชัด กระชับ ไม่อ้อมมาก" },
  {
    id: "deep",
    label: "ลึกและละเอียด",
    hint: "เชื่อมดวงกับบริบทชีวิตให้มากขึ้น",
  },
  { id: "action", label: "เน้นแผนปฏิบัติ", hint: "จบด้วยสิ่งที่ควรทำต่อ" },
];

const stepLabels = [
  "เริ่มต้น",
  "ข้อมูลเกิด",
  "ตั้งคำถาม",
  "เล่าบริบท",
  "รายงาน",
];

function parseSections(answer: string): ResultSection[] {
  const titles = [
    "ผมเข้าใจสถานการณ์ของคุณว่า",
    "ถ้ามองจากดวงกำเนิดและบริบทชีวิตตอนนี้",
    "คำแนะนำตามมุมโหราศาสตร์แบบภาษาง่าย",
    "สิ่งที่ควรระวัง",
    "สิ่งที่ควรลองทำใน 30 วัน",
    "ข้อความสั้น ๆ สำหรับช่วงนี้",
  ];

  const normalized = answer.replace(/\r\n/g, "\n").trim();
  const sections: ResultSection[] = [];

  for (let i = 0; i < titles.length; i++) {
    const current = titles[i];
    const next = titles[i + 1];
    const startPattern = new RegExp(
      `(?:^|\\n)\\s*(?:${i + 1}\\.|##|###)?\\s*${current.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[:：.．]?`,
      "i",
    );
    const match = normalized.match(startPattern);
    if (!match || match.index === undefined) continue;

    const start = match.index + match[0].length;
    let end = normalized.length;
    if (next) {
      const nextPattern = new RegExp(
        `\\n\\s*(?:${i + 2}\\.|##|###)?\\s*${next.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[:：.．]?`,
        "i",
      );
      const nextMatch = normalized.slice(start).match(nextPattern);
      if (nextMatch && nextMatch.index !== undefined)
        end = start + nextMatch.index;
    }

    const body = normalized.slice(start, end).trim();
    if (body) sections.push({ title: current, body });
  }

  return sections.length >= 3
    ? sections
    : [{ title: "ผลการวิเคราะห์", body: normalized }];
}

// ── Dropdown options ─────────────────────────────────────────────
const YEARS_BE = Array.from({ length: 90 }, (_, i) => 2568 - i); // พ.ศ. 2479–2568
const MONTHS_TH = [
  "มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน",
  "กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม",
];
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 60 }, (_, i) => i); // ทุก 1 นาที

export default function HomePage() {
  const [step, setStep] = useState<WizardStep>(0);
  const [category, setCategory] = useState("business");
  const [advisorTone, setAdvisorTone] = useState("gentle");
  const [topic, setTopic] = useState(
    "ควรเดินหน้าธุรกิจ/โปรเจกต์ใหม่ในช่วงนี้ไหม",
  );
  const [situation, setSituation] = useState("");
  const [options, setOptions] = useState("");
  const [concern, setConcern] = useState("");
  const [goal, setGoal] = useState(
    "อยากได้คำแนะนำที่ช่วยให้ตัดสินใจรอบคอบขึ้น",
  );
  // วันเกิด/เวลาเกิด — dropdown แยกส่วน (แสดง พ.ศ. แปลงเป็น ค.ศ. ก่อนคำนวณ)
  const [birthYearBE, setBirthYearBE] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [birthHour, setBirthHour] = useState("");
  const [birthMinute, setBirthMinute] = useState("");

  // computed strings สำหรับส่ง API (ค.ศ.)
  const birthDate = useMemo(() => {
    if (!birthYearBE || !birthMonth || !birthDay) return "";
    const ce = Number(birthYearBE) - 543;
    return `${ce}-${birthMonth.padStart(2,"0")}-${birthDay.padStart(2,"0")}`;
  }, [birthYearBE, birthMonth, birthDay]);

  const birthTime = useMemo(() => {
    if (birthHour === "" || birthMinute === "") return "";
    return `${birthHour.padStart(2,"0")}:${birthMinute.padStart(2,"0")}`;
  }, [birthHour, birthMinute]);

  const [timezoneOffset, setTimezoneOffset] = useState(7);
  const [latitude, setLatitude] = useState(13.7563);
  const [longitude, setLongitude] = useState(100.5018);
  const [selectedProvince, setSelectedProvince] = useState(
    provincePresets[0].name,
  );
  const [answer, setAnswer] = useState("");
  const [chart, setChart] = useState<Chart | null>(null);
  const [loading, setLoading] = useState(false);

  type ChatMessage = { role: "user" | "assistant"; content: string };
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const answerRef = useRef<string>("");
  const chartRef = useRef<Chart | null>(null);

  const currentCategory = useMemo(
    () => categories.find((x) => x.id === category) || categories[0],
    [category],
  );
  const currentTone = useMemo(
    () => tones.find((x) => x.id === advisorTone) || tones[0],
    [advisorTone],
  );
  const sections = answer ? parseSections(answer) : [];

  function chooseProvince(value: string) {
    const p = provincePresets.find((x) => x.name === value);
    setSelectedProvince(value);
    if (p) {
      setLatitude(p.lat);
      setLongitude(p.lon);
    }
  }

  function selectCategory(id: string) {
    const item = categories.find((x) => x.id === id);
    setCategory(id);
    if (item && (!topic.trim() || categories.some((c) => c.prompt === topic)))
      setTopic(item.prompt);
  }

  function nextStep() {
    if (step < 4) setStep((s) => (s + 1) as WizardStep);
  }

  function prevStep() {
    if (step > 0) setStep((s) => (s - 1) as WizardStep);
  }

  async function submit() {
    setLoading(true);
    setAnswer("");
    setChart(null);
    setStep(4);
    try {
      const res = await fetch("/api/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic, situation, options, concern, goal,
          birthDate, birthTime, timezoneOffset, latitude, longitude,
          category, advisorTone, selectedProvince,
        }),
      });

      if (!res.ok || !res.body) {
        const data = await res.json();
        setAnswer(data.error || "เกิดข้อผิดพลาด");
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = JSON.parse(line.slice(6));
          if (data.type === "chart") {
            setChart(data.chart);
            chartRef.current = data.chart;
            setLoading(false);
          } else if (data.type === "delta") {
            setAnswer(prev => { answerRef.current = prev + data.text; return prev + data.text; });
          } else if (data.type === "done") {
            setLoading(false);
            // Auto-save to history if logged in
            try {
              const supabase = createClient();
              const { data: { session } } = await supabase.auth.getSession();
              if (session) {
                await supabase.from("readings").insert({
                  user_id: session.user.id,
                  type: "astrology",
                  category,
                  topic,
                  birth_date: birthDate,
                  birth_time: birthTime,
                  province: selectedProvince,
                  answer: answerRef.current,
                  chart: chartRef.current,
                });
              }
            } catch {}
          } else if (data.type === "error") {
            setAnswer(data.message);
            setLoading(false);
          }
        }
      }
    } catch {
      setAnswer("เชื่อมต่อระบบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
      setLoading(false);
    }
  }

  useEffect(() => {
    // ไม่ auto-scroll — ให้ user เลื่อนเอง
  }, [chatMessages, chatLoading]);

  useEffect(() => {
    if (answer) setChatMessages([]);
  }, [answer]);

  const chatContext = useMemo(() => {
    if (!answer || !chart) return "";
    return `หมวด: ${currentCategory.label} | โทน: ${currentTone.label}
คำถามหลัก: ${topic}
สถานการณ์: ${situation}
ลัคนา: ${chart.ascendant.sign} ${chart.ascendant.degreeInSign}° | MC: ${chart.midheaven.sign} ${chart.midheaven.degreeInSign}°
ดาวหลัก: ${chart.planets.slice(0,5).map(p=>`${p.name}ใน${p.sign}`).join(", ")}
สรุปคำแนะนำ: ${answer.slice(0, 600)}`;
  }, [answer, chart, topic, situation, currentCategory, currentTone]);

  async function sendChat() {
    const text = chatInput.trim();
    if (!text || chatLoading) return;
    const newMessages: ChatMessage[] = [...chatMessages, { role: "user", content: text }];
    setChatMessages(newMessages);
    setChatInput("");
    setChatLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, context: chatContext }),
      });
      const data = await res.json();
      setChatMessages(prev => [...prev, {
        role: "assistant",
        content: data.reply || data.error || "ขออภัย เกิดข้อผิดพลาด",
      }]);
    } catch {
      setChatMessages(prev => [...prev, { role: "assistant", content: "เชื่อมต่อไม่สำเร็จ กรุณาลองใหม่" }]);
    } finally {
      setChatLoading(false);
    }
  }

  const canGoNext =
    step === 1
      ? Boolean(birthDate && birthTime)
      : step === 2
        ? Boolean(topic.trim())
        : step === 3
          ? Boolean(situation.trim())
          : true;

  return (
    <main className="premium-shell">
      <div className="grain" />
      <header className="studio-topbar">
        <button
          className="brand-lockup"
          onClick={() => setStep(0)}
          aria-label="กลับหน้าแรก"
        >
          <span className="brand-sigil">✦</span>
          <span>
            <strong>ASTRA GARDEN</strong>
            <small>Astrology translated into gentle guidance</small>
          </span>
        </button>
        <div className="topbar-meta">
          <span>Personal reading</span>
          <a href="/tarot" className="topbar-tarot-btn">🔮 ไพ่ทาโร่</a>
        </div>
        {/* แสดงเฉพาะมือถือ */}
        <a href="/tarot" className="topbar-tarot-mobile">🔮</a>
      </header>

      {step === 0 && (
        <section className="landing-scene">
          <div className="landing-copy">
            <div className="kicker">V7 Astral Garden Experience</div>
            <h1>พื้นที่เงียบ ๆ สำหรับอ่านจังหวะชีวิตของคุณ</h1>
            <p>
              กรอกเรื่องที่อยากปรึกษาและข้อมูลเกิด ระบบจะคำนวณแผนที่ดวง แล้วแปลมุมมองทางโหราศาสตร์ให้เป็นคำแนะนำที่อ่านง่ายและใช้ไตร่ตรองได้จริง
            </p>
            <div className="landing-actions">
              <button className="luxury-button" onClick={() => setStep(1)}>
                เริ่มอ่านจังหวะชีวิต
              </button>
              <a href="/tarot" className="landing-tarot-btn">
                🔮 ดูไพ่ทาโร่
              </a>
            </div>
            <p className="landing-action-hint">อ่านแบบผ่อนคลาย ใช้เป็นมุมมองประกอบ ไม่ใช่คำตัดสินแทนคุณ</p>
          </div>

          <div className="hero-art" aria-hidden="true">
            <div className="floating-orb orb-one">☉</div>
            <div className="floating-orb orb-two">☾</div>
            <div className="floating-orb orb-three">✧</div>
            <div className="art-card art-main">
              <div className="mini-zodiac">
                {Array.from({ length: 12 }).map((_, i) => (
                  <i key={i} style={{ transform: `rotate(${i * 30}deg)` }} />
                ))}
                <b>ASC</b>
                <em>MC</em>
              </div>
            </div>
            <div className="art-card art-note">
              <small>Today’s theme</small>
              <strong>เลือกจังหวะที่ใช่ ก่อนขยับก้าวใหญ่</strong>
              <p>แปลภาษาดวงให้กลายเป็นคำถามที่ช่วยให้ชีวิตชัดขึ้น</p>
            </div>
            <div className="art-card art-list">
              <span>Birth Chart</span>
              <span>Life Direction</span>
              <span>Gentle Advice</span>
            </div>
          </div>

          <div className="learning-strip">
            <article><span>01</span><b>ดวงกำเนิด</b><p>อ่านแกนตัวตน ลัคนา และจังหวะชีวิตจากข้อมูลเกิด</p></article>
            <article><span>02</span><b>คำถามชีวิต</b><p>เชื่อมดวงกับเรื่องจริงที่คุณกำลังตัดสินใจ</p></article>
            <article><span>03</span><b>คำแนะนำภาษาง่าย</b><p>ไม่ฟันธง แต่ช่วยให้เห็นทางเลือกอย่างอ่อนโยน</p></article>
          </div>
        </section>
      )}

      {step > 0 && (
        <section className="session-layout">
          <aside className="session-rail">
            <div className="rail-card identity-card">
              <span className="rail-label">Session</span>
              <h2>{currentCategory.label}</h2>
              <p>{currentCategory.hint}</p>
              <div className="tone-mini">โทน: {currentTone.label}</div>
            </div>

            <div className="step-timeline">
              {stepLabels.map((label, index) => (
                <button
                  key={label}
                  className={`timeline-item ${step === index ? "active" : ""} ${step > index ? "done" : ""}`}
                  onClick={() => setStep(index as WizardStep)}
                >
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <b>{label}</b>
                </button>
              ))}
            </div>

            <div className="rail-card quiet-note">
              <span className="rail-label">Principle</span>
              <p>
                การอ่านนี้ใช้โหราศาสตร์เป็นเลนส์สะท้อน ไม่ใช่การรับประกันอนาคต
                ผู้ใช้ยังเป็นคนตัดสินใจด้วยข้อมูลจริงเสมอ
              </p>
            </div>
          </aside>

          <section className="session-stage">
            {step === 1 && (
              <div className="editorial-panel birth-panel">
                <div className="panel-number">01</div>
                <div className="panel-heading narrow">
                  <span>Birth data</span>
                  <h2>ข้อมูลเกิดสำหรับสร้างแผนที่ดวง</h2>
                  <p>
                    ดวงชะตาเริ่มต้นจากวันและเวลาเกิด
                    กรอกให้ถูกต้องเพื่อความแม่นยำในการทำนาย
                  </p>
                </div>

                {/* วันเกิด */}
                <div style={{ marginBottom: "20px" }}>
                  <span className="lux-field" style={{ display:"block", marginBottom:"10px" }}>
                    <span>วันเกิด (พ.ศ.)</span>
                  </span>
                  <div className="birth-grid" style={{ gap:"12px" }}>
                    <label className="lux-field">
                      <span>วัน</span>
                      <select value={birthDay} onChange={e => setBirthDay(e.target.value)}>
                        <option value="">-- วัน --</option>
                        {DAYS.map(d => <option key={d} value={String(d)}>{d}</option>)}
                      </select>
                    </label>
                    <label className="lux-field">
                      <span>เดือน</span>
                      <select value={birthMonth} onChange={e => setBirthMonth(e.target.value)}>
                        <option value="">-- เดือน --</option>
                        {MONTHS_TH.map((m, i) => <option key={i} value={String(i+1)}>{m}</option>)}
                      </select>
                    </label>
                    <label className="lux-field">
                      <span>ปี พ.ศ.</span>
                      <select value={birthYearBE} onChange={e => setBirthYearBE(e.target.value)}>
                        <option value="">-- ปี --</option>
                        {YEARS_BE.map(y => <option key={y} value={String(y)}>{y}</option>)}
                      </select>
                    </label>
                  </div>
                </div>

                {/* เวลาเกิด */}
                <div style={{ marginBottom: "20px" }}>
                  <div className="birth-grid" style={{ gap:"12px" }}>
                    <label className="lux-field">
                      <span>ชั่วโมงเกิด</span>
                      <select value={birthHour} onChange={e => setBirthHour(e.target.value)}>
                        <option value="">-- ชั่วโมง --</option>
                        {HOURS.map(h => <option key={h} value={String(h)}>{String(h).padStart(2,"0")} น.</option>)}
                      </select>
                    </label>
                    <label className="lux-field">
                      <span>นาทีเกิด</span>
                      <select value={birthMinute} onChange={e => setBirthMinute(e.target.value)}>
                        <option value="">-- นาที --</option>
                        {MINUTES.map(m => <option key={m} value={String(m)}>{String(m).padStart(2,"0")}</option>)}
                      </select>
                    </label>
                  </div>
                  <small style={{ color:"var(--star-dim)", fontSize:"11px", marginTop:"6px", display:"block" }}>
                    ไม่รู้เวลาเกิดแน่ชัด ให้ประมาณช่วงเวลา เช่น ตีสี่ = 04:00
                  </small>
                </div>

                <label className="lux-field">
                  <span>จังหวัด/สถานที่เกิดแบบเร็ว</span>
                  <select
                    value={selectedProvince}
                    onChange={(e) => chooseProvince(e.target.value)}
                  >
                    {provincePresets.map((p) => (
                      <option key={p.name}>{p.name}</option>
                    ))}
                  </select>
                  <small>
                    สามารถแก้ latitude/longitude เองได้
                    หากต้องการระบุพิกัดละเอียดกว่าระดับจังหวัด
                  </small>
                </label>

                <div className="geo-grid">
                  <label className="lux-field compact-field">
                    <span>Timezone</span>
                    <input
                      type="number"
                      value={timezoneOffset}
                      onChange={(e) =>
                        setTimezoneOffset(Number(e.target.value))
                      }
                    />
                  </label>
                  <label className="lux-field compact-field">
                    <span>Latitude</span>
                    <input
                      type="number"
                      step="0.0001"
                      value={latitude}
                      onChange={(e) => setLatitude(Number(e.target.value))}
                    />
                  </label>
                  <label className="lux-field compact-field">
                    <span>Longitude</span>
                    <input
                      type="number"
                      step="0.0001"
                      value={longitude}
                      onChange={(e) => setLongitude(Number(e.target.value))}
                    />
                  </label>
                </div>

                <div className="tone-suite">
                  <div>
                    <span className="rail-label">Tone</span>
                    <h3>อยากให้หมอดูพูดกับคุณแบบไหน</h3>
                  </div>
                  <div className="premium-choice-grid tone-grid">
                    {tones.map((item) => (
                      <button
                        key={item.id}
                        className={`premium-choice ${advisorTone === item.id ? "selected" : ""}`}
                        onClick={() => setAdvisorTone(item.id)}
                      >
                        <span>{item.label}</span>
                        <small>{item.hint}</small>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="editorial-panel question-panel">
                <div className="panel-number">02</div>
                <div className="panel-heading">
                  <span>Choose your theme</span>
                  <h2>อยากให้ดวงทำนายเรื่องไหน</h2>
                  <p>
                    เลือกหมวดที่ใกล้กับสิ่งที่อยากรู้
                    แล้วเขียนคำถามในใจของคุณ
                  </p>
                </div>

                <div className="premium-choice-grid">
                  {categories.map((item) => (
                    <button
                      key={item.id}
                      className={`premium-choice ${category === item.id ? "selected" : ""}`}
                      onClick={() => selectCategory(item.id)}
                    >
                      <span>{item.label}</span>
                      <small>{item.hint}</small>
                    </button>
                  ))}
                </div>

                <label className="lux-field statement-field">
                  <span>คำถามหลัก</span>
                  <input
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="เช่น ควรเดินหน้าธุรกิจนี้ไหม"
                  />
                </label>
              </div>
            )}

            {step === 3 && (
              <div className="editorial-panel context-panel">
                <div className="panel-number">03</div>
                <div className="panel-heading narrow">
                  <span>Tell the context</span>
                  <h2>เล่าสถานการณ์ให้หมอดูฟัง</h2>
                  <p>
                    ยิ่งเล่าได้ละเอียด ดวงยิ่งแม่น
                    ไม่ต้องเขียนสวย แค่เล่าความจริง
                  </p>
                </div>

                <label className="lux-field story-field">
                  <span>สถานการณ์ตอนนี้</span>
                  <textarea
                    value={situation}
                    onChange={(e) => setSituation(e.target.value)}
                    placeholder="เช่น ตอนนี้กำลังคิดจะขยายกิจการ แต่ยังไม่แน่ใจเรื่องกระแสเงินสด ทีมงาน และจังหวะเวลา..."
                  />
                </label>

                <div className="field-pair">
                  <label className="lux-field">
                    <span>ทางเลือกที่กำลังคิด</span>
                    <input
                      value={options}
                      onChange={(e) => setOptions(e.target.value)}
                      placeholder="เดินหน้าต่อ / พักก่อน / ทดลองเล็ก ๆ"
                    />
                  </label>
                  <label className="lux-field">
                    <span>สิ่งที่กังวลที่สุด</span>
                    <input
                      value={concern}
                      onChange={(e) => setConcern(e.target.value)}
                      placeholder="กลัวตัดสินใจเร็วไป / กลัวเสียโอกาส"
                    />
                  </label>
                </div>

                <label className="lux-field">
                  <span>ผลลัพธ์ที่อยากได้</span>
                  <input
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                  />
                </label>
              </div>
            )}

            {step === 4 && (
              <div className="result-experience">
                {loading && (
                  <div className="editorial-panel loading-panel">
                    <div className="draw-orbit" />
                    <span>Preparing your chart</span>
                    <h2>กำลังคำนวณดวงและแปลความหมาย</h2>
                    <p>
                      ระบบกำลังเชื่อมข้อมูลดวงกับบริบทชีวิตจริง
                      เพื่อให้คำตอบไม่แข็งเป็นสูตรสำเร็จ
                    </p>
                  </div>
                )}

                {!loading && !answer && (
                  <div className="editorial-panel ready-panel">
                    <div className="panel-number">04</div>
                    <div className="panel-heading centered">
                      <span>Ready to read</span>
                      <h2>พร้อมสร้างรายงานส่วนตัว</h2>
                      <p>
                        ระบบจะคำนวณดวงกำเนิด แสดงวงล้อดวง และให้ AI
                        แปลความหมายเป็นคำแนะนำที่อ่านง่าย
                      </p>
                    </div>
                    <button
                      className="luxury-button wide-button"
                      onClick={submit}
                      disabled={!birthDate || !birthTime || !topic.trim()}
                    >
                      คำนวณดวงและทำนาย
                    </button>
                  </div>
                )}

                {chart && (
                  <div className="chart-theater">
                    <div className="chart-focus-card">
                      <div className="chart-titlebar">
                        <span>Birth Chart Wheel</span>
                        <h2>แผนที่ดวงกำเนิด</h2>
                      </div>
                      <AstrologyWheel chart={chart} />
                      <AspectLegend />
                    </div>
                    <aside className="chart-data-card">
                      <span className="rail-label">Chart Snapshot</span>
                      <h3>แกนดวงที่ใช้ในการอ่าน</h3>
                      <div className="metric-list">
                        <div>
                          <small>ลัคนา</small>
                          <strong>
                            {chart.ascendant.sign}{" "}
                            {chart.ascendant.degreeInSign}°
                          </strong>
                        </div>
                        <div>
                          <small>MC / งาน</small>
                          <strong>
                            {chart.midheaven.sign}{" "}
                            {chart.midheaven.degreeInSign}°
                          </strong>
                        </div>
                        <div>
                          <small>Aspect</small>
                          <strong>{chart.aspects.length} รายการ</strong>
                        </div>
                      </div>
                      <div className="planet-ledger">
                        {chart.planets.map((p) => (
                          <div key={p.name}>
                            <span>{p.name}</span>
                            <b>
                              {p.sign} {p.degreeInSign}°
                            </b>
                            <small>เรือน {p.house}</small>
                          </div>
                        ))}
                      </div>
                    </aside>
                  </div>
                )}

                {sections.length > 0 && (
                  <section className="premium-report">
                    <div className="report-opener">
                      <span>Advisor Report</span>
                      <h2>คำแนะนำที่แปลจากดวงและบริบทของคุณ</h2>
                      <p>
                        อ่านเป็นมุมมองประกอบการไตร่ตรอง
                        และใช้ข้อมูลจริงในชีวิตร่วมตัดสินใจเสมอ
                      </p>
                      <a
                        href={`/share?topic=${encodeURIComponent(topic)}&category=${encodeURIComponent(currentCategory.label)}&asc=${encodeURIComponent(chart ? `${chart.ascendant.sign} ${chart.ascendant.degreeInSign}°` : "")}&mc=${encodeURIComponent(chart ? `${chart.midheaven.sign} ${chart.midheaven.degreeInSign}°` : "")}&preview=${encodeURIComponent(sections[0]?.body?.slice(0,120) || "")}`}
                        target="_blank"
                        className="share-btn"
                      >
                        🔗 แชร์ผลทำนาย
                      </a>
                    </div>
                    <div className="report-masonry">
                      {sections.map((section, index) => (
                        <article
                          className={`insight-card insight-${index}`}
                          key={section.title}
                        >
                          <div className="insight-count">
                            {String(index + 1).padStart(2, "0")}
                          </div>
                          <h3>{section.title}</h3>
                          <p>{section.body}</p>
                        </article>
                      ))}
                    </div>
                  </section>
                )}

                {sections.length > 0 && (
                  <div className="chat-section">
                    <div className="chat-header">
                      <div className="chat-header-dot" />
                      <div>
                        <h3>ถามต่อกับที่ปรึกษา</h3>
                        <p>อ่านรายงานแล้วยังมีข้อสงสัย? ถามได้เลย</p>
                      </div>
                    </div>

                    <div className="chat-messages">
                      {chatMessages.length === 0 && (
                        <div className="chat-empty">
                          <span>✦</span>
                          <p>เริ่มต้นด้วยคำถามที่คุณอยากรู้เพิ่มเติม<br />จากการวิเคราะห์ดวงนี้</p>
                        </div>
                      )}
                      {chatMessages.map((msg, i) => (
                        <div key={i} className={`chat-bubble ${msg.role}`}>
                          {msg.content}
                        </div>
                      ))}
                      {chatLoading && (
                        <div className="chat-bubble typing">· · ·</div>
                      )}
                      <div ref={chatEndRef} />
                    </div>

                    <div className="chat-input-row">
                      <textarea
                        className="chat-input"
                        value={chatInput}
                        onChange={e => setChatInput(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            sendChat();
                          }
                        }}
                        placeholder="พิมพ์คำถาม… (Enter ส่ง, Shift+Enter ขึ้นบรรทัดใหม่)"
                        rows={1}
                        disabled={chatLoading}
                      />
                      <button
                        className="chat-send"
                        onClick={sendChat}
                        disabled={!chatInput.trim() || chatLoading}
                        aria-label="ส่ง"
                      >
                        ↑
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="floating-nav">
              <button
                className="ghost-button"
                onClick={prevStep}
                disabled={step === 0 || loading}
              >
                ย้อนกลับ
              </button>
              {step < 4 ? (
                <button
                  className="luxury-button"
                  onClick={nextStep}
                  disabled={!canGoNext}
                >
                  ไปต่อ
                </button>
              ) : (
                <button
                  className="luxury-button"
                  onClick={submit}
                  disabled={
                    loading || !birthDate || !birthTime || !topic.trim()
                  }
                >
                  อ่านใหม่อีกครั้ง
                </button>
              )}
            </div>
          </section>
        </section>
      )}

      <footer className="legal-line">
        คำแนะนำนี้เป็นมุมมองประกอบการไตร่ตรองตามศาสตร์โหราศาสตร์และข้อมูลที่ผู้ใช้ให้
        ไม่ใช่การรับประกันอนาคต หรือคำแนะนำจากผู้เชี่ยวชาญด้านกฎหมาย การแพทย์
        หรือการเงิน
      </footer>
    </main>
  );
}
