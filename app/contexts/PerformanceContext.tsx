"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

interface PerfCtx {
  lowEnd: boolean;
  forced: boolean;
}

const ctx = createContext<PerfCtx>({ lowEnd: false, forced: false });

function median(arr: number[]): number {
  const s = [...arr].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}

function cpuScore(): number {
  const runs: number[] = [];
  for (let r = 0; r < 3; r++) {
    const t = performance.now();
    let v = 0;
    for (let i = 1; i <= 600_000; i++) v += Math.sqrt(i) + Math.sin(i);
    void v;
    runs.push(performance.now() - t);
  }
  return median(runs);
}

function softGpu(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const gl = (canvas.getContext("webgl") ?? canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;
    if (!gl) return true;
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    if (!ext) return false;
    const r = (gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) as string).toLowerCase();
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return (
      r.includes("swiftshader") ||
      r.includes("llvmpipe") ||
      r.includes("softpipe") ||
      r.includes("microsoft basic render") ||
      r.includes("vmware")
    );
  } catch {
    return false;
  }
}

function detect(): { low: boolean; forced: boolean } {
  const forced = new URLSearchParams(window.location.search).get("low") === "true";
  if (forced) return { low: true, forced: true };

  try {
    const cached = localStorage.getItem("perf");
    if (cached === "ok" || cached === "low") return { low: cached === "low", forced: false };
  } catch {}

  const cores   = navigator.hardwareConcurrency ?? 4;
  const mem     = (navigator as { deviceMemory?: number }).deviceMemory ?? 4;
  const conn    = (navigator as { connection?: { effectiveType?: string; saveData?: boolean } }).connection;
  const elapsed = cpuScore();

  let score = 0;
  if (cores <= 2)        score += 3;
  else if (cores <= 4)   score += 1;
  if (mem <= 1)          score += 3;
  else if (mem <= 2)     score += 2;
  else if (mem <= 4)     score += 1;
  if (elapsed > 35)      score += 3;
  else if (elapsed > 20) score += 2;
  else if (elapsed > 13) score += 1;
  if (softGpu())         score += 4;
  if (conn?.saveData)    score += 2;
  if (conn?.effectiveType === "2g" || conn?.effectiveType === "slow-2g") score += 1;

  const low = score >= 3;
  try { localStorage.setItem("perf", low ? "low" : "ok"); } catch {}
  return { low, forced: false };
}

export function PerfProvider({ children }: { children: ReactNode }) {
  const [lowEnd, setLowEnd] = useState(false);
  const [forced, setForced] = useState(false);

  useEffect(() => {
    const result = detect();
    setForced(result.forced);
    setLowEnd(result.low);
    if (result.low) document.documentElement.setAttribute("data-low-end", "");
  }, []);

  useEffect(() => {
    if (lowEnd) return;

    const frames: number[] = [];
    let rafId: number;
    let badSeconds = 0;
    let prev = performance.now();

    const tick = (now: number) => {
      const dt = now - prev;
      prev = now;
      if (dt > 0 && dt < 500) frames.push(dt);
      if (frames.length > 120) frames.shift();
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    const interval = setInterval(() => {
      if (document.hidden || frames.length < 20) return;
      const avg = frames.reduce((a, b) => a + b, 0) / frames.length;
      if (1000 / avg < 30) {
        if (++badSeconds >= 3) {
          try { localStorage.removeItem("perf-ack"); localStorage.setItem("perf", "low"); } catch {}
          document.documentElement.setAttribute("data-low-end", "");
          setLowEnd(true);
        }
      } else {
        badSeconds = 0;
      }
    }, 1000);

    return () => {
      cancelAnimationFrame(rafId);
      clearInterval(interval);
    };
  }, [lowEnd]);

  return <ctx.Provider value={{ lowEnd, forced }}>{children}</ctx.Provider>;
}

export function usePerf() { return useContext(ctx); }
