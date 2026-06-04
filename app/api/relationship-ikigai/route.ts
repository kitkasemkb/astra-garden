export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import OpenAI from "openai";
import { calculateChart } from "@/lib/astrology";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  const {
    birthDate, birthTime, latitude, longitude, province, userName,
    partnerBirthDate, partnerBirthTime, partnerLatitude, partnerLongitude, partnerProvince, partnerName,
  } = await req.json();

  const [myChart, partnerChart] = await Promise.all([
    calculateChart({ birthDate, birthTime, timezoneOffset: 7, latitude: latitude ?? 13.7563, longitude: longitude ?? 100.5018 }),
    calculateChart({ birthDate: partnerBirthDate, birthTime: partnerBirthTime, timezoneOffset: 7, latitude: partnerLatitude ?? 13.7563, longitude: partnerLongitude ?? 100.5018 }),
  ]);

  function chartSummary(c: typeof myChart) {
    const p = c.planets;
    const sun  = p.find(x => x.name === "Sun");
    const moon = p.find(x => x.name === "Moon");
    const venus = p.find(x => x.name === "Venus");
    const mars  = p.find(x => x.name === "Mars");
    const jupiter = p.find(x => x.name === "Jupiter");
    const saturn  = p.find(x => x.name === "Saturn");
    const h2 = p.filter(x => x.house === 2).map(x => x.name).join(", ") || "-";
    const h6 = p.filter(x => x.house === 6).map(x => x.name).join(", ") || "-";
    const h10 = p.filter(x => x.house === 10).map(x => x.name).join(", ") || "-";
    const h11 = p.filter(x => x.house === 11).map(x => x.name).join(", ") || "-";
    const h5  = p.filter(x => x.house === 5).map(x => x.name).join(", ") || "-";
    return `ลัคนา: ${c.ascendant.sign} | MC: ${c.midheaven.sign}
Sun: ${sun?.sign} เรือน ${sun?.house} | Moon: ${moon?.sign} เรือน ${moon?.house}
Venus: ${venus?.sign} เรือน ${venus?.house} | Mars: ${mars?.sign} เรือน ${mars?.house}
Jupiter: ${jupiter?.sign} เรือน ${jupiter?.house} | Saturn: ${saturn?.sign} เรือน ${saturn?.house}
เรือน 2: ${h2} | เรือน 5: ${h5} | เรือน 6: ${h6} | เรือน 10: ${h10} | เรือน 11: ${h11}`;
  }

  const me = userName || "คุณ";
  const partner = partnerName || "คู่ของคุณ";

  const prompt = `คุณคือนักโหราศาสตร์คู่รักที่เชี่ยวชาญการเปรียบ Ikigai ของสองคน เพื่อดูว่าจุดประสงค์ชีวิตของทั้งคู่เสริมกันหรือขัดกันในจุดใด

🔴 กฎภาษา: ตอบภาษาไทย 100% ห้ามใช้อังกฤษ ยกเว้นชื่อดาว
🔴 กฎ format: ใช้ **หัวข้อ** (asterisk คู่) เท่านั้นสำหรับหัวข้อ ห้ามใช้ ## หรือ ### เด็ดขาด

═══ ข้อมูลดวงกำเนิด ${me} ═══
จังหวัด: ${province ?? "กรุงเทพมหานคร"}
${chartSummary(myChart)}

═══ ข้อมูลดวงกำเนิด ${partner} ═══
จังหวัด: ${partnerProvince ?? "กรุงเทพมหานคร"}
${chartSummary(partnerChart)}

═══ โครงสร้างผลลัพธ์ ═══

**Ikigai ของ ${me}**
[2-3 ประโยค สรุป Ikigai core ของ${me}จากดวง]

**Ikigai ของ ${partner}**
[2-3 ประโยค สรุป Ikigai core ของ${partner}จากดวง]

**จุดที่เสริมกัน**
[3-4 ประโยค อธิบายว่า Ikigai ของสองคนเสริมกันในด้านใด ทั้งคู่ช่วยให้กันบรรลุจุดประสงค์ชีวิตได้อย่างไร
ขึ้นบรรทัดใหม่ เขียนเป็น "เช่น: ..." ยกตัวอย่าง 3-4 สถานการณ์จริงที่ Ikigai ของสองคนเสริมกัน]

**จุดที่อาจขัดกัน**
[3-4 ประโยค อธิบายอย่างตรงไปตรงมาแต่เมตตา ว่าความต้องการหรือจุดประสงค์ชีวิตของสองคนอาจขัดแย้งกันในจุดใด
ขึ้นบรรทัดใหม่ เขียนเป็น "เช่น: ..." ยกตัวอย่าง 3-4 สถานการณ์ที่มักทำให้เกิดความขัดแย้ง]

**พลังของคู่นี้เมื่ออยู่ด้วยกัน**
[3-4 ประโยค ถ้าทั้งคู่เข้าใจ Ikigai ของกันและกัน พวกเขาจะสร้างอะไรร่วมกันได้ ผลกระทบที่คู่นี้มีต่อโลกรอบข้างคืออะไร
ขึ้นบรรทัดใหม่ ยกตัวอย่าง "เช่น: ..." สิ่งที่ทั้งคู่สามารถสร้างหรือทำร่วมกันได้ 3-4 อย่าง]

**วิธีเดินทางสู่ Ikigai ร่วมกัน**
[3 ขั้นตอนที่เป็นรูปธรรม ที่คู่นี้ควรทำร่วมกันเพื่อสนับสนุน Ikigai ของกันและกัน]

**ข้อความจากดวงดาวถึงคู่นี้**
[1-2 ประโยคทรงพลัง สรุปสาระสำคัญของคู่นี้ในภาษาที่จำได้]`;

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
          max_output_tokens: 3000,
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
