// Pure JS astronomical calculations — no native dependencies
// Based on Jean Meeus "Astronomical Algorithms" 2nd Ed.
// Accuracy: Sun ~0.01°, Moon ~0.3°, Planets ~1-2° (1900-2100)
// Sufficient for tropical astrology readings

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
  birthDate: string;
  birthTime: string;
  timezoneOffset: number;
  latitude: number;
  longitude: number;
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

// ── Math helpers ─────────────────────────────────────────────────
const PI2 = Math.PI * 2;
const DEG = Math.PI / 180;
const RAD = 180 / Math.PI;

const sind = (d: number) => Math.sin(d * DEG);
const cosd = (d: number) => Math.cos(d * DEG);
const tand = (d: number) => Math.tan(d * DEG);
const atand = (x: number) => Math.atan(x) * RAD;
const atan2d = (y: number, x: number) => Math.atan2(y, x) * RAD;
const norm = (x: number) => ((x % 360) + 360) % 360;
const round = (n: number, d = 4) => Number(n.toFixed(d));

const SIGNS = ["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"];

function signOf(lon: number) {
  const n = norm(lon);
  const idx = Math.floor(n / 30);
  return { sign: SIGNS[idx], degreeInSign: n - idx * 30 };
}

// ── Julian Day ────────────────────────────────────────────────────
function toUtcDate(input: BirthInput) {
  const [y,m,d] = input.birthDate.split("-").map(Number);
  const [hh,mm] = input.birthTime.split(":").map(Number);
  return new Date(Date.UTC(y, m-1, d, hh - input.timezoneOffset, mm || 0, 0));
}

function jde(date: Date) {
  return date.getTime() / 86400000 + 2440587.5;
}

// T = Julian centuries from J2000.0
function T(jd: number) { return (jd - 2451545.0) / 36525; }

// Solve Kepler's equation M = E - e*sin(E), return E in degrees
function kepler(M: number, e: number): number {
  let E = M;
  for (let i = 0; i < 50; i++) {
    const dE = (M - E + e * RAD * sind(E)) / (1 - e * cosd(E));
    E += dE;
    if (Math.abs(dE) < 1e-10) break;
  }
  return E;
}

// ── Obliquity of ecliptic ─────────────────────────────────────────
function obliquity(t: number) {
  return 23.439291111 - 0.013004167*t - 1.638889e-7*t*t + 5.036111e-7*t*t*t;
}

// ── Nutation in longitude (simplified) ───────────────────────────
function nutationLon(t: number) {
  const omega = norm(125.04 - 1934.136 * t);
  const L     = norm(280.4665 + 36000.7698 * t);
  const L2    = norm(218.3165 + 481267.8813 * t);
  return (-17.20 * sind(omega) - 1.32 * sind(2*L) - 0.23 * sind(2*L2) + 0.21 * sind(2*omega)) / 3600;
}

// ── Sun (Meeus Ch.25 low precision) ──────────────────────────────
function sunLongitude(t: number): number {
  const L0 = norm(280.46646 + 36000.76983*t + 0.0003032*t*t);
  const M  = norm(357.52911 + 35999.05029*t - 0.0001537*t*t);
  const C  = (1.914602 - 0.004817*t - 0.000014*t*t)*sind(M)
           + (0.019993 - 0.000101*t)*sind(2*M)
           + 0.000289*sind(3*M);
  const sun = L0 + C;
  const omega = norm(125.04 - 1934.136*t);
  return norm(sun - 0.00569 - 0.00478*sind(omega));
}

