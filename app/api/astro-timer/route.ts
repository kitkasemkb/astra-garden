export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { calculateChart } from "@/lib/astrology";
import { calculateTransits } from "@/lib/transit";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function scoreDay(aspects: Awaited<ReturnType<typeof calculateTransits>>["aspects"]): number {
  return aspects.reduce((sum, a) => {
    const weight = a.influence === "major" ? 2 : 1;
    if (a.energy === "harmonious") return sum + weight;
    if (a.energy === "challenging") return sum - weight;
    return sum;
  }, 0);
}

function scoreToColor(score: number): "good" | "mixed" | "caution" {
  if (score >= 3) return "good";
  if (score <= -3) return "caution";
  return "mixed";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { birthDate, birthTime, timezoneOffset = 7, latitude = 13.7563, longitude = 100.5018, category = "general", mode } = body;

    if (!birthDate || !birthTime) {
      return NextResponse.json({ error: "ต้องการวันเกิดและเวลาเกิด" }, { status: 400 });
    }

    // คำนวณ natal chart
    const natalChart = await calculateChart({ birthDate, birthTime, timezoneOffset, latitude, longitude });

    // mode: "month" = คำนวณทั้งเดือน, "day" = วันเดียวพร้อม AI
    if (mode === "day") {
      const { date } = body;
      const forDate = new Date(date);
      const report = await calculateTransits(natalChart, forDate);
      const score = scoreDay(report.aspects);
      const color = scoreToColor(score);

      const aspectLines = report.aspects.map(a =>
        `- ${a.transitPlanet} ${a.type} ${a.natalPlanet} (${a.energy}): ${a.meaningTh}`
      ).join("\n");

      const categoryTh: Record<string, string> = {
        career: "การงานและอาชีพ",
        love: "ความรักและความสัมพันธ์",
        money: "การเงินและการลงทุน",
        health: "สุขภาพและพลังงาน",
        general: "ชีวิตโดยรวม",
      };

      const prompt = `คุณเป็น astrologer ผู้เชี่ยวชาญ วิเคราะห์พลังงานของวันที่ ${forDate.toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" })} สำหรับเรื่อง "${categoryTh[category] || "ชีวิตโดยรวม"}"

มุมดาวที่พบ:
${aspectLines}

คะแนนรวม: ${score} (${color === "good" ? "วันดี" : color === "caution" ? "ควรระวัง" : "ปานกลาง"})

ให้คำแนะนำสั้นๆ 3-4 ประโยค:
1. บอกว่าวันนี้พลังงานโดยรวมเป็นอย่างไรสำหรับเรื่องที่เลือก
2. สิ่งที่ควรทำหรือหลีกเลี่ยง
3. คำแนะนำที่นำไปปฏิบัติได้จริง

ใช้ภาษาไทย กระชับ ไม่ใช้ศัพท์เทคนิคโหราศาสตร์มากเกินไป`;

      const message = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
        max_tokens: 300,
        messages: [{ role: "user", content: prompt }],
      });

      const advice = message.choices[0]?.message?.content ?? "";

      return NextResponse.json({ score, color, aspects: report.aspects, advice });
    }

    // mode: month — คำนวณทุกวันในเดือนปัจจุบัน
    const now = new Date();
    const year = body.year ?? now.getFullYear();
    const month = body.month ?? now.getMonth(); // 0-based
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1));

    const results = await Promise.all(
      days.map(async (date) => {
        const report = await calculateTransits(natalChart, date);
        const score = scoreDay(report.aspects);
        return {
          date: date.toISOString().split("T")[0],
          score,
          color: scoreToColor(score),
          topAspect: report.aspects[0]?.meaningTh ?? null,
        };
      })
    );

    return NextResponse.json({ days: results, month, year });
  } catch (err) {
    console.error("astro-timer error:", err);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
