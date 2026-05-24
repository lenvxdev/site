"use client";

import { motion, AnimatePresence } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { playWithReverb } from "../lib/audio";
import { signalPS2Ready } from "../hooks/usePS2Ready";

const SWITCH_AT = 5000;
const FADE_MS   = 1600;

function hasBooted() {
  try { return sessionStorage.getItem("ps2-boot") === "1"; } catch { return false; }
}

export function PS2Startup() {
  const [phase, setPhase] = useState<"init" | "wait" | "welcome" | "fade" | "done">("init");
  const started = useRef(false);
  const timer   = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const forced = new URLSearchParams(window.location.search).get("boot") === "1";
    if (!forced && hasBooted()) {
      signalPS2Ready();
      setPhase("done");
      return;
    }
    setPhase("wait");
  }, []);

  const begin = useCallback(() => {
    if (started.current) return;
    started.current = true;
    setPhase("welcome");
    try { sessionStorage.setItem("ps2-boot", "1"); } catch {}

    playWithReverb("/ps2-bootup.mp3", { volume: 1, wet: 0.28 });

    timer.current = setTimeout(() => {
      setPhase("fade");
      const menu = playWithReverb("/ps2-menu.mp3", { loop: true, volume: 0, wet: 0.18 });
      menu.fadeTo(0.35, 1800);
      setTimeout(() => {
        setPhase("done");
        signalPS2Ready();
      }, FADE_MS);
    }, SWITCH_AT);
  }, []);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  if (phase === "init" || phase === "done") return null;

  return (
    <motion.div
      className="fixed inset-0 z-[200] bg-black flex items-center justify-center"
      animate={{ opacity: phase === "fade" ? 0 : 1 }}
      transition={{ duration: FADE_MS / 1000, ease: "easeInOut" }}
      onClick={phase === "wait" ? begin : undefined}
      style={{
        cursor:        phase === "wait" ? "pointer" : "default",
        pointerEvents: phase === "fade" ? "none" : "auto",
      }}
    >
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 45%, #04071a 0%, #000000 65%)" }}
        animate={{ opacity: phase === "welcome" || phase === "fade" ? 1 : 0 }}
        transition={{ duration: 1.4, ease: "easeOut" }}
      />

      <AnimatePresence mode="wait">
        {phase === "wait" && (
          <motion.p
            key="tap"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -8, transition: { duration: 0.35, ease: "easeIn" } }}
            transition={{ duration: 0.6 }}
            className="relative text-zinc-600 text-xs font-mono tracking-[0.3em] uppercase select-none animate-pulse"
          >
            tap anywhere to continue...
          </motion.p>
        )}

        {(phase === "welcome" || phase === "fade") && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex flex-col items-center gap-4"
          >
            <motion.h1
              className="text-white text-3xl sm:text-4xl font-semibold tracking-tight text-center px-6"
              style={{ textShadow: "0 0 35px rgba(80,130,255,0.45), 0 0 90px rgba(50,90,255,0.18)" }}
            >
              Welcome to lenvx.dev, user.
            </motion.h1>

            <motion.div
              className="h-px w-60 bg-gradient-to-r from-transparent via-blue-500/35 to-transparent"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
