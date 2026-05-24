"use client";

import { useState, useEffect } from "react";
import { usePerf } from "../contexts/PerformanceContext";

export function LowEndNotice() {
  const { lowEnd, forced } = usePerf();
  const [show, setShow]   = useState(false);
  const [anim, setAnim]   = useState(false);

  useEffect(() => {
    if (!lowEnd) return;
    if (!forced) {
      try { if (localStorage.getItem("perf-ack") === "1") return; } catch {}
    }
    setShow(true);
    requestAnimationFrame(() => requestAnimationFrame(() => setAnim(true)));
  }, [lowEnd, forced]);

  const dismiss = () => {
    setAnim(false);
    setTimeout(() => setShow(false), 250);
    try { localStorage.setItem("perf-ack", "1"); } catch {}
  };

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6"
      style={{ opacity: anim ? 1 : 0, transition: "opacity 0.25s ease" }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={dismiss} aria-hidden />
      <div
        className="relative z-10 w-full max-w-sm rounded-2xl border border-white/[0.1] backdrop-blur-2xl px-7 py-7 shadow-2xl"
        style={{
          background: "rgba(255,255,255,0.05)",
          transform: anim ? "translateY(0)" : "translateY(14px)",
          transition: "transform 0.3s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        <p className="text-white text-base font-medium mb-1.5">heads up!</p>
        <p className="text-zinc-400 text-sm leading-relaxed mb-6">
          some features have been disabled for your device&apos;s sake :)
        </p>
        <button
          onClick={dismiss}
          className="w-full bg-white text-black text-sm font-semibold rounded-xl py-2.5 transition-colors hover:bg-zinc-100 active:scale-95"
        >
          thank you!
        </button>
      </div>
    </div>
  );
}
