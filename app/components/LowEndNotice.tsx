"use client";

import { useState, useEffect, useCallback } from "react";
import { usePerf } from "../contexts/PerformanceContext";
import { useLang } from "../contexts/LangContext";

export function LowEndNotice() {
  const { t } = useLang();
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

  const dismiss = useCallback(() => {
    setAnim(false);
    setTimeout(() => setShow(false), 250);
    try { localStorage.setItem("perf-ack", "1"); } catch {}
  }, []);

  useEffect(() => {
    if (!show) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") dismiss(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [show, dismiss]);

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6"
      style={{ opacity: anim ? 1 : 0, transition: "opacity 0.25s ease" }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={dismiss} aria-hidden="true" />
      <div
        className="relative z-10 w-full max-w-sm rounded-2xl border border-white/[0.1] backdrop-blur-2xl px-7 py-7 shadow-2xl"
        style={{
          background: "rgba(255,255,255,0.05)",
          transform: anim ? "translateY(0)" : "translateY(14px)",
          transition: "transform 0.3s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        <p className="text-white text-base font-medium mb-1.5">{t("headsUp")}</p>
        <p className="text-zinc-400 text-sm leading-relaxed mb-6">
          {t("lowEndMsg")}
        </p>
        <button
          type="button"
          onClick={dismiss}
          className="w-full bg-white text-black text-sm font-semibold rounded-xl py-2.5 transition-colors hover:bg-zinc-100 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          {t("thanks")}
        </button>
      </div>
    </div>
  );
}
