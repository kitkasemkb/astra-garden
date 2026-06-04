export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import OpenAI from "openai";
import { calculateChart } from "@/lib/astrology";
import { calculateTransits, formatTransitForPrompt } from "@/lib/transit";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  const { birthDate, birthTime, latitude, longitude, province, userName, decision, category } = await req.json();

  const natalChart = await calculateChart({
    birthDate, birthTime,
    timezoneOffset: 7,
    latitude: latitude ?? 13.7563,
    longitude: longitude ?? 100.5018,
  });

  const now = new Date();
  const in7  = new Date(now); in7.setDate(in7.getDate() + 7);
  const in14 = new Date(now); in14.setDate(in14.getDate() + 14);
  const in30 = new Date(now); in30.setDate(in30.getDate() + 30);

  const [tNow, t7, t14, t30] = await Promise.all([
    calculateTransits(natalChart, now),
    calculateTransits(natalChart, in7),
    calculateTransits(natalChart, in14),
    calculateTransits(natalChart, in30),
  ]);

  const planets = natalChart.planets;
  const sun  = planets.find(p => p.name === "Sun");
  const moon = planets.find(p => p.name === "Moon");
  const mars = planets.find(p => p.name === "Mars");
  const jupiter = planets.find(p => p.name === "Jupiter");
  const saturn  = planets.find(p => p.name === "Saturn");
  const asc = natalChart.ascendant;
  const mc  = natalChart.midheaven;

  const today = now.toLocaleDateString("th-TH", { weekday:"long", year:"numeric", month:"long", day:"numeric" });

  function transitSummary(t: typeof tNow, label: string) {
    const major = t.aspects.filter(a => a.influence === "major").slice(0, 3);
    if (!major.length) return `${label}: ไม่มีมุมดาวสำคัญ`;
    return `${label}: ${major.map(a => `${a.transitPlanet} ${a.type} ${a.natalPlanet} (${a.energy})`).join(", ")}`;
  }

  const prompt = `คุณคือที่ปรึกษาโหราศาสตร์ระดับสูงที่เชี่ยวชาญการวิเคราะห์ "จังหวะเวลา" ของการตัดสินใจผ่านดวงชะตาและ transit ดาว

วิเคราะห์การตัดสินใจของ${userName ? `คุณ${userName}` : "ผู้ใช้"} โดยใช้ข้อมูลดวงกำเนิดและ transit ดาวจริง

🔴 กฎภาษา: ตอบภาษาไทย 100% ห้ามใช้อังกฤษ ยกเว้นชื่อดาว
🔴 กฎ format: ใช้ **หัวข้อ** (asterisk คู่) เท่านั้น ห้ามใช้ ## หรือ ### เด็ดขาด

═══ ข้อมูลดวงกำเนิด ═══
วันที่วิเคราะห์: ${today}
จังหวัดเกิด: ${province ?? "กรุงเทพมหานคร"}
ลัคนา: ${asc.sign} | MC: ${mc.sign}
ดวงอาทิตย์: ${sun?.sign} เรือน ${sun?.house}
ดวงจันทร์: ${moon?.sign} เรือน ${moon?.house}
ดาวอังคาร: ${mars?.sign} เรือน ${mars?.house}
ดาวพฤหัส: ${jupiter?.sign} เรือน ${jupiter?.house}
ดาวเสาร์: ${saturn?.sign} เรือน ${saturn?.house}

═══ Transit ดาว ═══
${transitSummary(tNow, "วันนี้")}
${transitSummary(t7,  "7 วันข้างหน้า")}
${transitSummary(t14, "14 วันข้างหน้า")}
${transitSummary(t30, "30 วันข้างหน้า")}

═══ การตัดสินใจที่ต้องการวิเคราะห์ ═══
หมวด: ${category ?? "ทั่วไป"}
การตัดสินใจ: "${decision}"

═══ โครงสร้างผลลัพธ์ ═══

**คำตัดสิน**
[บรรทัดแรก: ระบุระดับเดียว จาก 5 ระดับ: "เอื้ออย่างยิ่ง" / "เอื้อ" / "กลางๆ" / "ท้าทาย" / "ท้าทายอย่างยิ่ง"
บรรทัดถัดไป: 2-3 ประโยค สรุปว่าดวง ณ ตอนนี้รองรับการตัดสินใจนี้อย่างไร เขียนให้ตรงและมีพลัง]

**ดาวที่ส่งผลต่อการตัดสินใจนี้**
[อธิบาย 2-3 ดาวที่ transit สำคัญที่สุดต่อการตัดสินใจนี้ แต่ละดาว 1-2 ประโยค ระบุว่าเป็น "เสริม" หรือ "ท้าทาย"]

**ถ้าลงมือวันนี้**
[2-3 ประโยค อธิบายอย่างตรงไปตรงมาว่าจะเกิดอะไรขึ้นถ้าลงมือตัดสินใจทันที ทั้งด้านดีและความเสี่ยง]

**หน้าต่างเวลาที่ดีที่สุด**
[ระบุช่วงเวลาที่ดีที่สุดใน 30 วันข้างหน้า พร้อมอธิบายว่าทำไมช่วงนั้นถึงดี อ้างอิง transit จริง]

**สิ่งที่ควรทำก่อนตัดสินใจ**
[3 ข้อที่เป็นรูปธรรม เป็นการเตรียมตัว/ตรวจสอบ/คำถามที่ต้องตอบให้ได้ก่อน ไม่ใช่คำแนะนำทั่วไป]

**ข้อความจากดวงดาว**
[1-2 ประโยคทรงพลัง สั้น จำได้ง่าย สรุปสาระสำคัญที่ดวงดาวต้องการสื่อเกี่ยวกับการตัดสินใจนี้]`;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // ส่ง transit data ไปก่อน
        controller.enqueue(encoder.encode(
          `data: ${JSON.stringify({ type: "transit", report: tNow })}\n\n`
        ));

        const response = await client.responses.create({
          model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
          input: prompt,
          max_output_tokens: 1800,
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