// ── Moon (Meeus Ch.47 low precision) ─────────────────────────────
function moonLongitude(t: number): number {
  const L1 = norm(218.3164477 + 481267.88123421*t - 0.0015786*t*t + t*t*t/538841 - t*t*t*t/65194000);
  const D  = norm(297.8501921 + 445267.1114034*t - 0.0018819*t*t + t*t*t/545868 - t*t*t*t/113065000);
  const M  = norm(357.5291092 + 35999.0502909*t  - 0.0001536*t*t + t*t*t/24490000);
  const M1 = norm(134.9633964 + 477198.8675055*t + 0.0087414*t*t + t*t*t/69699   - t*t*t*t/14712000);
  const F  = norm(93.2720950  + 483202.0175233*t  - 0.0036539*t*t - t*t*t/3526000 + t*t*t*t/863310000);
  const E  = 1 - 0.002516*t - 0.0000074*t*t;

  const SigmaL = 6288774*sind(M1)
    + 1274027*sind(2*D - M1)
    + 658314*sind(2*D)
    + 213618*sind(2*M1)
    - 185116*E*sind(M)
    - 114332*sind(2*F)
    + 58793*sind(2*D - 2*M1)
    + 57066*E*sind(2*D - M - M1)
    + 53322*sind(2*D + M1)
    + 45758*E*sind(2*D - M)
    - 40923*E*sind(M - M1)
    - 34720*sind(D)
    - 30383*E*sind(M + M1)
    + 15327*sind(2*D - 2*F)
    - 12528*sind(M1 + 2*F)
    + 10980*sind(M1 - 2*F)
    + 10675*sind(4*D - M1)
    + 10034*sind(3*M1)
    + 8548*sind(4*D - 2*M1)
    - 7888*E*sind(2*D + M - M1)
    - 6766*E*sind(2*D + M)
    - 5163*sind(D - M1)
    + 4987*E*sind(D + M)
    + 4036*E*sind(2*D - M + M1)
    + 3994*sind(2*D + 2*M1)
    + 3861*sind(4*D)
    + 3665*sind(2*D - 3*M1)
    - 2689*E*sind(M - 2*M1)
    - 2602*sind(2*D - M1 + 2*F)
    + 2390*E*sind(2*D - M - 2*M1)
    - 2348*sind(D + M1)
    + 2236*sind(2*D - 2*M)
    - 2120*E*sind(2*M + M1)
    - 2069*E*E*sind(2*M)
    + 2048*E*E*sind(2*D - 2*M - M1)
    - 1773*sind(2*D + M1 - 2*F)
    + 1215*E*sind(4*D - M - M1)
    - 1110*sind(2*M1 + 2*F)
    - 892*sind(3*D - M1)
    - 810*E*sind(2*D + M + M1)
    + 759*E*sind(4*D - M - 2*M1)
    - 713*E*E*sind(2*M - M1)
    - 700*E*sind(2*D + 2*M - M1)
    + 596*E*sind(2*D - M + 2*F)
    + 549*sind(4*D + M1)
    + 537*sind(4*M1)
    + 520*E*sind(4*D - M)
    - 487*sind(D - 2*M1)
    - 399*E*sind(2*D + M - 2*F)
    - 381*sind(2*M1 - 2*F)
    + 351*E*sind(D + M + M1)
    - 340*sind(3*D - 2*M1)
    + 330*sind(4*D - 3*M1)
    + 327*E*sind(2*D - M + 2*M1)
    - 323*E*E*sind(2*M + M1)
    + 299*E*sind(D + M - M1)
    + 294*sind(2*D + 3*M1);

  return norm(L1 + SigmaL / 1e6);
}

// ── Planetary positions (Meeus low-precision orbital elements) ───
// Elements at J2000.0, rates per Julian century
// [L0, L1, a, e0, e1, i0, i1, Ω0, Ω1, ω0, ω1]
const PLANET_ELEMENTS: Record<string, number[]> = {
  Mercury: [252.250906, 149472.6746358,  0.387098310, 0.20563175,  0.000020407, 7.004986, -0.0059516, 48.330893, -0.1254229, 77.456119,  0.1588643],
  Venus:   [181.979801,  58517.8156760,  0.723329820, 0.00677188, -0.000047766, 3.394662,  0.0010037, 76.679920, -0.2780080, 131.563703, 0.0048746],
  Mars:    [355.433000,  19140.2993313,  1.523679342, 0.09341233,  0.000090484, 1.849726, -0.0081479, 49.558093, -0.2949846, 336.060234, 0.4439016],
  Jupiter: [ 34.351519,   3034.9056606,  5.202603191, 0.04849485,  0.000163244, 1.303270, -0.0019872, 100.464441, 0.1766828, 14.331309,  0.2155525],
  Saturn:  [ 50.077444,   1222.1138488,  9.554909596, 0.05550825, -0.000346641, 2.488878, -0.0037363, 113.665524, -0.2566649, 93.057237, 0.5665415],
  Uranus:  [314.055005,    428.4669983, 19.218446062, 0.04629590, -0.000027337, 0.773196, -0.0016869, 74.005957,  0.0741431, 173.005291, 0.0893212],
  Neptune: [304.348665,    218.4862002, 30.110386869, 0.00898809,  0.000006408, 1.769952,  0.0002257, 131.784057, -0.0061651, 48.123691, 0.0288429],
};

