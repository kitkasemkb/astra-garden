export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import OpenAI from "openai";
import { calculateChart } from "@/lib/astrology";
import { calculateTransits, formatTransitForPrompt } from "@/lib/transit";

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
  const d3 = new Date(now); d3.setDate(d3.getDate() + 3);
  const d7 = new Date(now); d7.setDate(d7.getDate() + 7);

  const [transitToday, transit3, transit7] = await Promise.all([
    calculateTransits(natalChart, now),
    calculateTransits(natalChart, d3),
    calculateTransits(natalChart, d7),
  ]);

  const upcomingAlerts = [
    ...transit3.aspects.filter(a => a.influence === "major").slice(0, 2).map(a => ({ ...a, daysAhead: 3 })),
    ...transit7.aspects.filter(a => a.influence === "major").slice(0, 2).map(a => ({ ...a, daysAhead: 7 })),
  ];

  const transitText = formatTransitForPrompt(transitToday);
  const today = now.toLocaleDateString("th-TH", { weekday:"long", year:"numeric", month:"long", day:"numeric" });

  const prompt = `คุณคือหมอดูโหราศาสตร์ผู้เชี่ยวชาญ สร้าง Daily Briefing ส่วนตัวสำหรับ${userName ? `คุณ${userName}` : "ผู้ใช้"}
ใช้ข้อมูลดวงชะตาจริงของคนนี้ ไม่ใช่คำทำนายตามราศีทั่วไป

🔴 กฎภาษาที่ต้องปฏิบัติอย่างเคร่งครัด:
- ตอบเป็นภาษาไทยมาตรฐาน 100% ทุกประโยค
- ห้ามใช้ภาษาอังกฤษ ยกเว้นชื่อดาวที่จำเป็น เช่น Jupiter, Venus
- แต่ละประโยคต้องสมบูรณ์ ไม่ขาดหาย

วันที่: ${today}
จังหวัดเกิด: ${province ?? "กรุงเทพมหานคร"}
ลัคนา: ${natalChart.ascendant.sign} ${natalChart.ascendant.degreeInSign}° | MC: ${natalChart.midheaven.sign}
ดาวหลักในดวงกำเนิด: ${natalChart.planets.slice(0,7).map(p=>`${p.name}ใน${p.sign}เรือน${p.house}`).join(", ")}

มุมดาวที่กระทบวันนี้ (Transit):
${transitText}

จากมุมดาว transit ที่แม่นยำนี้ เขียน Daily Briefing เฉพาะบุคคล:

**พลังงานวันนี้**
[วิเคราะห์ว่า transit ที่แรงที่สุดส่งผลต่อชีวิตวันนี้อย่างไร 2-3 ประโยค เชื่อมกับดวงกำเนิดจริง]

**ความรักและความสัมพันธ์**
[transit ส่งผลต่อเรือนความสัมพันธ์อย่างไร บอกเฉพาะเจาะจง]

**การงานและโอกาส**
[transit ส่งผลต่อเรือนการงานอย่างไร]

**การเงิน**
[แนวโน้มการเงินวันนี้จาก transit จริง]

**สุขภาพและพลังงาน**
[ระดับพลังงานและสุขภาพจาก transit]

**สิ่งที่ควรทำวันนี้**
[3 ข้อเฉพาะเจาะจง จาก transit จริง ไม่ใช่คำแนะนำทั่วไป]

**ข้อความจากดวงดาว**
[ประโยคทรงพลัง 1-2 ประโยค ที่ตรงกับ transit วันนี้]`;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        controller.enqueue(encoder.encode(
          `data: ${JSON.stringify({ type:"transit", report: transitToday, upcoming: upcomingAlerts })}\n\n`
        ));

        const response = await client.responses.create({
          model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
          input: prompt,
          max_output_tokens: 1000,
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
