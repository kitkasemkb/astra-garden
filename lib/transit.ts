// Transit Analysis — เปรียบเทียบดาวปัจจุบัน vs ดวงกำเนิด
// ใช้ฟังก์ชั่นจาก astrology.ts เพื่อคำนวณดาวปัจจุบัน
import { calculateChart, type Chart } from "./astrology";

export type TransitAspect = {
  transitPlanet: string;
  natalPlanet: string;
  type: "conjunction" | "sextile" | "square" | "trine" | "opposition";
  orb: number;
  influence: "major" | "minor";
  energy: "harmonious" | "challenging" | "neutral";
  meaningTh: string;
};

export type TransitReport = {
  currentDate: string;
  transitChart: Chart;
  aspects: TransitAspect[];
  summary: string;
};

const ASPECT_DEFS: Array<{
  type: TransitAspect["type"];
  angle: number;
  orb: number;
  energy: TransitAspect["energy"];
  influence: TransitAspect["influence"];
}> = [
  { type: "conjunction", angle: 0,   orb: 8, energy: "neutral",     influence: "major" },
  { type: "sextile",     angle: 60,  orb: 4, energy: "harmonious",  influence: "minor" },
  { type: "square",      angle: 90,  orb: 6, energy: "challenging", influence: "major" },
  { type: "trine",       angle: 120, orb: 6, energy: "harmonious",  influence: "major" },
  { type: "opposition",  angle: 180, orb: 8, energy: "challenging", influence: "major" },
];

const PLANET_MEANINGS: Record<string, Record<string, string>> = {
  Sun:     { conjunction:"พลังชีวิตสูง ดึงดูดความสนใจ", trine:"ฤกษ์ดี ทุกอย่างราบรื่น", sextile:"โอกาสดีในการแสดงตัว", square:"อัตตาสูง ขัดแย้งกับผู้มีอำนาจ", opposition:"ความตึงเครียดกับผู้อื่น" },
  Moon:    { conjunction:"อารมณ์แปรปรวน สัญชาตญาณแหลม", trine:"อารมณ์ดี ความสัมพันธ์ราบรื่น", sextile:"ความสัมพันธ์ที่ดี", square:"อารมณ์ขึ้นลง ระวังการตัดสินใจ", opposition:"ความต้องการขัดแย้งกัน" },
  Mercury: { conjunction:"ความคิดกระฉับกระเฉง การสื่อสารดี", trine:"ความคิดไหลลื่น ลงนามสัญญาได้", sextile:"การสื่อสารดีขึ้น", square:"ระวังความเข้าใจผิด ล่าช้า", opposition:"ข้อมูลขัดแย้ง ระวังการสื่อสาร" },
  Venus:   { conjunction:"เสน่ห์สูง ความรักเบ่งบาน", trine:"ความรักและการเงินราบรื่น", sextile:"โอกาสในความรัก", square:"ปัญหาความสัมพันธ์ ระวังการใช้จ่าย", opposition:"ความต้องการขัดแย้งกับคนรัก" },
  Mars:    { conjunction:"พลังงานสูง ขับเคลื่อนได้ดี", trine:"กล้าหาญ ลงมือได้เลย", sextile:"พลังงานพอดี", square:"ความก้าวร้าว ระวังอุบัติเหตุ", opposition:"ความขัดแย้งกับผู้อื่น" },
  Jupiter: { conjunction:"โชคดีมาก โอกาสและความสำเร็จ", trine:"โชคลาภและการขยายตัว", sextile:"โอกาสที่ดี", square:"โอ้อวดเกินพอดี ระวังความประมาท", opposition:"ระวังการขยายตัวเกินความจริง" },
  Saturn:  { conjunction:"บทเรียนสำคัญ ต้องรับผิดชอบมากขึ้น", trine:"วินัยและโครงสร้างที่ดี", sextile:"ความก้าวหน้าอย่างมั่นคง", square:"อุปสรรคและการทดสอบ", opposition:"แรงกดดันจากภายนอก" },
  Uranus:  { conjunction:"การเปลี่ยนแปลงฉับพลัน ระวังความไม่คาดคิด", trine:"การเปลี่ยนแปลงที่ดี นวัตกรรม", sextile:"โอกาสใหม่ที่ไม่คาดคิด", square:"การเปลี่ยนแปลงที่กระทบ ระวัง", opposition:"ความวุ่นวายและการเปลี่ยนแปลง" },
  Neptune: { conjunction:"จินตนาการสูง ระวังภาพลวงตา", trine:"แรงบันดาลใจและจิตวิญญาณสูง", sextile:"ความคิดสร้างสรรค์ดี", square:"ระวังการหลอกลวงและความสับสน", opposition:"ความสับสนและความฝันที่ไม่เป็นจริง" },
  Pluto:   { conjunction:"การเปลี่ยนแปลงลึกซึ้ง ทรานสฟอร์ม", trine:"พลังงานการเปลี่ยนแปลงที่ดี", sextile:"โอกาสในการเปลี่ยนแปลง", square:"การต่อสู้อำนาจ ต้องเผชิญความกลัว", opposition:"การเผชิญหน้ากับสิ่งที่ซ่อนอยู่" },
};

