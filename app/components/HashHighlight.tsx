"use client";

import { useEffect, useRef, useState } from "react";
import { easeInOut, roundedRectPath } from "../lib/stroke";

const TOTAL_MS    = 3200;
const DRAW_MS     = 1200;
const FADE_IN_MS  = 300;
const FADE_OUT_MS = 2600;

function clamp(v: number) {
  return Math.max(0, Math.min(1, v));
}

export function HashHighlight({ id }: { id: string }) {
  const [active, setActive]   = useState(false);
  const [animKey, setAnimKey] = useState(0);
  const svgRef  = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const rafRef  = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const perimRef = useRef(0);

  const applyDims = (el: HTMLElement) => {
    const bRect = el.getBoundingClientRect();
    const w = bRect.width;
    const h = bRect.height;
    const r = parseFloat(getComputedStyle(el).borderTopLeftRadius) || 16;

    const svg  = svgRef.current;
    const path = pathRef.current;
    if (!svg || !path) return;

    svg.style.width  = `${w}px`;
    svg.style.height = `${h}px`;
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    path.setAttribute("d", roundedRectPath(w, h, r));
    const len = path.getTotalLength();
    perimRef.current = len;
    path.setAttribute("stroke-dasharray", String(len));
  };

  useEffect(() => {
    const trigger = () => {
      if (window.location.hash !== `#${id}`) return;
      const el = document.getElementById(id);
      if (!el || el.getBoundingClientRect().width === 0) return;
      if (timerRef.current) clearTimeout(timerRef.current);
      setActive(true);
      setAnimKey((k) => k + 1);
      timerRef.current = setTimeout(() => setActive(false), TOTAL_MS + 100);
    };
    trigger();
    window.addEventListener("hashchange", trigger);
    return () => {
      window.removeEventListener("hashchange", trigger);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [id]);

  useEffect(() => {
    if (!active) return;
    const el = document.getElementById(id);
    if (!el) return;

    applyDims(el);

    const observer = new ResizeObserver(() => applyDims(el));
    observer.observe(el);

    cancelAnimationFrame(rafRef.current);
    const start = performance.now();

    const tick = (now: number) => {
      const ms   = now - start;
      const path = pathRef.current;
      const svg  = svgRef.current;
      if (!path || !svg) return;

      path.style.strokeDashoffset = String(
        perimRef.current * (1 - easeInOut(clamp(ms / DRAW_MS)))
      );

      let opacity: number;
      if (ms < FADE_IN_MS)        opacity = ms / FADE_IN_MS;
      else if (ms > FADE_OUT_MS)  opacity = 1 - (ms - FADE_OUT_MS) / (TOTAL_MS - FADE_OUT_MS);
      else                         opacity = 1;
      svg.style.opacity = String(clamp(opacity));

      if (ms < TOTAL_MS) rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      observer.disconnect();
    };
  }, [active, animKey, id]);

  if (!active) return null;

  return (
    <svg
      key={animKey}
      ref={svgRef}
      className="pointer-events-none"
      fill="none"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        overflow: "visible",
        opacity: 0,
        filter:
          "drop-shadow(0 0 2px rgba(255,255,255,1)) " +
          "drop-shadow(0 0 6px rgba(255,255,255,0.8)) " +
          "drop-shadow(0 0 12px rgba(255,255,255,0.5)) " +
          "drop-shadow(0 0 24px rgba(255,255,255,0.25))",
      }}
    >
      <path
        ref={pathRef}
        stroke="rgba(255,255,255,0.7)"
        strokeWidth="1.5"
        strokeDasharray="0"
        strokeDashoffset="0"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
