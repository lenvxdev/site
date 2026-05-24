"use client";

import { useEffect, useRef, useState } from "react";
import { type Dims, DRAW_MS, ERASE_MS, FADE_IN_MS, FADE_OUT_MS, easeInOut, roundedRectPath } from "../lib/stroke";
import { usePerf } from "../contexts/PerformanceContext";

export function useStrokeAnim<T extends HTMLElement = HTMLElement>(color = "rgba(0,17,255,0.75)") {
  const { lowEnd } = usePerf();
  const ref     = useRef<T>(null);
  const svgRef  = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const raf     = useRef(0);
  const len     = useRef(0);
  const draw    = useRef(0);
  const fade    = useRef(0);
  const [dims, setDims] = useState<Dims | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const r = parseFloat(getComputedStyle(el).borderRadius) || 12;
      setDims({ w: el.offsetWidth, h: el.offsetHeight, r });
    };
    measure();
    const obs = new ResizeObserver(measure);
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const p = pathRef.current;
    if (!dims || !p) return;
    const l = p.getTotalLength();
    len.current = l;
    p.style.strokeDasharray  = `0 ${l}`;
    p.style.strokeDashoffset = "0";
  }, [dims]);

  const anim = (to: number) => {
    const svg = svgRef.current;
    const p   = pathRef.current;
    if (!p || !svg) return;

    cancelAnimationFrame(raf.current);
    const fromDraw = draw.current;
    const fromFade = fade.current;
    const drawDur  = (to === 1 ? DRAW_MS : ERASE_MS) * Math.abs(to - fromDraw);
    const fadeDur  = (to === 1 ? FADE_IN_MS : FADE_OUT_MS) * Math.abs(to - fromFade);
    const start    = performance.now();

    const tick = (now: number) => {
      const t  = now - start;
      const dt = drawDur > 0 ? Math.min(t / drawDur, 1) : 1;
      const ft = fadeDur > 0 ? Math.min(t / fadeDur, 1) : 1;
      draw.current = fromDraw + (to - fromDraw) * easeInOut(dt);
      fade.current = fromFade + (to - fromFade) * easeInOut(ft);

      const L = len.current;
      p.style.strokeDasharray = `${draw.current * L} ${L}`;
      svg.style.opacity = String(fade.current);
      if (dt < 1 || ft < 1) raf.current = requestAnimationFrame(tick);
    };

    raf.current = requestAnimationFrame(tick);
  };

  const enterRef = useRef<() => void>(() => {});
  const leaveRef = useRef<() => void>(() => {});
  enterRef.current = () => { if (!lowEnd) anim(1); };
  leaveRef.current = () => { if (!lowEnd) anim(0); };

  const enter = () => enterRef.current();
  const leave = () => leaveRef.current();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handler = () => {
      enterRef.current();
    };
    el.addEventListener("touchstart", handler, { passive: true });
    return () => el.removeEventListener("touchstart", handler);
  }, [dims]);

  const glow =
    `drop-shadow(0 0 2px ${color}) ` +
    `drop-shadow(0 0 6px ${color}) ` +
    `drop-shadow(0 0 14px ${color})`;

  const svgProps = { svgRef, pathRef, dims, color, glow, lowEnd };
  return { ref, enter, leave, svgProps };
}

export type SvgProps = ReturnType<typeof useStrokeAnim>["svgProps"];

export function strokeSvg({ svgRef, pathRef, dims, color, glow, lowEnd }: SvgProps) {
  if (!dims || lowEnd) return null;
  const d = roundedRectPath(dims.w, dims.h, dims.r);
  return (
    <svg
      ref={svgRef}
      className="absolute inset-0 pointer-events-none"
      width={dims.w}
      height={dims.h}
      fill="none"
      style={{ overflow: "visible", opacity: 0, filter: glow }}
    >
      <path ref={pathRef} d={d} stroke={color} strokeWidth="1.5" strokeDasharray="0" strokeDashoffset="0" strokeLinecap="round" />
    </svg>
  );
}
