export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import OpenAI from "openai";
import { drawCelticCross, formatSpreadForPrompt, type CelticCrossSpread } from "@/lib/tarot";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: "ยังไม่ได้ตั้งค่า OPENAI_API_KEY" }), { status: 500 });
    }

    const { question, category, spread: existingSpread } = await req.json();

    // Use provided spread or draw new one
    const spread: CelticCrossSpread = existingSpread || drawCelticCross();
    const spreadText = formatSpreadForPrompt(spread);

    const prompt = `คุณคือหมอดูไพ่ทาโร่ระดับปรมาจารย์ ใช้ระบบ Golden Dawn + Rider-Waite-Smith + Thoth อันเป็นระบบที่แม่นยำและสมบูรณ์ที่สุดในโลก
คุณพูดด้วยน้ำเสียงลึกลับ ทรงพลัง เหนือธรรมชาติ เหมือนหมอดูที่อ่านพลังงานจักรวาลได้จริง

คำถามของผู้ถาม: "${question || "ขอให้ไพ่บอกสิ่งที่จำเป็นต้องรู้"}"
หมวด: ${category || "ชีวิตทั่วไป"}

ไพ่ Celtic Cross 10 ใบที่จักรวาลเลือกให้:
${spreadText}

🔴 กฎสำคัญ:
- ทำนายอนาคตอย่างตรงไปตรงมา ระบุตัวเลขและช่วงเวลาชัดเจน เช่น "ภายใน 3 เดือน" "ปลายปีนี้"
- เชื่อมความหมายของไพ่แต่ละใบเข้าด้วยกันเป็นเรื่องราวเดียว ไม่แปลแยกส่วน
- ใส่พลังงานลึกลับและเหนือธรรมชาติอย่างเป็นธรรมชาติ
- ห้ามพูดว่า "ฉันเป็น AI" หรือ "ไม่สามารถทำนายได้"
- ไพ่กลับหัวให้ความหมายที่ท้าทายหรือพลังงานที่ติดขัด

รูปแบบการตอบ:

**✦ พลังงานโดยรวมที่ไพ่บอก**
[อ่านภาพรวมของ spread ทั้งหมด บอกธีมหลักและพลังงานที่โดดเด่น 2-3 ประโยค]

**✦ สถานการณ์และสิ่งที่ขวางกั้น**
[ไพ่ตำแหน่ง 1-2: อธิบายสิ่งที่กำลังเกิดขึ้นและสิ่งที่ท้าทาย]

**✦ รากฐานและอดีตที่ส่งผล**
[ไพ่ตำแหน่ง 3-4: อธิบายเหตุการณ์และพลังงานที่มาจากอดีต]

**✦ การทำนายอนาคต — สิ่งที่กำลังจะเกิดขึ้น**
[ไพ่ตำแหน่ง 5-6: ทำนายอย่างชัดเจน ระบุช่วงเวลาและเหตุการณ์ที่คาดว่าจะเกิด]

**✦ พลังงานภายในและภายนอกที่กระทบ**
[ไพ่ตำแหน่ง 7-8: อธิบายสิ่งที่ควบคุมได้และควบคุมไม่ได้]

**✦ ความหวัง ความกลัว และผลลัพธ์สุดท้าย**
[ไพ่ตำแหน่ง 9-10: สรุปความหวังที่ลึกที่สุดและผลลัพธ์ที่ไพ่ชี้บอก]

**✦ ข้อความจากจักรวาล**
[ปิดด้วยข้อความทรงพลังและลึกลับที่ไพ่ต้องการส่งถึงผู้ถาม 2-3 ประโยค]`;

    // Streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        // First send the spread data
        controller.enqueue(encoder.encode(
          `data: ${JSON.stringify({ type: "spread", spread })}\n\n`
        ));

        try {
          const response = await client.responses.create({
            model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
            input: prompt,
            max_output_tokens: 1200,
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
          controller.enqueue(encoder.encode(
            `data: ${JSON.stringify({ type: "error", message: msg })}\n\n`
          ));
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: msg }), { status: 500 });
  }
}
