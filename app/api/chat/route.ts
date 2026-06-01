export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "ยังไม่ได้ตั้งค่า OPENAI_API_KEY" }, { status: 500 });
    }

    const { messages, context } = await req.json();

    if (!messages?.length) {
      return NextResponse.json({ error: "ไม่มีข้อความ" }, { status: 400 });
    }

    const systemPrompt = `คุณคือ AI Life & Astrology Advisor ภาษาไทย ที่กำลังพูดคุยต่อเนื่องหลังจากให้คำแนะนำเบื้องต้นไปแล้ว

บริบทจากการวิเคราะห์ครั้งแรก:
${context || "ไม่มีบริบท"}

แนวทางการตอบ:
- ตอบในภาษาไทยที่เป็นกันเอง อบอุ่น ไม่เป็นทางการเกินไป
- อ้างอิงข้อมูลดวงและบริบทชีวิตที่รู้จากการวิเคราะห์ก่อนหน้าเมื่อเกี่ยวข้อง
- ตอบกระชับตรงประเด็น 3-6 ประโยค เว้นแต่คำถามต้องการรายละเอียด
- ไม่ฟันธงหรือรับประกันอนาคต ใช้โหราศาสตร์เป็นเลนส์สะท้อน
- หากถามเรื่องการแพทย์ กฎหมาย การเงิน ให้แนะนำปรึกษาผู้เชี่ยวชาญด้วยเสมอ`;

    // Build conversation as a single prompt to match Responses API format
    const conversation = messages
      .map((m: { role: string; content: string }) =>
        m.role === "user" ? `ผู้ใช้: ${m.content}` : `ที่ปรึกษา: ${m.content}`
      )
      .join("\n\n");

    const fullPrompt = `${systemPrompt}\n\n---\nบทสนทนาที่ผ่านมา:\n${conversation}\n\nตอบในฐานะที่ปรึกษา:`;

    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      input: fullPrompt,
      max_output_tokens: 600,
    });

    const reply = response.output_text ?? "ขออภัย ไม่สามารถตอบได้ในขณะนี้";
    return NextResponse.json({ reply });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "เชื่อมต่อไม่สำเร็จ กรุณาลองใหม่" }, { status: 500 });
  }
}
