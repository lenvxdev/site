export type Dims = { w: number; h: number; r: number };

export function roundedRectPath(w: number, h: number, r: number, inset = 0.75) {
  const x = inset, y = inset;
  const W = w - 2 * inset, H = h - 2 * inset;
  const R = Math.max(r - inset, 0);
  return (
    `M ${x},${y + R} A ${R},${R} 0 0,1 ${x + R},${y} ` +
    `L ${x + W - R},${y} A ${R},${R} 0 0,1 ${x + W},${y + R} ` +
    `L ${x + W},${y + H - R} A ${R},${R} 0 0,1 ${x + W - R},${y + H} ` +
    `L ${x + R},${y + H} A ${R},${R} 0 0,1 ${x},${y + H - R} Z`
  );
}

export function easeInOut(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

export const FADE_IN_MS  = 120;
export const FADE_OUT_MS = 220;
export const DRAW_MS     = 900;
export const ERASE_MS    = 420;
