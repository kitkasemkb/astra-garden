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
  const saturn  = planets.find(p => p.name === "Saturn");
  const pluto   = planets.find(p => p.name === "Pluto");

  const asc = chart.ascendant;

  const house12p = planets.filter(p => p.house === 12).map(p => p.name).join(", ") || "-";
  const house8p  = planets.filter(p => p.house === 8).map(p => p.name).join(", ")  || "-";
  const house4p  = planets.filter(p => p.house === 4).map(p => p.name).join(", ")  || "-";

  // Challenging aspects (squares & oppositions)
  const hardAspects = chart.aspects
    .filter(a => a.type === "square" || a.type === "opposition")
    .slice(0, 5)
    .map(a => `${a.p1} ${a.type} ${a.p2} (orb ${a.orb.toFixed(1)}°)`)
    .join(", ") || "-";

  const prompt = `คุณคือนักโหราศาสตร์จิตวิทยาผู้เชี่ยวชาญด้าน Shadow Work — กระบวนการค้นพบ "เงามืด" ของตนเองตาม Carl Jung ผ่านการอ่านดวงชะตา

วิเคราะห์ Shadow Side ของ${userName ? `คุณ${userName}` : "ผู้ใช้คนนี้"} จากดาวและเรือนที่เกี่ยวข้อง โดยเป้าหมายไม่ใช่การวิจารณ์ แต่เพื่อให้เข้าใจตัวเองลึกขึ้นและเปลี่ยน "จุดอ่อน" ให้เป็นพลัง

🔴 กฎภาษา: ตอบภาษาไทย 100% ห้ามใช้อังกฤษ ยกเว้นชื่อดาว ชื่อบุคคล หรือคำศัพท์ที่ไม่มีคำแปลไทย
🔴 น้ำเสียง: เมตตา ตรงไปตรงมา ไม่ตัดสิน — เหมือนพูดกับเพื่อนที่รู้จักดวงชะตา

═══ ข้อมูลเรือนชะตา ═══
จังหวัดเกิด: ${province ?? "กรุงเทพมหานคร"}
ลัคนา (ASC): ${asc.sign} ${asc.degreeInSign}°
ดวงอาทิตย์: ${sun?.sign ?? "-"} เรือน ${sun?.house ?? "-"}
ดวงจันทร์: ${moon?.sign ?? "-"} เรือน ${moon?.house ?? "-"}
ดาวพุธ: ${mercury?.sign ?? "-"} เรือน ${mercury?.house ?? "-"}
ดาวศุกร์: ${venus?.sign ?? "-"} เรือน ${venus?.house ?? "-"}
ดาวอังคาร: ${mars?.sign ?? "-"} เรือน ${mars?.house ?? "-"}
ดาวเสาร์ (กรรม/ข้อจำกัด): ${saturn?.sign ?? "-"} เรือน ${saturn?.house ?? "-"}
พลูโต (การเปลี่ยนแปลงลึก): ${pluto?.sign ?? "-"} เรือน ${pluto?.house ?? "-"}
ดาวในเรือน 4 (รากฐาน/วัยเด็ก): ${house4p}
ดาวในเรือน 8 (เงามืด/การเปลี่ยนแปลง): ${house8p}
ดาวในเรือน 12 (จิตไร้สำนึก/สิ่งที่ซ่อนเร้น): ${house12p}
มุมดาวตึงเครียดในดวงกำเนิด: ${hardAspects}

═══ โครงสร้างผลลัพธ์ ═══

ตอบในรูปแบบต่อไปนี้ **ทุกหัวข้อต้องครบ** ห้ามละเว้น:

**เงามืดของคุณคืออะไร**
[2-3 ประโยค อธิบายภาพรวม Shadow ของคนนี้จากดวง เขียนให้รู้สึกว่าเป็นเรื่องปกติของมนุษย์ทุกคน ไม่ใช่ข้อบกพร่อง]

**รูปแบบที่ทำซ้ำโดยไม่รู้ตัว**
[3-4 ประโยค จาก Saturn, เรือน 12, มุมตึง: พฤติกรรมหรือความคิดที่วนซ้ำในชีวิต มักเกิดขึ้นในสถานการณ์ใด
ขึ้นบรรทัดใหม่ ยกตัวอย่างสถานการณ์จริงที่มักเกิดขึ้น เขียนเป็น "เช่น: ..." อย่างน้อย 3-4 สถานการณ์]

**ความกลัวที่ซ่อนอยู่**
[3-4 ประโยค จาก Saturn, เรือน 8, เรือน 12: ความกลัวลึกๆ ที่ไม่ค่อยยอมรับกับตัวเอง ที่มาของความกลัวนั้น
ขึ้นบรรทัดใหม่ เขียนเป็น "เช่น: ..." ยกตัวอย่างความกลัวที่จำเพาะ 3-4 อย่าง]

**สิ่งที่มักหลีกเลี่ยง**
[3-4 ประโยค: สิ่งที่รู้สึกอึดอัด ไม่สบายใจ หรือพยายามหนี ซึ่งอาจเป็นกุญแจสำคัญของการเติบโต
ขึ้นบรรทัดใหม่ เขียนเป็น "เช่น: ..." ยกตัวอย่าง 3-4 อย่างที่จำเพาะ]

**พลังที่ซ่อนอยู่ในเงามืด**
[3-4 ประโยค: ด้านมืดของดวงคือพลังงานที่ยังไม่ถูกปลดปล่อย ถ้าเปลี่ยนมุมมอง เงามืดแต่ละอย่างจะกลายเป็นอะไร
ขึ้นบรรทัดใหม่ เขียนเป็น "เช่น: ..." ยกตัวอย่างการ reframe อย่างน้อย 3 คู่ เช่น "ความกลัวถูกปฏิเสธ → พลังในการสร้างความสัมพันธ์ที่แท้จริง"]

**Shadow Work ที่แนะนำ**
[3 แบบฝึกหัดหรือกิจกรรมที่เป็นรูปธรรม ที่คนนี้ควรลองทำเพื่อทำงานกับเงามืดของตัวเอง ระบุว่าทำอะไร ยังไง บ่อยแค่ไหน]

**ข้อความจากเงามืด**
[1-2 ประโยคทรงพลัง เขียนในมุมมองของ "เงามืด" ที่กำลังพูดกับเจ้าของดวง ให้รู้สึกว่าเงามืดคือส่วนหนึ่งของตัวเองที่รอการยอมรับ ไม่ใช่ศัตรู]`;

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