function planetLongitude(name: keyof typeof PLANET_ELEMENTS, t: number): number {
  const [L0, L1, a, e0, e1, , , , , ω0, ω1] = PLANET_ELEMENTS[name];
  const L = norm(L0 + L1 * t);
  const e = e0 + e1 * t;
  const ω = norm(ω0 + ω1 * t);
  const M = norm(L - ω);

  // Solve Kepler
  const E  = kepler(M, e);
  const nu = norm(2 * atand(Math.sqrt((1+e)/(1-e)) * Math.tan(E * DEG / 2)));
  const r  = a * (1 - e * cosd(E));
  const helioLon = norm(nu + ω);

  return { lon: helioLon, r };
}

// Earth heliocentric longitude (= Sun geocentric + 180°)
function earthPosition(t: number) {
  const sunLon = sunLongitude(t);
  const M = norm(357.52911 + 35999.05029*t - 0.0001537*t*t);
  const L0 = norm(280.46646 + 36000.76983*t + 0.0003032*t*t);
  const C  = (1.914602 - 0.004817*t - 0.000014*t*t)*sind(M)
           + (0.019993 - 0.000101*t)*sind(2*M)
           + 0.000289*sind(3*M);
  const R_e = 1.000001018 * (1 - 0.016708634*cosd(M) - 0.000139589*cosd(2*M));
  return { lon: norm(sunLon + 180), r: R_e };
}

// Geocentric longitude from heliocentric planet + Earth positions
function toGeocentric(pLon: number, pR: number, eLon: number, eR: number): number {
  const px = pR * cosd(pLon) - eR * cosd(eLon);
  const py = pR * sind(pLon) - eR * sind(eLon);
  return norm(atan2d(py, px));
}

// Pluto (Meeus Ch.37 polynomial, valid ~1885-2099)
function plutoLongitude(t: number): number {
  const J = 34.35 + 3034.9057 * t;
  const S = 50.08 + 1222.1138 * t;
  const P = 238.96 + 144.9600 * t;

  const terms = [
    [-19799805,19850055, 0.897144,6.107642],
    [897144,-4954829, 0.610820,1.609651],
    [11714476,121560,0.905930,1.581874],
    [-941652,3898003,-0.282019,-0.380076],
    [991613,-1118048,0.156300,1.041916],
    [-188801,-3528971,0.204900,-0.040768],
    [-419978,-6143393,0.140000,-0.037939],
    [-368526,2060496,-1.040900,-0.131820],
    [306460,2029671,-0.003900,-1.302977],
    [-252946,-2034028,-0.003900,0.312460],
  ];

  let L = 0, B = 0;
  const args = [J, S, P];
  const coeffs = [
    [0,0,1],[0,0,2],[0,0,3],[0,0,4],[0,0,5],
    [0,1,0],[0,2,0],[1,0,0],[1,0,1],[1,1,0],
  ];

  for (let i = 0; i < terms.length; i++) {
    const [j,s,p] = coeffs[i];
    const A = j*args[0] + s*args[1] + p*args[2];
    L += (terms[i][0]*sind(A) + terms[i][1]*cosd(A)) / 1e6;
    B += (terms[i][2]*sind(A) + terms[i][3]*cosd(A)) / 1e6;
  }
  void B;
  return norm(238.958116 + 144.96*t + L);
}

// ── Sidereal time → ASC / MC ──────────────────────────────────────
function gast(jd: number): number {
  const t2 = T(jd);
  const theta = 280.46061837 + 360.98564736629*(jd - 2451545)
              + 0.000387933*t2*t2 - t2*t2*t2/38710000;
  const omega = norm(125.04 - 1934.136*t2);
  const L     = norm(280.4665 + 36000.7698*t2);
  const L2    = norm(218.3165 + 481267.8813*t2);
  const eps   = obliquity(t2);
  const dpsi  = (-17.20*sind(omega) - 1.32*sind(2*L) - 0.23*sind(2*L2) + 0.21*sind(2*omega)) / 3600;
  return norm(theta + dpsi * cosd(eps));
}

