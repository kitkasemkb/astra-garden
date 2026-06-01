"use client";

type Planet = { name: string; longitude: number; sign: string; degreeInSign: number; house: number };
type Aspect = { p1: string; p2: string; type: string; orb: number };
type Chart = {
  ascendant: { longitude: number; sign: string; degreeInSign: number };
  midheaven: { longitude: number; sign: string; degreeInSign: number };
  planets: Planet[];
  aspects: Aspect[];
};

const signs = ["ARIES", "TAURUS", "GEMINI", "CANCER", "LEO", "VIRGO", "LIBRA", "SCORPIO", "SAGITTARIUS", "CAPRICORN", "AQUARIUS", "PISCES"];

const symbols: Record<string, string> = {
  Sun: "☉",
  Moon: "☽",
  Mercury: "☿",
  Venus: "♀",
  Mars: "♂",
  Jupiter: "♃",
  Saturn: "♄",
  Uranus: "♅",
  Neptune: "♆",
  Pluto: "♇",
};

function polar(cx: number, cy: number, r: number, longitude: number) {
  const angle = (-90 - longitude) * Math.PI / 180;
  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
}

function lineClass(type: string) {
  if (type === "trine" || type === "sextile") return "aspect-line soft";
  if (type === "square" || type === "opposition") return "aspect-line tense";
  return "aspect-line neutral";
}

export function AstrologyWheel({ chart }: { chart: Chart }) {
  const cx = 360;
  const cy = 360;
  const outer = 330;
  const signInner = 285;
  const chartInner = 250;
  const planetR = 254;
  const aspectR = 226;

  const planetByName = new Map(chart.planets.map((p) => [p.name, p]));

  return (
    <div className="wheel-shell" aria-label="Birth chart wheel">
      <svg viewBox="0 0 720 720" className="astro-wheel" role="img">
        <circle cx={cx} cy={cy} r={outer} className="zodiac-outer" />
        <circle cx={cx} cy={cy} r={signInner} className="zodiac-inner" />
        <circle cx={cx} cy={cy} r={chartInner} className="chart-rim" />
        <circle cx={cx} cy={cy} r={140} className="inner-guide" />
        <circle cx={cx} cy={cy} r={70} className="inner-guide faint" />

        {signs.map((sign, i) => {
          const start = i * 30;
          const mid = start + 15;
          const a = polar(cx, cy, outer, start);
          const b = polar(cx, cy, signInner, start);
          const label = polar(cx, cy, 309, mid);
          return (
            <g key={sign}>
              <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} className="zodiac-cut" />
              <text x={label.x} y={label.y} textAnchor="middle" dominantBaseline="middle" className="sign-label" transform={`rotate(${-mid} ${label.x} ${label.y})`}>
                {sign}
              </text>
            </g>
          );
        })}

        {Array.from({ length: 36 }).map((_, i) => {
          const lon = i * 10;
          const p1 = polar(cx, cy, signInner, lon);
          const p2 = polar(cx, cy, i % 3 === 0 ? chartInner : chartInner + 12, lon);
          return <line key={i} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} className="degree-cut" />;
        })}

        {[0, 90, 180, 270].map((lon) => {
          const p1 = polar(cx, cy, chartInner, lon);
          const p2 = polar(cx, cy, 80, lon);
          return <line key={lon} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} className="axis-line" />;
        })}

        {chart.aspects.slice(0, 16).map((a, index) => {
          const p1 = planetByName.get(a.p1);
          const p2 = planetByName.get(a.p2);
          if (!p1 || !p2) return null;
          const from = polar(cx, cy, aspectR, p1.longitude);
          const to = polar(cx, cy, aspectR, p2.longitude);
          return <line key={`${a.p1}-${a.p2}-${index}`} x1={from.x} y1={from.y} x2={to.x} y2={to.y} className={lineClass(a.type)} />;
        })}

        {chart.planets.map((p, index) => {
          const planet = polar(cx, cy, planetR - (index % 3) * 12, p.longitude);
          const tick1 = polar(cx, cy, chartInner, p.longitude);
          const tick2 = polar(cx, cy, chartInner - 18, p.longitude);
          return (
            <g key={p.name}>
              <line x1={tick1.x} y1={tick1.y} x2={tick2.x} y2={tick2.y} className="planet-tick" />
              <circle cx={planet.x} cy={planet.y} r={15} className="planet-dot" />
              <text x={planet.x} y={planet.y + 1} textAnchor="middle" dominantBaseline="middle" className="planet-symbol">{symbols[p.name] || p.name.slice(0, 1)}</text>
            </g>
          );
        })}

        {(() => {
          const p = polar(cx, cy, 265, chart.ascendant.longitude);
          const t1 = polar(cx, cy, 286, chart.ascendant.longitude);
          const t2 = polar(cx, cy, 235, chart.ascendant.longitude);
          return <g><line x1={t1.x} y1={t1.y} x2={t2.x} y2={t2.y} className="asc-line" /><text x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" className="angle-label">ASC</text></g>;
        })()}

        {(() => {
          const p = polar(cx, cy, 265, chart.midheaven.longitude);
          const t1 = polar(cx, cy, 286, chart.midheaven.longitude);
          const t2 = polar(cx, cy, 235, chart.midheaven.longitude);
          return <g><line x1={t1.x} y1={t1.y} x2={t2.x} y2={t2.y} className="mc-line" /><text x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" className="angle-label">MC</text></g>;
        })()}
      </svg>
    </div>
  );
}

export function AspectLegend() {
  return (
    <div className="aspect-legend">
      <span><i className="legend-line neutral" />ร่วมพลัง</span>
      <span><i className="legend-line soft" />สนับสนุน</span>
      <span><i className="legend-line tense" />ท้าทาย</span>
    </div>
  );
}
