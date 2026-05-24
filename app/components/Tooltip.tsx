"use client";

import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";

const DASH_LINE =
  "repeating-linear-gradient(to right, rgba(0,17,255,0.6) 0, rgba(0,17,255,0.6) 3px, transparent 3px, transparent 7px)";

export function Tooltip({ children, content }: { children: ReactNode; content: ReactNode }) {
  const [visible, setVisible] = useState(false);
  const spanRef    = useRef<HTMLSpanElement>(null);
  const timerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTouchRef = useRef(false);

  const clearTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const hide = useCallback(() => {
    clearTimer();
    setVisible(false);
  }, [clearTimer]);

  const show = useCallback((delay = 0) => {
    clearTimer();
    if (delay) timerRef.current = setTimeout(() => setVisible(true), delay);
    else setVisible(true);
  }, [clearTimer]);

  useEffect(() => {
    const el = spanRef.current;
    if (!el) return;
    const handler = (e: TouchEvent) => {
      e.preventDefault();
      isTouchRef.current = true;
      if (timerRef.current) clearTimeout(timerRef.current);
      setVisible(true);
    };
    el.addEventListener("touchstart", handler, { passive: false });
    return () => el.removeEventListener("touchstart", handler);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const handler = (e: TouchEvent) => {
      if (spanRef.current && !spanRef.current.contains(e.target as Node)) {
        hide();
        setTimeout(() => { isTouchRef.current = false; }, 500);
      }
    };
    document.addEventListener("touchstart", handler, { passive: true });
    return () => document.removeEventListener("touchstart", handler);
  }, [visible, hide]);

  return (
    <span
      ref={spanRef}
      className="relative inline-block"
      onMouseEnter={() => { if (!isTouchRef.current) show(300); }}
      onMouseLeave={() => { if (!isTouchRef.current) hide(); }}
      onTouchEnd={() => {
        hide();
        setTimeout(() => { isTouchRef.current = false; }, 500);
      }}
      onTouchCancel={() => {
        hide();
        setTimeout(() => { isTouchRef.current = false; }, 500);
      }}
    >
      <span data-cursor-underline className="relative text-white font-semibold">
        {children}
        <span
          aria-hidden
          className="absolute left-0 pointer-events-none transition-opacity duration-200"
          style={{
            top: "calc(100% + 5px)",
            width: "100%",
            height: "1px",
            backgroundImage: DASH_LINE,
            opacity: visible ? 0 : 1,
          }}
        />
      </span>
      <span
        className="absolute top-full left-1/2 z-10 px-3 py-1.5 bg-zinc-800 border border-white/10 rounded-lg text-xs text-zinc-300 whitespace-nowrap pointer-events-none transition-all duration-200 ease-out select-none"
        style={{
          opacity: visible ? 1 : 0,
          transform: `translateX(-50%) translateY(${visible ? "0px" : "-4px"})`,
        }}
      >
        {content}
      </span>
    </span>
  );
}
