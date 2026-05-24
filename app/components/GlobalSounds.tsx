"use client";

import { useEffect } from "react";
import { playSfx } from "../lib/audio";
import { usePS2Ready } from "../hooks/usePS2Ready";
import { usePerf } from "../contexts/PerformanceContext";

const INTERACTIVE = "a, button, [role='button'], [data-cursor-hash], input, select, label";

export function GlobalSounds() {
  const ready  = usePS2Ready();
  const { lowEnd } = usePerf();

  useEffect(() => {
    if (!ready || lowEnd) return;

    playSfx("/hover.mp3",  { volume: 0 });
    playSfx("/select.mp3", { volume: 0 });

    let lastHovered: Element | null = null;

    const onOver = (e: MouseEvent) => {
      const el = (e.target as Element).closest(INTERACTIVE);
      if (el && el !== lastHovered) {
        lastHovered = el;
        playSfx("/hover.mp3", { volume: 0.38, wet: 0.18 });
      }
    };

    const onOut = (e: MouseEvent) => {
      if (lastHovered && !lastHovered.contains(e.relatedTarget as Node | null)) {
        lastHovered = null;
      }
    };

    const onClick = (e: MouseEvent) => {
      if ((e.target as Element).closest(INTERACTIVE)) {
        playSfx("/select.mp3", { volume: 0.5, wet: 0.22 });
      }
    };

    document.addEventListener("mouseover",  onOver,  { passive: true });
    document.addEventListener("mouseout",   onOut,   { passive: true });
    document.addEventListener("click",      onClick, { passive: true });

    return () => {
      document.removeEventListener("mouseover",  onOver);
      document.removeEventListener("mouseout",   onOut);
      document.removeEventListener("click",      onClick);
    };
  }, [ready, lowEnd]);

  return null;
}
