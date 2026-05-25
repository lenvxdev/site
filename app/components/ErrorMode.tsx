"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { setRedMode, setRsodHandle } from "../lib/redMode";
import { usePS2Ready } from "../hooks/usePS2Ready";
import { playWithReverb, isSoundEnabled } from "../lib/audio";

type Phase = "waiting" | "black" | "reveal" | "done";

const BLACKOUT_MS = 2000;

export function ErrorMode() {
  const ready = usePS2Ready();
  const [phase, setPhase] = useState<Phase>("waiting");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      setRedMode(false);
      setRsodHandle(null);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    setRedMode(true);
    setPhase("black");
    timerRef.current = setTimeout(() => {
      setPhase("reveal");
      if (isSoundEnabled()) {
      const handle = playWithReverb("/ps2-rsod.mp3", { volume: 0.5, wet: 0.28 });
      setRsodHandle(handle);
    }
    }, BLACKOUT_MS);
  }, [ready]);

  if (phase === "done") return null;

  return (
    <motion.div
      className="fixed inset-0 z-[100] bg-black pointer-events-none"
      initial={{ opacity: 1 }}
      animate={phase === "reveal"
        ? { opacity: [1, 0.04, 0.85, 0, 0.55, 0] }
        : { opacity: 1 }
      }
      transition={phase === "reveal"
        ? { duration: 0.9, times: [0, 0.12, 0.22, 0.38, 0.52, 1.0], ease: "easeOut" }
        : { duration: 0 }
      }
      onAnimationComplete={() => { if (phase === "reveal") setPhase("done"); }}
    />
  );
}