function norm(x: number) { return ((x % 360) + 360) % 360 }

export async function calculateTransits(natalChart: Chart, forDate?: Date): Promise<TransitReport> {
  const now = forDate ?? new Date();
  const todayInput = {
    birthDate: now.toISOString().split("T")[0],
    birthTime: `${now.getHours().toString().padStart(2,"0")}:00`,
    timezoneOffset: 7,
    latitude: 13.7563,
    longitude: 100.5018,
  };

  const transitChart = await calculateChart(todayInput);
  const aspects: TransitAspect[] = [];

  // Check transiting planets against natal planets
  for (const transitPlanet of transitChart.planets) {
    for (const natalPlanet of natalChart.planets) {
      const raw  = Math.abs(norm(transitPlanet.longitude - natalPlanet.longitude));
      const diff = raw > 180 ? 360 - raw : raw;

      for (const def of ASPECT_DEFS) {
        const orb = Math.abs(diff - def.angle);
        if (orb <= def.orb) {
          const meaning = PLANET_MEANINGS[transitPlanet.name]?.[def.type] ??
            `ดาว${transitPlanet.name} ${def.type} กับ ${natalPlanet.name} ในดวงกำเนิด`;
          aspects.push({
            transitPlanet: transitPlanet.name,
            natalPlanet: natalPlanet.name,
            type: def.type,
            orb: Number(orb.toFixed(2)),
            influence: def.influence,
            energy: def.energy,
            meaningTh: `ดาว${transitPlanet.name} transit ${def.type} กับ ${natalPlanet.name} เกิด: ${meaning}`,
          });
          break;
        }
      }
    }
  }

  // Sort by orb (tightest first) and take top 8
  const top = aspects.sort((a, b) => a.orb - b.orb).slice(0, 8);

  // Summary
  const harmonious = top.filter(a => a.energy === "harmonious").length;
  const challenging = top.filter(a => a.energy === "challenging").length;
  let summary = "";
  if (harmonious > challenging) {
    summary = `ดาวในช่วงนี้เอื้อต่อคุณ มีมุม${harmonious} มุมที่สนับสนุน พลังงานโดยรวมเป็นบวก`;
  } else if (challenging > harmonious) {
    summary = `ช่วงนี้มีมุมท้าทาย ${challenging} มุม ต้องระวังและใช้ความอดทน`;
  } else {
    summary = `ดาวในช่วงนี้ผสมผสาน มีทั้งโอกาสและความท้าทายในสัดส่วนที่สมดุล`;
  }

  return {
    currentDate: now.toLocaleDateString("th-TH", { year:"numeric", month:"long", day:"numeric" }),
    transitChart,
    aspects: top,
    summary,
  };
}

export function formatTransitForPrompt(report: TransitReport): string {
  if (report.aspects.length === 0) return "ไม่พบมุมดาวที่มีนัยสำคัญในช่วงนี้";
  return `วันที่วิเคราะห์: ${report.currentDate}\n${report.summary}\n\nมุมดาวที่สำคัญ:\n` +
    report.aspects.map(a =>
      `- ${a.transitPlanet} ${a.type} ${a.natalPlanet} (orb ${a.orb}°, ${a.energy === "harmonious" ? "✦ เสริม" : a.energy === "challenging" ? "⚡ ท้าทาย" : "◈ กลาง"}): ${a.meaningTh}`
    ).join("\n");
}
