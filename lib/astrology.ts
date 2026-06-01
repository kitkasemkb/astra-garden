export type PlanetName = "Sun"|"Moon"|"Mercury"|"Venus"|"Mars"|"Jupiter"|"Saturn"|"Uranus"|"Neptune"|"Pluto";

export type PlanetPosition = {
  name: PlanetName;
  longitude: number;
  latitude?: number;
  speed?: number;
  sign: string;
  degreeInSign: number;
  house: number;
};

export type Aspect = {
  p1: PlanetName;
  p2: PlanetName;
  type: "conjunction"|"sextile"|"square"|"trine"|"opposition";
  orb: number;
};

export type BirthInput = {
  birthDate: string; // yyyy-mm-dd
  birthTime: string; // HH:mm
  timezoneOffset: number; // +7 for Thailand
  latitude: number;
  longitude: number; // east positive
};

export type Chart = {
  utcIso: string;
  julianDay: number;
  houseSystem: string;
  zodiacMode: "tropical";
  ephemerisEngine: "Swiss Ephemeris"|"Swiss Ephemeris / Moshier";
  ephemerisMode: "SWISS"|"MOSHIER";
  ascendant: { longitude: number; sign: string; degreeInSign: number };
  midheaven: { longitude: number; sign: string; degreeInSign: number };
  houseCusps: number[];
  planets: PlanetPosition[];
  aspects: Aspect[];
  note: string;
};

const SIGNS = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
const PLANETS: PlanetName[] = ["Sun","Moon","Mercury","Venus","Mars","Jupiter","Saturn","Uranus","Neptune","Pluto"];

const PLANET_CONSTANTS: Record<PlanetName, string> = {
  Sun: "SE_SUN",
  Moon: "SE_MOON",
  Mercury: "SE_MERCURY",
  Venus: "SE_VENUS",
  Mars: "SE_MARS",
  Jupiter: "SE_JUPITER",
  Saturn: "SE_SATURN",
  Uranus: "SE_URANUS",
  Neptune: "SE_NEPTUNE",
  Pluto: "SE_PLUTO",
};

const norm = (x: number) => ((x % 360) + 360) % 360;

function signOf(lon: number) {
  const n = norm(lon);
  const idx = Math.floor(n / 30);
  return { sign: SIGNS[idx], degreeInSign: n - idx * 30 };
}

function toUtcDate(input: BirthInput) {
  const [y,m,d] = input.birthDate.split("-").map(Number);
  const [hh,mm] = input.birthTime.split(":").map(Number);
  return new Date(Date.UTC(y, m - 1, d, hh - input.timezoneOffset, mm || 0, 0));
}

function julianDayFromDate(date: Date) {
  return date.getTime() / 86400000 + 2440587.5;
}

function round(n: number, digits = 4) {
  return Number(n.toFixed(digits));
}

function aspectBetween(a: PlanetPosition, b: PlanetPosition): Aspect | null {
  const raw = Math.abs(norm(a.longitude - b.longitude));
  const diff = raw > 180 ? 360 - raw : raw;
  const defs: Array<[Aspect["type"], number, number]> = [["conjunction",0,8],["sextile",60,5],["square",90,6],["trine",120,6],["opposition",180,8]];
  for (const [type, angle, maxOrb] of defs) {
    const orb = Math.abs(diff - angle);
    if (orb <= maxOrb) return { p1:a.name, p2:b.name, type, orb: round(orb, 2) };
  }
  return null;
}

function houseFromCusps(planetLon: number, cusps: number[], asc: number) {
  // Whole-sign/equal fallback when house cusps are unavailable.
  if (!cusps?.length) return Math.floor(norm(planetLon - asc) / 30) + 1;

  for (let i = 0; i < 12; i++) {
    const start = norm(cusps[i]);
    const end = norm(cusps[(i + 1) % 12]);
    const span = norm(end - start) || 30;
    const rel = norm(planetLon - start);
    if (rel >= 0 && rel < span) return i + 1;
  }
  return Math.floor(norm(planetLon - asc) / 30) + 1;
}

type SweModule = any;

function formatImportError(error: unknown) {
  if (error instanceof Error) {
    const anyError = error as Error & { code?: string; cause?: unknown };
    const cause = anyError.cause instanceof Error ? ` | cause: ${anyError.cause.message}` : "";
    return `${anyError.code ? `[${anyError.code}] ` : ""}${error.message}${cause}`;
  }
  return String(error);
}

