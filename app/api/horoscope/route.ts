export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  const { sign, signTh, date } = await req.json();

  const prompt = `คุณคือหมอดูโหราศาสตร์ไทยผู้มีพลังสูง ทำนายดวงประจำวันสำหรับราศี${signTh} (${sign}) วันที่ ${date}

ทำนายอย่างเป็นรูปธรรม ระบุสิ่งที่จะเกิดขึ้นจริงๆ ไม่ใช่แค่คำแนะนำทั่วไป
ใส่พลังงานลึกลับและเสน่ห์ของโหราศาสตร์
ห้ามพูดว่า "ขึ้นอยู่กับตัวคุณ" — หมอดูทำนายอย่างมั่นใจ

รูปแบบ (ใช้ ** ล้อมหัวข้อ):

**ภาพรวมวันนี้**
[ทำนายภาพรวมพลังงานของวัน 2-3 ประโยค ใส่ความเหนือธรรมชาติ]

**ความรัก**
[ทำนายเรื่องความรักและความสัมพันธ์วันนี้]

**การงาน**
[ทำนายเรื่องงานและโอกาสวันนี้]

**การเงิน**
[ทำนายโชคลาภและการเงินวันนี้]

**สุขภาพ**
[ทำนายสุขภาพกายและใจวันนี้]

**ฤกษ์มงคลวันนี้**
[บอกเวลาดี สีมงคล ตัวเลขนำโชค หรือสิ่งที่ควรทำวันนี้]

**ข้อความจากดวงดาว**
[ปิดด้วยประโยคทรงพลังที่ส่งพลังงานบวก 1-2 ประโยค]`;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = await client.responses.create({
          model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
          input: prompt,
          max_output_tokens: 800,
          stream: true,
        });
        for await (const event of response) {
          if (event.type === "response.output_text.delta") {
            controller.enqueue(encoder.encode(
              `data: ${JSON.stringify({ type:"delta", text: event.delta })}\n\n`
            ));
          }
        }
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type:"done" })}\n\n`));
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type:"error", message: msg })}\n\n`));
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: { "Content-Type":"text/event-stream", "Cache-Control":"no-cache" },
  });
}
