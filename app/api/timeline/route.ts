export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import OpenAI from "openai";
import { calculateChart } from "@/lib/astrology";
import { calculateTransits } from "@/lib/transit";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  const { birthDate, birthTime, latitude, longitude, province, userName } = await req.json();

  const natalChart = await calculateChart({
    birthDate, birthTime,
    timezoneOffset: 7,
    latitude: latitude ?? 13.7563,
    longitude: longitude ?? 100.5018,
  });

  const now = new Date();
  const in1m  = new Date(now); in1m.setMonth(in1m.getMonth() + 1);
  const in3m  = new Date(now); in3m.setMonth(in3m.getMonth() + 3);
  const in6m  = new Date(now); in6m.setMonth(in6m.getMonth() + 6);
  const in12m = new Date(now); in12m.setMonth(in12m.getMonth() + 12);

  const [t0, t1, t3, t6, t12] = await Promise.all([
    calculateTransits(natalChart, now),
    calculateTransits(natalChart, in1m),
    calculateTransits(natalChart, in3m),
    calculateTransits(natalChart, in6m),
    calculateTransits(natalChart, in12m),
  ]);

  const planets = natalChart.planets;
  const sun  = planets.find(p => p.name === "Sun");
  const moon = planets.find(p => p.name === "Moon");
  const venus = planets.find(p => p.name === "Venus");
  const mars  = planets.find(p => p.name === "Mars");
  const jupiter = planets.find(p => p.name === "Jupiter");
  const saturn  = planets.find(p => p.name === "Saturn");
  const asc = natalChart.ascendant;
  const mc  = natalChart.midheaven;

  function summariseTransits(t: typeof t0, label: string) {
    const major = t.aspects.filter(a => a.influence === "major").slice(0, 4);
    if (!major.length) return `${label}: ไม่มีมุมดาวสำคัญ`;
    return `${label}: ${major.map(a => `${a.transitPlanet} ${a.type} ${a.natalPlanet} (${a.energy})`).join(", ")}`;
  }

  const prompt = `คุณคือนักโหราศาสตร์ที่เชี่ยวชาญการเชื่อม Transit ดาวกับ Ikigai — หลักปรัชญาการค้นพบจุดประสงค์ชีวิตของญี่ปุ่น

วิเคราะห์ Ikigai Timeline สำหรับ${userName ? `คุณ${userName}` : "ผู้ใช้คนนี้"} โดยดูว่า transit ดาวในแต่ละช่วงเวลา "เปิดประตู" ให้กับ Ikigai วงใด และควรลงมือทำอะไรในช่วงไหน

🔴 กฎภาษา: ตอบภาษาไทย 100% ห้ามใช้อังกฤษ
🔴 กฎ format: ใช้ **หัวข้อ** (asterisk คู่) เท่านั้น ห้ามใช้ ## หรือ ### เด็ดขาด ยกเว้นชื่อดาว

═══ ข้อมูลดวงกำเนิด ═══
จังหวัดเกิด: ${province ?? "กรุงเทพมหานคร"}
ลัคนา: ${asc.sign} | MC: ${mc.sign}
ดวงอาทิตย์: ${sun?.sign} เรือน ${sun?.house} | ดวงจันทร์: ${moon?.sign} เรือน ${moon?.house}
ดาวศุกร์: ${venus?.sign} เรือน ${venus?.house} | ดาวอังคาร: ${mars?.sign} เรือน ${mars?.house}
ดาวพฤหัส: ${jupiter?.sign} เรือน ${jupiter?.house} | ดาวเสาร์: ${saturn?.sign} เรือน ${saturn?.house}

═══ Transit ดาวในแต่ละช่วง ═══
${summariseTransits(t0,  "ตอนนี้")}
${summariseTransits(t1,  "1 เดือนข้างหน้า")}
${summariseTransits(t3,  "3 เดือนข้างหน้า")}
${summariseTransits(t6,  "6 เดือนข้างหน้า")}
${summariseTransits(t12, "12 เดือนข้างหน้า")}

═══ โครงสร้างผลลัพธ์ ═══

**ภาพรวม Ikigai Timeline**
[2-3 ประโยค สรุปภาพรวมว่าช่วง 12 เดือนข้างหน้า ดวงชะตาของคนนี้กำลังเน้นด้านใดของ Ikigai เป็นพิเศษ]

**ตอนนี้ — สิ่งที่ดาวเปิดให้**
วง Ikigai ที่เปิดอยู่: [ระบุว่าเป็นวงใด: สิ่งที่รัก / เชี่ยวชาญ / โลกต้องการ / มีรายได้]
พลังงาน: [harmonious / challenging / mixed]
ความหมาย: [2-3 ประโยค อธิบายว่า transit ตอนนี้ส่งผลต่อ Ikigai ด้านนั้นอย่างไร]
ลงมือทำ: [2 ข้อที่เป็นรูปธรรม ทำได้เดือนนี้เลย]

**1 เดือนข้างหน้า — สิ่งที่ดาวเปิดให้**
วง Ikigai ที่เปิดอยู่: [ระบุวง]
พลังงาน: [harmonious / challenging / mixed]
ความหมาย: [2-3 ประโยค]
ลงมือทำ: [2 ข้อที่เป็นรูปธรรม]

**3 เดือนข้างหน้า — สิ่งที่ดาวเปิดให้**
วง Ikigai ที่เปิดอยู่: [ระบุวง]
พลังงาน: [harmonious / challenging / mixed]
ความหมาย: [2-3 ประโยค]
ลงมือทำ: [2 ข้อที่เป็นรูปธรรม]

**6 เดือนข้างหน้า — สิ่งที่ดาวเปิดให้**
วง Ikigai ที่เปิดอยู่: [ระบุวง]
พลังงาน: [harmonious / challenging / mixed]
ความหมาย: [2-3 ประโยค]
ลงมือทำ: [2 ข้อที่เป็นรูปธรรม]

**12 เดือนข้างหน้า — สิ่งที่ดาวเปิดให้**
วง Ikigai ที่เปิดอยู่: [ระบุวง]
พลังงาน: [harmonious / challenging / mixed]
ความหมาย: [2-3 ประโยค]
ลงมือทำ: [2 ข้อที่เป็นรูปธรรม]

**หน้าต่างทองของ 12 เดือนนี้**
[2-3 ประโยค ระบุช่วงเวลาที่ดีที่สุดสำหรับการก้าวสู่ Ikigai และควรทำอะไรในช่วงนั้น]`;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        controller.enqueue(encoder.encode(
          `data: ${JSON.stringify({ type: "ready" })}\n\n`
        ));

        const response = await client.responses.create({
          model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
          input: prompt,
          max_output_tokens: 2000,
          stream: true,
        });

        for await (const event of response) {
          if (event.type === "response.output_text.delta") {
            controller.enqueue(encoder.encode(
              `data: ${JSON.stringify({ type: "delta", text: event.delta })}\n\n`
            ));
          }
        }

        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`));
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "error", message: msg })}\n\n`));
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
  });
}