async function loadSweph(): Promise<SweModule> {
  try {
    // Use CommonJS require through eval so Next.js does not try to bundle the native addon.
    // This is important for native packages such as sweph on Windows/Vercel.
    // eslint-disable-next-line no-eval
    const nativeRequire = eval("require") as NodeRequire;
    const mod: any = nativeRequire("sweph");
    return mod.default || mod.sweph || mod;
  } catch (requireError) {
    try {
      const mod: any = await import("sweph");
      return mod.default || mod.sweph || mod;
    } catch (importError) {
      const requireMsg = formatImportError(requireError);
      const importMsg = formatImportError(importError);
      throw new Error(
        `โหลดแพ็กเกจ sweph ไม่สำเร็จ\n` +
        `CommonJS require error: ${requireMsg}\n` +
        `Dynamic import error: ${importMsg}\n` +
        `ให้ตรวจว่าแพ็กเกจที่ติดตั้งคือ sweph ไม่ใช่ swisseph และถ้าใช้ Windows ต้องมี Python + Visual Studio Build Tools สำหรับ native addon`
      );
    }
  }
}

const SWE_FALLBACK_CONSTANTS: Record<string, number> = {
  // Planet ids from Swiss Ephemeris
  SE_SUN: 0,
  SE_MOON: 1,
  SE_MERCURY: 2,
  SE_VENUS: 3,
  SE_MARS: 4,
  SE_JUPITER: 5,
  SE_SATURN: 6,
  SE_URANUS: 7,
  SE_NEPTUNE: 8,
  SE_PLUTO: 9,

  // Calculation flags from Swiss Ephemeris
  SEFLG_JPLEPH: 1,
  SEFLG_SWIEPH: 2,
  SEFLG_MOSEPH: 4,
  SEFLG_SPEED: 256,
};

function getConst(swe: SweModule, name: string) {
  // Different sweph builds expose constants differently.
  // Some use swe.constants.SEFLG_SPEED, some expose swe.SEFLG_SPEED,
  // and some native builds expose very few constants even though the functions work.
  const candidates = [
    swe.constants?.[name],
    swe[name],
    swe[name.replace(/^SE_/, "")],
    swe[name.replace(/^SEFLG_/, "FLG_")],
    swe.constants?.[name.replace(/^SE_/, "")],
    swe.constants?.[name.replace(/^SEFLG_/, "FLG_")],
    SWE_FALLBACK_CONSTANTS[name],
  ];

  const value = candidates.find((v) => typeof v === "number");
  if (typeof value !== "number") {
    const available = Object.keys({ ...(swe.constants || {}), ...swe })
      .filter((k) => k.includes("SE") || k.includes("FLG") || k.includes("SUN") || k.includes("MOON"))
      .slice(0, 50)
      .join(", ");
    throw new Error(`Swiss Ephemeris constant not found: ${name}. Available related constants: ${available || "none"}`);
  }
  return value;
}

function setEphemerisPath(swe: SweModule, path: string) {
  if (!path) return;
  if (typeof swe.set_ephe_path === "function") swe.set_ephe_path(path);
  else if (typeof swe.swe_set_ephe_path === "function") swe.swe_set_ephe_path(path);
}

function calcUt(swe: SweModule, jd: number, planetId: number, flags: number): Promise<{ lon: number; lat: number; speed: number; warning?: string }> {
  return new Promise((resolve, reject) => {
    const done = (res: any) => {
      if (!res) return reject(new Error("Swiss Ephemeris returned empty result"));
      if (res.flag === getSafeErr(swe) || res.error) return reject(new Error(res.error || "Swiss Ephemeris calculation error"));
      const data = Array.isArray(res.data) ? res.data : null;
      const lon = data ? data[0] : res.longitude;
      const lat = data ? data[1] : res.latitude;
      const speed = data ? data[3] : (res.longitudeSpeed ?? res.speed ?? 0);
      if (!Number.isFinite(lon)) return reject(new Error("Swiss Ephemeris longitude is invalid"));
      resolve({ lon: norm(lon), lat: Number(lat || 0), speed: Number(speed || 0), warning: res.error || undefined });
    };

    try {
      if (typeof swe.calc_ut === "function") {
        const res = swe.calc_ut(jd, planetId, flags);
        done(res);
      } else if (typeof swe.swe_calc_ut === "function") {
        swe.swe_calc_ut(jd, planetId, flags, done);
      } else {
        reject(new Error("Swiss Ephemeris calc_ut function not found"));
      }
    } catch (error) {
      reject(error);
    }
  });
}

function getSafeErr(swe: SweModule) {
  return swe.constants?.ERR ?? swe.ERR ?? -1;
}

function houses(swe: SweModule, jd: number, flags: number, lat: number, lon: number, system: string) {
  const hsys = system || "P"; // Placidus default
  let res: any;
  if (typeof swe.houses_ex === "function") {
    res = swe.houses_ex(jd, flags, lat, lon, hsys);
  } else if (typeof swe.swe_houses_ex === "function") {
    // legacy callback API support is intentionally not used here because most modern wrappers return sync house data.
    res = swe.swe_houses_ex(jd, flags, lat, lon, hsys);
  } else if (typeof swe.houses === "function") {
    res = swe.houses(jd, lat, lon, hsys);
  } else {
    throw new Error("Swiss Ephemeris houses function not found");
  }

  if (res?.flag === getSafeErr(swe) || res?.error) throw new Error(res.error || "Swiss Ephemeris house calculation error");
  const data = res?.data || res;
  const houseCusps = data?.houses || data?.cusps || [];
  const points = data?.points || data?.ascmc || [];
  const asc = Number(points[0] ?? houseCusps[0]);
  const mc = Number(points[1] ?? points[0] ?? houseCusps[9]);
  if (!Number.isFinite(asc) || !Number.isFinite(mc)) throw new Error("ไม่สามารถคำนวณ Ascendant/MC ได้จาก Swiss Ephemeris");
  return {
    houseCusps: Array.from({ length: 12 }, (_, i) => norm(Number(houseCusps[i]))),
    asc: norm(asc),
    mc: norm(mc),
  };
}

