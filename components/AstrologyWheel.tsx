"use client";

type Planet = { name: string; longitude: number; sign: string; degreeInSign: number; house: number };
type Aspect = { p1: string; p2: string; type: string; orb: number };
type Chart = {
  ascendant: { longitude: number; sign: string; degreeInSign: number };
  midheaven: { longitude: number; sign: string; degreeInSign: number };
  planets: Planet[];
  aspects: Aspect[];
};

const ZODIAC_SYMBOLS = ["♈","♉","♊","♋","♌","♍","♎","♏","♐","♑","♒","♓"];

// Fire / Earth / Air / Water by index mod 4
const ELEMENT_COLORS = ["#f97316","#4ade80","#60a5fa","#a78bfa"];
const ELEMENT_IDS    = ["fire","earth","air","water"];

const PLANET_SYMBOLS: Record<string, string> = {
  Sun:"☉", Moon:"☽", Mercury:"☿", Venus:"♀", Mars:"♂",
  Jupiter:"♃", Saturn:"♄", Uranus:"♅", Neptune:"♆", Pluto:"♇",
};

const PLANET_COLORS: Record<string, string> = {
  Sun:"#fbbf24", Moon:"#e2e8f0", Mercury:"#a78bfa", Venus:"#f472b6",
  Mars:"#f87171", Jupiter:"#fb923c", Saturn:"#94a3b8", Uranus:"#22d3ee",
  Neptune:"#818cf8", Pluto:"#c084fc",
};

function polar(cx: number, cy: number, r: number, longitude: number) {
  const angle = (-90 - longitude) * Math.PI / 180;
  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
}

function arc(cx: number, cy: number, r1: number, r2: number, lon1: number, lon2: number) {
  const a = polar(cx, cy, r1, lon1);
  const b = polar(cx, cy, r1, lon2);
  const c = polar(cx, cy, r2, lon2);
  const d = polar(cx, cy, r2, lon1);
  const f = (n: number) => n.toFixed(3);
  return `M${f(a.x)} ${f(a.y)} A${r1} ${r1} 0 0 0 ${f(b.x)} ${f(b.y)} L${f(c.x)} ${f(c.y)} A${r2} ${r2} 0 0 1 ${f(d.x)} ${f(d.y)}Z`;
}

