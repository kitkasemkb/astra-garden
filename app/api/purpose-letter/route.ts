export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import OpenAI from "openai";
import { calculateChart } from "@/lib/astrology";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  const { birthDate, birthTime, latitude, longitude, province, userName } = await req.json();

  const chart = await calculateChart({
    birthDate, birthTime,
    timezoneOffset: 7,
    latitude: latitude ?? 13.7563,
    longitude: longitude ?? 100.5018,
  });

  const planets = chart.planets;
  const sun     = planets.find(p => p.name === "Sun");
  const moon    = planets.find(p => p.name === "Moon");
  const mercury = planets.find(p => p.name === "Mercury");
  const venus   = planets.find(p => p.name === "Venus");
  const mars    = planets.find(p => p.name === "Mars");
  const jupiter = planets.find(p => p.name === "Jupiter");
  const saturn  = planets.find(p => p.name === "Saturn");
  const asc = chart.ascendant;
  const mc  = chart.midheaven;

  const name = userName || "ผู้อ่านที่รัก";
  const birthYear = new Date(birthDate).getFullYear() + 543;

  const prompt = `คุณคือดวงดาวที่ได้ดูแล${userName ? `คุณ${name}` : "มนุษย์คนนี้"}มาตั้งแต่วันเกิด

เขียน "จดหมายจากดวงดาว" ที่สวยงาม ลึกซึ้ง และทรงพลัง ถึง${userName ? `คุณ${name}` : "ผู้รับ"} เพื่อสื่อสาร Life Purpose ของเขา/เธอ

🔴 กฎภาษา: ตอบภาษาไทย 100% สวยงาม ลึกซึ้ง เหมือนบทกวีร้อยแก้ว
🔴 น้ำเสียง: อบอุ่น ทรงพลัง เหมือนจดหมายจากผู้ที่รู้จักเจ้าของดวงดีที่สุด — ไม่ใช่ AI แต่คือดวงดาว

═══ ข้อมูลดวงกำเนิด ═══
ปีเกิด (พ.ศ.): ${birthYear}
จังหวัดเกิด: ${province ?? "กรุงเทพมหานคร"}
ลัคนา: ${asc.sign} ${asc.degreeInSign}° | MC: ${mc.sign}
ดวงอาทิตย์: ${sun?.sign} เรือน ${sun?.house}
ดวงจันทร์: ${moon?.sign} เรือน ${moon?.house}
ดาวพุธ: ${mercury?.sign} เรือน ${mercury?.house}
ดาวศุกร์: ${venus?.sign} เรือน ${venus?.house}
ดาวอังคาร: ${mars?.sign} เรือน ${mars?.house}
ดาวพฤหัส: ${jupiter?.sign} เรือน ${jupiter?.house}
ดาวเสาร์: ${saturn?.sign} เรือน ${saturn?.house}

═══ โครงสร้างจดหมาย ═══

เขียนจดหมายที่มีโครงสร้างดังนี้ — แต่ให้ไหลลื่นเป็นธรรมชาติ ไม่ต้องมีหัวข้อแยก:

**คำขึ้นต้น**
[เริ่มด้วยการเรียกชื่อ${userName ? `คุณ${name}` : "ผู้รับ"}อย่างอบอุ่น แนะนำตัวว่าผู้เขียนคือดวงดาว]

**วันที่ถูกส่งมา**
[อธิบายว่าเขา/เธอถูกส่งมาในโลกนี้ด้วยจุดประสงค์ใด จากดวงอาทิตย์และลัคนา เขียนเป็นบทกวีร้อยแก้ว 3-4 ประโยค]

**สิ่งที่หัวใจรู้มาตลอด**
[จาก Moon และ Venus: สิ่งที่จิตใจลึกๆ รู้มาตลอดว่าตัวเองรักและต้องการ เขียนอย่างละเอียดอ่อน 3-4 ประโยค]

**พลังที่ถูกมอบให้**
[จาก Mercury, Mars, ASC: ความสามารถและพลังพิเศษที่ดวงดาวมอบให้ เขียนให้รู้สึกว่าสิ่งเหล่านี้คือของขวัญ 3-4 ประโยค]

**บทบาทในโลกใบนี้**
[จาก Jupiter, MC, เรือน 11: สิ่งที่โลกรอคอยจากเขา/เธอ ผลกระทบที่ชีวิตนี้จะสร้าง 3-4 ประโยค]

**ช่วงเวลาที่เหนื่อย**
[จาก Saturn: พูดถึงความยากลำบากและข้อจำกัดที่เขา/เธออาจเจอ แต่บอกว่ามันคือส่วนหนึ่งของการเติบโต ไม่ใช่ความผิดพลาด 2-3 ประโยค]

**Life Purpose ของเขา/เธอ**
[สรุป Life Purpose ในประโยคที่จำได้และทรงพลัง 2-3 ประโยค — นี่คือแก่นกลางของจดหมาย]

**คำปิดท้าย**
[ลงท้ายอย่างอบอุ่น ทรงพลัง ให้รู้สึกว่าดวงดาวจะอยู่เคียงข้างเสมอ ลายเซ็นคือ "ดวงดาวที่ดูแลคุณมาตั้งแต่วันแรก"]`;

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
