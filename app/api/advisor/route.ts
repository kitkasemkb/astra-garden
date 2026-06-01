export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { calculateChart } from "@/lib/astrology";
import { buildAdvisorPrompt } from "@/lib/advisorPrompt";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function num(v: unknown, fallback: number) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "ยังไม่ได้ตั้งค่า OPENAI_API_KEY ใน .env.local" }, { status: 500 });
    }

    const body = await req.json();
    const { topic, situation, options, concern, goal, birthDate, birthTime, category, advisorTone, selectedProvince } = body;

    if (!topic || !situation || !birthDate || !birthTime) {
      return NextResponse.json({ error: "กรุณากรอกเรื่องที่ปรึกษา สถานการณ์ วันเกิด และเวลาเกิด" }, { status: 400 });
    }

    const chart = await calculateChart({
      birthDate,
      birthTime,
      timezoneOffset: num(body.timezoneOffset, 7),
      latitude: num(body.latitude, 13.7563),
      longitude: num(body.longitude, 100.5018),
    });

    const prompt = buildAdvisorPrompt({ topic, situation, options, concern, goal, chart, category, advisorTone, selectedProvince });

    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      input: prompt,
      max_output_tokens: 1800,
    });

    return NextResponse.json({ chart, answer: response.output_text });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[advisor error]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
