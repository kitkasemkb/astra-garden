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

  // House placements relevant to each Ikigai quadrant
  const house2planets = planets.filter(p => p.house === 2).map(p => p.name).join(", ") || "-";
  const house6planets = planets.filter(p => p.house === 6).map(p => p.name).join(", ") || "-";
  const house10planets = planets.filter(p => p.house === 10).map(p => p.name).join(", ") || "-";
  const house11planets = planets.filter(p => p.house === 11).map(p => p.name).join(", ") || "-";
  const house5planets  = planets.filter(p => p.house === 5).map(p => p.name).join(", ") || "-";

  const prompt = `คุณคือนักโหราศาสตร์และนักจิตวิทยาเชิงบวก ผู้เชี่ยวชาญด้านการผสาน Ikigai (อิคิไก) เข้ากับดวงกำเนิด

กรุณาสร้าง **Ikigai ส่วนตัว** สำหรับ${userName ? `คุณ${userName}` : "ผู้ใช้คนนี้"} โดยอ้างอิงจากข้อมูลเรือนชะตาจริงด้านล่าง

🔴 กฎภาษา: ตอบภาษาไทย 100% ทุกประโยค ห้ามใช้อังกฤษ ยกเว้นชื่อดาว

═══ ข้อมูลเรือนชะตา ═══
จังหวัดเกิด: ${province ?? "กรุงเทพมหานคร"}
ลัคนา (ASC): ${asc.sign} ${asc.degreeInSign}°
ราศีกลางฟ้า (MC): ${mc.sign}
ดวงอาทิตย์: ${sun?.sign ?? "-"} เรือน ${sun?.house ?? "-"}
ดวงจันทร์: ${moon?.sign ?? "-"} เรือน ${moon?.house ?? "-"}
ดาวพุธ: ${mercury?.sign ?? "-"} เรือน ${mercury?.house ?? "-"}
ดาวศุกร์: ${venus?.sign ?? "-"} เรือน ${venus?.house ?? "-"}
ดาวอังคาร: ${mars?.sign ?? "-"} เรือน ${mars?.house ?? "-"}
ดาวพฤหัส: ${jupiter?.sign ?? "-"} เรือน ${jupiter?.house ?? "-"}
ดาวเสาร์: ${saturn?.sign ?? "-"} เรือน ${saturn?.house ?? "-"}
ดาวในเรือน 2 (ทรัพย์สิน): ${house2planets}
ดาวในเรือน 5 (ความสุข/สร้างสรรค์): ${house5planets}
ดาวในเรือน 6 (การงาน/สุขภาพ): ${house6planets}
ดาวในเรือน 10 (อาชีพ/ชื่อเสียง): ${house10planets}
ดาวในเรือน 11 (เป้าหมาย/ชุมชน): ${house11planets}

═══ โครงสร้างผลลัพธ์ที่ต้องการ ═══

ตอบในรูปแบบต่อไปนี้ **ทุกหัวข้อต้องครบ** อย่าละเว้นหัวข้อใด:

**สิ่งที่คุณรัก**
[3-4 ประโยค จาก Moon, Venus, เรือน 5 และ Sun sign อธิบายว่าคุณรักอะไร ชอบทำอะไรตอนมีแรงบันดาลใจ อะไรทำให้รู้สึกมีชีวิตชีวา
จากนั้นขึ้นบรรทัดใหม่ ยกตัวอย่างกิจกรรมหรือสิ่งที่รักที่เป็นรูปธรรม เขียนเป็น "เช่น: ..." อย่างน้อย 4-5 รายการ คั่นด้วยจุลภาค]

**สิ่งที่คุณเชี่ยวชาญ**
[3-4 ประโยค จาก Mercury, Mars, ASC อธิบายความสามารถตามธรรมชาติ ทักษะที่โดดเด่น สิ่งที่ทำได้ดีโดยไม่ต้องพยายามมาก
จากนั้นขึ้นบรรทัดใหม่ ยกตัวอย่างทักษะหรืองานที่เชี่ยวชาญที่เป็นรูปธรรม เขียนเป็น "เช่น: ..." อย่างน้อย 4-5 รายการ คั่นด้วยจุลภาค]

**สิ่งที่โลกต้องการ**
[3-4 ประโยค จาก Jupiter, เรือน 11, MC อธิบายบทบาทที่โลกรอคุณอยู่ ปัญหาที่คุณถูกกำหนดมาเพื่อแก้
จากนั้นขึ้นบรรทัดใหม่ ยกตัวอย่างปัญหาหรือความต้องการของโลกที่ตรงกับดวงคุณ เขียนเป็น "เช่น: ..." อย่างน้อย 4-5 รายการ คั่นด้วยจุลภาค]

**สิ่งที่ทำแล้วมีรายได้**
[3-4 ประโยค จาก เรือน 2, 6, 10 และ Saturn อธิบายทิศทางอาชีพและวิธีสร้างมูลค่าจากความสามารถ
จากนั้นขึ้นบรรทัดใหม่ ยกตัวอย่างอาชีพ งาน หรือรูปแบบการหารายได้ที่เหมาะกับดวง เขียนเป็น "เช่น: ..." อย่างน้อย 5-6 รายการ คั่นด้วยจุลภาค เน้นให้จำเพาะและจินตนาการภาพได้ทันที]

**Ikigai ของคุณ**
[2-3 ประโยค สรุปจุดรวมทั้ง 4 วง: ประโยคนี้คือแก่นของชีวิตคุณ เขียนให้กระชับ ทรงพลัง และจำได้ง่าย]

**เส้นทางสู่ Ikigai**
[3 ขั้นตอนที่เป็นรูปธรรมมาก ระบุให้ชัดว่าทำอะไร ที่ไหน อย่างไร ที่คุณสามารถเริ่มทำได้ใน 3-6 เดือน]

**คำทำนายจากดวงดาว**
[1-2 ประโยคทรงพลัง ที่ตอกย้ำพลังพิเศษที่ดวงชะตามอบให้คนนี้]`;

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