export async function calculateChart(input: BirthInput): Promise<Chart> {
  const swe = await loadSweph();
  const utc = toUtcDate(input);
  const jd = julianDayFromDate(utc);

  const ephePath = process.env.SWISS_EPHEMERIS_PATH || "./ephe";
  const requestedMode = (process.env.EPHEMERIS_MODE || "SWISS").toUpperCase() as "SWISS"|"MOSHIER";
  const houseSystem = process.env.HOUSE_SYSTEM || "P";
  const strict = process.env.STRICT_EPHEMERIS === "true";
  const allowFallback = process.env.ALLOW_MOSHIER_FALLBACK === "true";

  setEphemerisPath(swe, ephePath);

  const SEFLG_SPEED = getConst(swe, "SEFLG_SPEED");
  const SEFLG_SWIEPH = getConst(swe, "SEFLG_SWIEPH");
  const SEFLG_MOSEPH = getConst(swe, "SEFLG_MOSEPH");
  let ephemerisMode: "SWISS"|"MOSHIER" = requestedMode === "MOSHIER" ? "MOSHIER" : "SWISS";
  let flags = SEFLG_SPEED | (ephemerisMode === "SWISS" ? SEFLG_SWIEPH : SEFLG_MOSEPH);

  const calculateWithFlags = async () => {
    const h = houses(swe, jd, flags, input.latitude, input.longitude, houseSystem);
    const planets: PlanetPosition[] = [];
    for (const name of PLANETS) {
      const planetId = getConst(swe, PLANET_CONSTANTS[name]);
      const pos = await calcUt(swe, jd, planetId, flags);
      const s = signOf(pos.lon);
      planets.push({
        name,
        longitude: round(pos.lon),
        latitude: round(pos.lat),
        speed: round(pos.speed, 6),
        sign: s.sign,
        degreeInSign: round(s.degreeInSign, 2),
        house: houseFromCusps(pos.lon, h.houseCusps, h.asc),
      });
    }
    return { h, planets };
  };

  let calculated: Awaited<ReturnType<typeof calculateWithFlags>>;
  try {
    calculated = await calculateWithFlags();
  } catch (error) {
    if (ephemerisMode === "SWISS" && allowFallback && !strict) {
      ephemerisMode = "MOSHIER";
      flags = SEFLG_SPEED | SEFLG_MOSEPH;
      calculated = await calculateWithFlags();
    } else {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Swiss Ephemeris calculation failed: ${message}. หากใช้ EPHEMERIS_MODE=SWISS ให้ตรวจว่าใส่ไฟล์ .se1 ในโฟลเดอร์ ephe และตั้ง SWISS_EPHEMERIS_PATH ถูกต้อง`);
    }
  }

  const aspects: Aspect[] = [];
  for (let i=0;i<calculated.planets.length;i++) for (let j=i+1;j<calculated.planets.length;j++) {
    const asp = aspectBetween(calculated.planets[i], calculated.planets[j]);
    if (asp) aspects.push(asp);
  }

  const ascS = signOf(calculated.h.asc), mcS = signOf(calculated.h.mc);
  const precisionNote = ephemerisMode === "SWISS"
    ? "Production Swiss Ephemeris mode: uses Swiss Ephemeris calculation flags and external .se1 ephemeris files when available. Check Swiss Ephemeris professional license before commercial deployment."
    : "Production Moshier mode via Swiss Ephemeris library: no .se1 files required. For highest commercial precision, set EPHEMERIS_MODE=SWISS and provide licensed Swiss Ephemeris data files.";

  return {
    utcIso: utc.toISOString(),
    julianDay: round(jd, 5),
    houseSystem,
    zodiacMode: "tropical",
    ephemerisEngine: ephemerisMode === "SWISS" ? "Swiss Ephemeris" : "Swiss Ephemeris / Moshier",
    ephemerisMode,
    ascendant: { longitude: round(calculated.h.asc), sign: ascS.sign, degreeInSign: round(ascS.degreeInSign, 2) },
    midheaven: { longitude: round(calculated.h.mc), sign: mcS.sign, degreeInSign: round(mcS.degreeInSign, 2) },
    houseCusps: calculated.h.houseCusps.map((x) => round(x)),
    planets: calculated.planets,
    aspects: aspects.sort((a,b)=>a.orb-b.orb).slice(0,18),
    note: precisionNote,
  };
}