export function AstrologyWheel({ chart }: { chart: Chart }) {
  const cx = 360, cy = 360;
  const outer   = 330;
  const outerDeco = 344;
  const signOuter = 328;
  const signInner = 285;
  const chartInner = 250;
  const planetR   = 266;
  const aspectR   = 218;

  const planetByName = new Map(chart.planets.map(p => [p.name, p]));

  return (
    <div className="wheel-shell" aria-label="Birth chart wheel">
      <svg viewBox="0 0 720 720" className="astro-wheel" role="img">
        <defs>
          {/* Radial background gradient */}
          <radialGradient id="bgGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#0d1a35" />
            <stop offset="100%" stopColor="#04080f" />
          </radialGradient>

          {/* Element gradients for sign bands */}
          {ELEMENT_IDS.map((id, i) => (
            <radialGradient key={id} id={`elem-${id}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={ELEMENT_COLORS[i]} stopOpacity="0.28" />
              <stop offset="100%" stopColor={ELEMENT_COLORS[i]} stopOpacity="0.10" />
            </radialGradient>
          ))}

          {/* Planet glow filter */}
          <filter id="planetGlow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>

          {/* Soft glow for trine/sextile */}
          <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>

          {/* Strong glow for challenging aspects */}
          <filter id="hardGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>

          {/* Center glow */}
          <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="rgba(79,200,255,0.15)" />
            <stop offset="100%" stopColor="rgba(79,200,255,0)" />
          </radialGradient>

          {/* Outer ring glow gradient */}
          <radialGradient id="outerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="85%"  stopColor="rgba(79,200,255,0)" />
            <stop offset="100%" stopColor="rgba(79,200,255,0.12)" />
          </radialGradient>
        </defs>

        {/* Background */}
        <circle cx={cx} cy={cy} r={outer} fill="url(#bgGrad)" />

        {/* Outer decorative glow ring */}
        <circle cx={cx} cy={cy} r={outerDeco} fill="url(#outerGlow)" />
        <circle cx={cx} cy={cy} r={outerDeco} fill="none" stroke="rgba(79,200,255,0.4)" strokeWidth="1" />
        <circle cx={cx} cy={cy} r={outer}     fill="none" stroke="rgba(79,200,255,0.6)" strokeWidth="1.5" />

        {/* Decorative tick marks on outer ring */}
        {Array.from({ length: 72 }).map((_, i) => {
          const lon = i * 5;
          const isMajor = i % 6 === 0;
          const p1 = polar(cx, cy, outerDeco, lon);
          const p2 = polar(cx, cy, outer + (isMajor ? 10 : 5), lon);
          return (
            <line key={i} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
              stroke={isMajor ? "rgba(79,200,255,0.7)" : "rgba(79,200,255,0.3)"}
              strokeWidth={isMajor ? 1.5 : 0.8} />
          );
        })}

        {/* Zodiac sign colored segments */}
        {ZODIAC_SYMBOLS.map((_, i) => {
          const elemId = ELEMENT_IDS[i % 4];
          const color  = ELEMENT_COLORS[i % 4];
          return (
            <g key={i}>
              <path
                d={arc(cx, cy, signOuter, signInner, i * 30, (i + 1) * 30)}
                fill={`url(#elem-${elemId})`}
                stroke={color}
                strokeWidth="0.5"
                strokeOpacity="0.4"
              />
            </g>
          );
        })}

        {/* Zodiac dividers */}
        {Array.from({ length: 12 }).map((_, i) => {
          const a = polar(cx, cy, signOuter, i * 30);
          const b = polar(cx, cy, signInner, i * 30);
          return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="rgba(79,200,255,0.35)" strokeWidth="1" />;
        })}

        {/* Zodiac symbols */}
        {ZODIAC_SYMBOLS.map((sym, i) => {
          const mid = i * 30 + 15;
          const lbl = polar(cx, cy, 308, mid);
          const color = ELEMENT_COLORS[i % 4];
          return (
            <text key={i} x={lbl.x} y={lbl.y}
              textAnchor="middle" dominantBaseline="middle"
              fontSize="20" fill={color} fillOpacity="0.85"
              transform={`rotate(${-mid} ${lbl.x} ${lbl.y})`}
              style={{ filter: `drop-shadow(0 0 4px ${color}66)` }}
            >
              {sym}
            </text>
          );
        })}

        {/* Degree ticks */}
        {Array.from({ length: 36 }).map((_, i) => {
          const lon = i * 10;
          const p1 = polar(cx, cy, signInner, lon);
          const p2 = polar(cx, cy, i % 3 === 0 ? chartInner : chartInner + 10, lon);
          return <line key={i} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
            stroke="rgba(79,200,255,0.2)" strokeWidth="1" />;
        })}

        {/* Chart rim */}
        <circle cx={cx} cy={cy} r={chartInner} fill="none" stroke="rgba(79,200,255,0.25)" strokeWidth="1.5" />
        <circle cx={cx} cy={cy} r={aspectR + 8} fill="none" stroke="rgba(79,200,255,0.08)" strokeWidth="1" />
        <circle cx={cx} cy={cy} r={140} fill="none" stroke="rgba(79,200,255,0.1)" strokeWidth="1" />
        <circle cx={cx} cy={cy} r={70}  fill="none" stroke="rgba(79,200,255,0.06)" strokeWidth="1" />

        {/* Center glow */}
        <circle cx={cx} cy={cy} r={100} fill="url(#centerGlow)" />

        {/* Axis lines */}
        {[0, 90, 180, 270].map(lon => {
          const p1 = polar(cx, cy, chartInner, lon);
          const p2 = polar(cx, cy, 80, lon);
          return <line key={lon} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
            stroke="rgba(103,232,249,0.4)" strokeWidth="1" strokeDasharray="4 3" />;
        })}

        {/* Aspect lines */}
        {chart.aspects.slice(0, 16).map((a, idx) => {
          const p1 = planetByName.get(a.p1);
          const p2 = planetByName.get(a.p2);
          if (!p1 || !p2) return null;
          const from = polar(cx, cy, aspectR, p1.longitude);
          const to   = polar(cx, cy, aspectR, p2.longitude);
          const isSoft  = a.type === "trine" || a.type === "sextile";
          const isTense = a.type === "square" || a.type === "opposition";
          const stroke  = isSoft ? "rgba(167,139,250,0.55)" : isTense ? "rgba(251,146,60,0.55)" : "rgba(103,232,249,0.4)";
          const dash    = isSoft ? "8 6" : isTense ? "3 5" : undefined;
          return (
            <line key={`${a.p1}-${a.p2}-${idx}`}
              x1={from.x} y1={from.y} x2={to.x} y2={to.y}
              stroke={stroke} strokeWidth="1.2" strokeDasharray={dash}
              filter={isTense ? "url(#hardGlow)" : isSoft ? "url(#softGlow)" : undefined}
            />
          );
        })}

        {/* Planets */}
        {chart.planets.map((p, idx) => {
          const pt   = polar(cx, cy, planetR - (idx % 3) * 14, p.longitude);
          const tk1  = polar(cx, cy, chartInner, p.longitude);
          const tk2  = polar(cx, cy, chartInner - 16, p.longitude);
          const color = PLANET_COLORS[p.name] || "#e2e8f0";
          return (
            <g key={p.name} filter="url(#planetGlow)">
              <line x1={tk1.x} y1={tk1.y} x2={tk2.x} y2={tk2.y}
                stroke={color} strokeWidth="1" strokeOpacity="0.5" />
              <circle cx={pt.x} cy={pt.y} r={18}
                fill={`${color}18`} stroke={color} strokeWidth="1.2" />
              <text x={pt.x} y={pt.y + 1}
                textAnchor="middle" dominantBaseline="middle"
                fontSize="18" fill={color} className="planet-symbol"
              >
                {PLANET_SYMBOLS[p.name] || p.name[0]}
              </text>
            </g>
          );
        })}

        {/* ASC */}
        {(() => {
          const p  = polar(cx, cy, 264, chart.ascendant.longitude);
          const t1 = polar(cx, cy, 285, chart.ascendant.longitude);
          const t2 = polar(cx, cy, 234, chart.ascendant.longitude);
          return (
            <g>
              <line x1={t1.x} y1={t1.y} x2={t2.x} y2={t2.y}
                stroke="#4fc3f7" strokeWidth="2" />
              <text x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle"
                fontSize="9" letterSpacing="1.5" fontWeight="700" fill="#4fc3f7">ASC</text>
            </g>
          );
        })()}

        {/* MC */}
        {(() => {
          const p  = polar(cx, cy, 264, chart.midheaven.longitude);
          const t1 = polar(cx, cy, 285, chart.midheaven.longitude);
          const t2 = polar(cx, cy, 234, chart.midheaven.longitude);
          return (
            <g>
              <line x1={t1.x} y1={t1.y} x2={t2.x} y2={t2.y}
                stroke="#4fc3f7" strokeWidth="1.5" strokeDasharray="8 4" />
              <text x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle"
                fontSize="9" letterSpacing="1.5" fontWeight="700" fill="#4fc3f7">MC</text>
            </g>
          );
        })()}

        {/* Center rose */}
        {[0,45,90,135,180,225,270,315].map(deg => {
          const inner = polar(cx, cy, 12, deg);
          const outer2 = polar(cx, cy, 28, deg + 22.5);
          const outerP = polar(cx, cy, 38, deg);
          return (
            <path key={deg}
              d={`M${cx} ${cy} L${inner.x} ${inner.y} L${outer2.x} ${outer2.y} L${outerP.x} ${outerP.y} L${outer2.x} ${outer2.y}`}
              fill="none" stroke="rgba(79,200,255,0.35)" strokeWidth="0.8"
            />
          );
        })}
        <circle cx={cx} cy={cy} r={8} fill="rgba(79,200,255,0.2)" stroke="rgba(79,200,255,0.6)" strokeWidth="1" />
        <circle cx={cx} cy={cy} r={3} fill="rgba(79,200,255,0.8)" />
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
