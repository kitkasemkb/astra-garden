export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import OpenAI from "openai";
import { calculateChart } from "@/lib/astrology";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  const { birthDate, birthTime, latitude, longitude, province, userName } = await req.json();

  const chart = await calculateChart({
    birthDate,
    birthTime,
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

  const house2p  = planets.filter(p => p.house === 2).map(p => p.name).join(", ")  || "-";
  const house6p  = planets.filter(p => p.house === 6).map(p => p.name).join(", ")  || "-";
  const house10p = planets.filter(p => p.house === 10).map(p => p.name).join(", ") || "-";
  const house11p = planets.filter(p => p.house === 11).map(p => p.name).join(", ") || "-";
  const house8p  = planets.filter(p => p.house === 8).map(p => p.name).join(", ")  || "-";

  const prompt = `คุณคือนักโหราศาสตร์อาชีพและที่ปรึกษาด้านการพัฒนาอาชีพ ที่เชี่ยวชาญในการอ่านดวงเพื่อค้นหาเส้นทางอาชีพที่เหมาะสมที่สุดสำหรับแต่ละบุคคล

วิเคราะห์เรือนชะตาของ${userName ? `คุณ${userName}` : "ผู้ใช้คนนี้"} และสร้าง Career Path Report ที่ละเอียดและใช้ได้จริง

🔴 กฎภาษา: ตอบภาษาไทย 100% ห้ามใช้อังกฤษ ยกเว้นชื่อดาวและชื่ออาชีพสากล

═══ ข้อมูลเรือนชะตา ═══
จังหวัดเกิด: ${province ?? "กรุงเทพมหานคร"}
ลัคนา (ASC): ${asc.sign} ${asc.degreeInSign}°
ราศีกลางฟ้า (MC — อาชีพ/ชื่อเสียง): ${mc.sign}
ดวงอาทิตย์: ${sun?.sign ?? "-"} เรือน ${sun?.house ?? "-"}
ดวงจันทร์: ${moon?.sign ?? "-"} เรือน ${moon?.house ?? "-"}
ดาวพุธ: ${mercury?.sign ?? "-"} เรือน ${mercury?.house ?? "-"}
ดาวศุกร์: ${venus?.sign ?? "-"} เรือน ${venus?.house ?? "-"}
ดาวอังคาร: ${mars?.sign ?? "-"} เรือน ${mars?.house ?? "-"}
ดาวพฤหัส: ${jupiter?.sign ?? "-"} เรือน ${jupiter?.house ?? "-"}
ดาวเสาร์: ${saturn?.sign ?? "-"} เรือน ${saturn?.house ?? "-"}
ดาวในเรือน 2 (รายได้): ${house2p}
ดาวในเรือน 6 (การงานประจำวัน): ${house6p}
ดาวในเรือน 8 (การเปลี่ยนแปลง/ทรัพย์ผู้อื่น): ${house8p}
ดาวในเรือน 10 (อาชีพ/ชื่อเสียง): ${house10p}
ดาวในเรือน 11 (เป้าหมาย/เครือข่าย): ${house11p}

═══ โครงสร้างผลลัพธ์ ═══

ตอบในรูปแบบต่อไปนี้ **ทุกหัวข้อต้องครบ** ห้ามละเว้น:

**จุดแข็งด้านอาชีพ**
[2-3 ประโยค สรุปพลังงานอาชีพโดยรวมจาก MC, ASC และดาวหลัก คือภาพรวมว่าคนนี้ถูกสร้างมาเพื่อทำงานแบบไหน]

**อาชีพที่ใช่ที่สุด 1**
ชื่ออาชีพ: [ชื่อชัดเจน]
ความเข้ากัน: [XX%]
เหตุผลจากดวง: [2-3 ประโยค อธิบายว่าดาวและเรือนไหนบ่งบอกอาชีพนี้]
ตำแหน่งงานจริง: [ยกตัวอย่าง 4-5 ตำแหน่งที่จำเพาะ เช่น UX Designer, Brand Strategist]
วิธีเริ่มต้น: [2 ประโยค แนะนำขั้นตอนแรกที่ทำได้ทันที]

**อาชีพที่ใช่ที่สุด 2**
ชื่ออาชีพ: [ชื่อชัดเจน]
ความเข้ากัน: [XX%]
เหตุผลจากดวง: [2-3 ประโยค]
ตำแหน่งงานจริง: [4-5 ตำแหน่ง]
วิธีเริ่มต้น: [2 ประโยค]

**อาชีพที่ใช่ที่สุด 3**
ชื่ออาชีพ: [ชื่อชัดเจน]
ความเข้ากัน: [XX%]
เหตุผลจากดวง: [2-3 ประโยค]
ตำแหน่งงานจริง: [4-5 ตำแหน่ง]
วิธีเริ่มต้น: [2 ประโยค]

**ทางเลือกที่น่าสนใจ**
[รายชื่ออาชีพทางเลือก 5-6 อาชีพ พร้อม % ความเข้ากัน แต่ละอาชีพ 1 ประโยคอธิบาย คั่นด้วยบรรทัดใหม่ในรูปแบบ "- ชื่ออาชีพ (XX%) — เหตุผลสั้น"]

**อาชีพที่ควรระวัง**
[2-3 อาชีพที่ดวงบ่งชี้ว่าจะรู้สึกเหนื่อยหรือขัดกับธรรมชาติ พร้อมเหตุผลสั้น ไม่ใช่การบอกว่าทำไม่ได้ แต่เพื่อเตรียมใจหากเลือกเส้นทางนั้น]

**ก้าวแรกที่ทำได้เลย**
[3 ขั้นตอนที่เป็นรูปธรรมมาก ระบุว่าทำอะไร ที่ไหน อย่างไร สามารถเริ่มได้ภายใน 30 วัน]`;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        controller.enqueue(encoder.encode(
          `data: ${JSON.stringify({ type: "chart", chart })}\n\n`
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
