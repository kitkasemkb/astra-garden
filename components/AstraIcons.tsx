// Neon Glow SVG Icons — Astra Garden
// ใช้ stroke="currentColor" + drop-shadow filter ให้ neon glow
// ตั้งสีผ่าน style={{ color: "..." }} บน parent หรือ className

type P = { size?: number; style?: React.CSSProperties; className?: string };

const glow = (color = "currentColor") =>
  `drop-shadow(0 0 4px ${color}) drop-shadow(0 0 8px ${color})`;

const svg = (size: number, extra?: React.CSSProperties) => ({
  width: size, height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  strokeWidth: 1.5,
  style: { display: "inline-block", verticalAlign: "middle", ...extra },
});

// ── History / Book ────────────────────────────────────────────────
export function IconHistory({ size = 18, style }: P) {
  return (
    <svg {...svg(size)} stroke="#7ee8f8" style={{ ...svg(size).style, filter: glow("#7ee8f8"), ...style }}>
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
      <path d="M9 7h6M9 11h4" strokeOpacity=".7" />
    </svg>
  );
}

// ── Star / Daily Briefing ─────────────────────────────────────────
export function IconStar({ size = 18, style }: P) {
  return (
    <svg {...svg(size)} stroke="#fbbf24" style={{ ...svg(size).style, filter: glow("#fbbf24"), ...style }}>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

// ── Heart / Synastry ──────────────────────────────────────────────
export function IconHearts({ size = 18, style }: P) {
  return (
    <svg {...svg(size)} stroke="#f472b6" style={{ ...svg(size).style, filter: glow("#f472b6"), ...style }}>
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </svg>
  );
}

// ── Logout / Exit ─────────────────────────────────────────────────
export function IconLogout({ size = 18, style }: P) {
  return (
    <svg {...svg(size)} stroke="#f87171" style={{ ...svg(size).style, filter: glow("#f87171"), ...style }}>
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

// ── Crystal Ball / Tarot ──────────────────────────────────────────
export function IconCrystalBall({ size = 18, style }: P) {
  return (
    <svg {...svg(size)} stroke="#b89dfc" style={{ ...svg(size).style, filter: glow("#b89dfc"), ...style }}>
      <circle cx="12" cy="10" r="7" />
      <path d="M9 21h6M12 17v4" />
      <path d="M9.5 8a3.5 3.5 0 012-1.5" strokeOpacity=".6" strokeWidth="1" />
      <circle cx="10" cy="8.5" r=".8" fill="#b89dfc" strokeWidth="0" />
    </svg>
  );
}

// ── Sun / Energy ──────────────────────────────────────────────────
export function IconSun({ size = 18, style }: P) {
  return (
    <svg {...svg(size)} stroke="#fbbf24" style={{ ...svg(size).style, filter: glow("#fbbf24"), ...style }}>
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

// ── Compass / Work ────────────────────────────────────────────────
export function IconWork({ size = 18, style }: P) {
  return (
    <svg {...svg(size)} stroke="#60a5fa" style={{ ...svg(size).style, filter: glow("#60a5fa"), ...style }}>
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88" />
    </svg>
  );
}

// ── Coin / Money ──────────────────────────────────────────────────
export function IconMoney({ size = 18, style }: P) {
  return (
    <svg {...svg(size)} stroke="#4ade80" style={{ ...svg(size).style, filter: glow("#4ade80"), ...style }}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v2m0 8v2M9 9.5c0-1.1.9-2 2-2h2a2 2 0 010 4h-2a2 2 0 000 4h2a2 2 0 002-2" />
    </svg>
  );
}

// ── Leaf / Health ─────────────────────────────────────────────────
export function IconHealth({ size = 18, style }: P) {
  return (
    <svg {...svg(size)} stroke="#86efac" style={{ ...svg(size).style, filter: glow("#86efac"), ...style }}>
      <path d="M17 8C8 10 5.9 16.17 3.82 22M9.5 9.5c1-2 3-3.5 6.5-4.5 0 3.5-1.5 6.5-6 8" />
    </svg>
  );
}

// ── Galaxy / Message ──────────────────────────────────────────────
export function IconGalaxy({ size = 18, style }: P) {
  return (
    <svg {...svg(size)} stroke="#a78bfa" style={{ ...svg(size).style, filter: glow("#a78bfa"), ...style }}>
      <path d="M12 2a10 10 0 100 20A10 10 0 0012 2z" strokeOpacity=".3" />
      <path d="M12 12c4-1.5 7-5 6-9-4 1-7 4.5-6 9z" />
      <path d="M12 12c-4 1.5-7 5-6 9 4-1 7-4.5 6-9z" />
      <circle cx="12" cy="12" r="1.5" fill="#a78bfa" strokeWidth="0" />
    </svg>
  );
}

// ── Moon ──────────────────────────────────────────────────────────
export function IconMoon({ size = 18, style }: P) {
  return (
    <svg {...svg(size)} stroke="#e2e8f0" style={{ ...svg(size).style, filter: glow("#c4d4f0"), ...style }}>
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
  );
}

// ── Stars / Todo ──────────────────────────────────────────────────
export function IconTodo({ size = 18, style }: P) {
  return (
    <svg {...svg(size)} stroke="#5dcfff" style={{ ...svg(size).style, filter: glow("#5dcfff"), ...style }}>
      <polyline points="9 11 12 14 22 4" />
      <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
    </svg>
  );
}

// ── Tarot Card ────────────────────────────────────────────────────
export function IconTarotCard({ size = 18, style }: P) {
  return (
    <svg {...svg(size)} stroke="#b89dfc" style={{ ...svg(size).style, filter: glow("#b89dfc"), ...style }}>
      <rect x="4" y="2" width="11" height="16" rx="2" />
      <path d="M9.5 5.5l1 2 2 .3-1.5 1.4.4 2-1.9-1-1.9 1 .4-2L6.5 7.8l2-.3z" fill="#b89dfc" strokeWidth=".5" />
      <path d="M8 20h8M12 18v4" strokeOpacity=".6" />
    </svg>
  );
}
