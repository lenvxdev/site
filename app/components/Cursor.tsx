"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { usePerf } from "../contexts/PerformanceContext";

const DOT  = { w: 8, h: 8, r: 4 };
const LERP = 0.35;
const FADE = 0.14;

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function Cursor() {
  const { lowEnd } = usePerf();
  const dotRef = useRef<HTMLDivElement>(null);
  const cur    = useRef({ x: -100, y: -100, ...DOT });
  const tgt    = useRef({ x: -100, y: -100, ...DOT });
  const opac   = useRef(1);
  const opacT  = useRef(1);
  const raf    = useRef(0);

  const ready = useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia("(pointer: fine)");
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia("(pointer: fine)").matches,
    () => false
  );

  useEffect(() => {
    if (!ready) return;
    const dot = dotRef.current;
    if (!dot) return;

    const onMove = (e: MouseEvent) => {
      const target = e.target as Element;
      const onHash      = !!target.closest("[data-cursor-hash]");
      const underlineEl = target.closest("[data-cursor-underline]") as HTMLElement | null;

      if (onHash) {
        opacT.current = 0;
        tgt.current = { x: e.clientX, y: e.clientY, ...DOT };
      } else if (underlineEl) {
        opacT.current = 1;
        const rect = underlineEl.getBoundingClientRect();
        tgt.current = {
          x: rect.left + rect.width / 2,
          y: rect.bottom + 6,
          w: rect.width + 8,
          h: 2,
          r: 1,
        };
      } else {
        opacT.current = 1;
        tgt.current = { x: e.clientX, y: e.clientY, ...DOT };
      }
    };

    const onLeave = () => { opacT.current = 0; };
    const onEnter = () => { opacT.current = 1; };

    const tick = () => {
      const c = cur.current;
      const t = tgt.current;
      opac.current = lerp(opac.current, opacT.current, FADE);
      c.x = lerp(c.x, t.x, LERP);
      c.y = lerp(c.y, t.y, LERP);
      c.w = lerp(c.w, t.w, LERP);
      c.h = lerp(c.h, t.h, LERP);
      c.r = lerp(c.r, t.r, LERP);

      dot.style.transform    = `translate(${c.x - c.w / 2}px, ${c.y - c.h / 2}px)`;
      dot.style.width        = `${c.w}px`;
      dot.style.height       = `${c.h}px`;
      dot.style.borderRadius = `${c.r}px`;
      dot.style.opacity      = String(opac.current);
      raf.current = requestAnimationFrame(tick);
    };

    document.addEventListener("mousemove",  onMove,  { passive: true });
    document.addEventListener("mouseleave", onLeave, { passive: true });
    document.addEventListener("mouseenter", onEnter, { passive: true });
    raf.current = requestAnimationFrame(tick);

    return () => {
      document.removeEventListener("mousemove",  onMove);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
      cancelAnimationFrame(raf.current);
    };
  }, [ready]);

  if (!ready || lowEnd) return null;

  return (
    <div
      ref={dotRef}
      aria-hidden="true"
      style={{ willChange: "transform, width, height, opacity", backgroundColor: "white", mixBlendMode: "difference" }}
      className="fixed top-0 left-0 z-[9999] pointer-events-none"
    />
  );
}
