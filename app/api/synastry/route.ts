export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import OpenAI from "openai";
import { calculateChart } from "@/lib/astrology";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  const { personA, personB } = await req.json();

  const [chartA, chartB] = await Promise.all([
    calculateChart({ birthDate: personA.birthDate, birthTime: personA.birthTime, timezoneOffset: 7, latitude: 13.7563, longitude: 100.5018 }),
    calculateChart({ birthDate: personB.birthDate, birthTime: personB.birthTime, timezoneOffset: 7, latitude: 13.7563, longitude: 100.5018 }),
  ]);

  const formatChart = (c: typeof chartA, name: string) =>
    `${name}: ลัคนา ${c.ascendant.sign} | MC ${c.midheaven.sign} | ดาวหลัก: ${c.planets.slice(0,5).map(p=>`${p.name}ใน${p.sign}`).join(", ")}`;

  const prompt = `คุณคือหมอดูผู้เชี่ยวชาญ Synastry โหราศาสตร์เปรียบเทียบดวงสองคน
ใช้พลังลึกลับและความเป็นมืออาชีพในการวิเคราะห์

ดวงกำเนิด:
${formatChart(chartA, personA.name)}
${formatChart(chartB, personB.name)}

วิเคราะห์ความเข้ากันอย่างละเอียด ระบุสิ่งที่เด่นชัดจากดวงจริง ไม่ใช่คำทั่วไป

**ความเข้ากันโดยรวม**
[สรุปความเข้ากันในแบบหมอดู บอกเปอร์เซ็นต์ความเข้ากันด้วย เช่น 78%]

**ความรักและแรงดึงดูด**
[วิเคราะห์จากดาวศุกร์ ดาวอังคาร และลัคนา]

**การสื่อสารและความเข้าใจกัน**
[วิเคราะห์จากดาวพุธและธาตุของราศี]

**การเติมเต็มซึ่งกันและกัน**
[สิ่งที่แต่ละคนมีที่อีกฝ่ายต้องการ]

**จุดที่ต้องระวัง**
[ความขัดแย้งที่อาจเกิดจากดวง บอกให้ชัดเจน]

**อนาคตของความสัมพันธ์นี้**
[ทำนายทิศทางในอีก 1-2 ปี]

**คำแนะนำจากดวงดาว**
[สิ่งที่ทั้งคู่ควรทำเพื่อให้ความสัมพันธ์ดีขึ้น]`;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = await client.responses.create({
          model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
          input: prompt, max_output_tokens: 3000, stream: true,
        });
        for await (const event of response) {
          if (event.type === "response.output_text.delta") {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type:"delta", text: event.delta })}\n\n`));
          }
        }
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type:"done" })}\n\n`));
      } catch (err) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type:"error", message: String(err) })}\n\n`));
      }
      controller.close();
    },
  });

  return new Response(stream, { headers: { "Content-Type":"text/event-stream", "Cache-Control":"no-cache" } });
}