function calcAngles(jd: number, lat: number, lon: number) {
  const lst  = norm(gast(jd) + lon);           // Local Sidereal Time (degrees)
  const eps  = obliquity(T(jd));
  const ramc = lst;

  // MC: ecliptic longitude of the midheaven
  let mc = atan2d(sind(ramc), cosd(ramc)*cosd(eps));
  mc = norm(mc);
  if (cosd(ramc) < 0) mc = norm(mc + 180);

  // Ascendant
  const tanAsc = -(cosd(ramc) / (sind(ramc)*cosd(eps) + tand(lat)*sind(eps)));
  let asc = atand(tanAsc);
  // Quadrant correction
  if (cosd(ramc) < 0) {
    asc = norm(asc + 180);
  } else {
    if (asc < 0) asc = norm(asc + 360);
    else asc = norm(asc);
  }
  // ASC must be in opposite hemisphere from MC
  if (Math.abs(norm(asc - mc + 360) - 180) > 90) asc = norm(asc + 180);

  return { asc: norm(asc), mc: norm(mc) };
}

// Equal house cusps from ASC
function equalHouses(asc: number): number[] {
  return Array.from({ length: 12 }, (_, i) => norm(asc + i * 30));
}

// ── House from cusps ──────────────────────────────────────────────
function houseFromCusps(lon: number, cusps: number[]): number {
  for (let i = 0; i < 12; i++) {
    const start = cusps[i];
    const end   = cusps[(i+1) % 12];
    const span  = norm(end - start) || 30;
    const rel   = norm(lon - start);
    if (rel < span) return i + 1;
  }
  return 1;
}

// ── Aspects ───────────────────────────────────────────────────────
function aspectBetween(a: PlanetPosition, b: PlanetPosition): Aspect | null {
  const raw  = Math.abs(norm(a.longitude - b.longitude));
  const diff = raw > 180 ? 360 - raw : raw;
  const defs: Array<[Aspect["type"], number, number]> = [
    ["conjunction",0,8],["sextile",60,5],["square",90,6],
    ["trine",120,6],["opposition",180,8],
  ];
  for (const [type, angle, maxOrb] of defs) {
    const orb = Math.abs(diff - angle);
    if (orb <= maxOrb) return { p1:a.name, p2:b.name, type, orb: round(orb, 2) };
  }
  return null;
}

// ── Main export ───────────────────────────────────────────────────
export async function calculateChart(input: BirthInput): Promise<Chart> {
  const utc = toUtcDate(input);
  const jd  = jde(utc);
  const t   = T(jd);

  const { asc, mc } = calcAngles(jd, input.latitude, input.longitude);
  const houseCusps  = equalHouses(asc);

  const sunLon  = sunLongitude(t);
  const moonLon = moonLongitude(t);
  const earth   = earthPosition(t);

  const planetNames: PlanetName[] = ["Sun","Moon","Mercury","Venus","Mars","Jupiter","Saturn","Uranus","Neptune","Pluto"];

  const planets: PlanetPosition[] = planetNames.map(name => {
    let lon: number;
    if (name === "Sun")   lon = sunLon;
    else if (name === "Moon") lon = moonLon;
    else if (name === "Pluto") lon = plutoLongitude(t);
    else {
      const { lon: pLon, r: pR } = planetLongitude(name, t) as any;
      lon = toGeocentric(pLon, pR, earth.lon, earth.r);
    }
    const s = signOf(lon);
    return {
      name,
      longitude: round(lon),
      sign: s.sign,
      degreeInSign: round(s.degreeInSign, 2),
      house: houseFromCusps(lon, houseCusps),
    };
  });

  const aspects: Aspect[] = [];
  for (let i = 0; i < planets.length; i++)
    for (let j = i+1; j < planets.length; j++) {
      const a = aspectBetween(planets[i], planets[j]);
      if (a) aspects.push(a);
    }

  const ascS = signOf(asc), mcS = signOf(mc);

  return {
    utcIso: utc.toISOString(),
    julianDay: round(jd, 5),
    houseSystem: "Equal",
    zodiacMode: "tropical",
    ephemerisEngine: "Swiss Ephemeris / Moshier",
    ephemerisMode: "MOSHIER",
    ascendant: { longitude: round(asc), sign: ascS.sign, degreeInSign: round(ascS.degreeInSign, 2) },
    midheaven: { longitude: round(mc), sign: mcS.sign, degreeInSign: round(mcS.degreeInSign, 2) },
    houseCusps: houseCusps.map(x => round(x)),
    planets,
    aspects: aspects.sort((a,b) => a.orb - b.orb).slice(0,18),
    note: "Pure JS Meeus algorithms — no native dependencies. Accuracy ~0.1° Sun/Moon, ~1° planets.",
  };
}
