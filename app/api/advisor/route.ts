export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import OpenAI from "openai";
import { calculateChart } from "@/lib/astrology";
import { buildAdvisorPrompt } from "@/lib/advisorPrompt";
import { calculateTransits, formatTransitForPrompt } from "@/lib/transit";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function num(v: unknown, fallback: number) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: "ยังไม่ได้ตั้งค่า OPENAI_API_KEY ใน .env.local" }), { status: 500 });
    }

    const body = await req.json();
    const { topic, situation, options, concern, goal, birthDate, birthTime, category, advisorTone, selectedProvince } = body;

    if (!topic || !birthDate || !birthTime) {
      return new Response(JSON.stringify({ error: "กรุณากรอกเรื่องที่ปรึกษา วันเกิด และเวลาเกิด" }), { status: 400 });
    }

    const chart = await calculateChart({
      birthDate,
      birthTime,
      timezoneOffset: num(body.timezoneOffset, 7),
      latitude: num(body.latitude, 13.7563),
      longitude: num(body.longitude, 100.5018),
    });

    const transitReport = await calculateTransits(chart);
    const transitText = formatTransitForPrompt(transitReport);
    const prompt = buildAdvisorPrompt({ topic, situation, options, concern, goal, chart, category, advisorTone, selectedProvince, transitText });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        // Send chart data first
        controller.enqueue(encoder.encode(
          `data: ${JSON.stringify({ type: "chart", chart })}\n\n`
        ));

        try {
          const response = await client.responses.create({
            model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
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
