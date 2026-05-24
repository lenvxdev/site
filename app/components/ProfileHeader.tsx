"use client";

import { useRef } from "react";
import { motion } from "motion/react";
import Image from "next/image";
import { usePS2Ready } from "../hooks/usePS2Ready";

const spring = { type: "spring" as const, damping: 24, stiffness: 180, mass: 0.9 };

type WebkitStyle = CSSStyleDeclaration & { webkitBackdropFilter?: string };

export function ProfileHeader() {
  const ready   = usePS2Ready();
  const barRef  = useRef<HTMLDivElement>(null);

  return (
    <motion.div
      className="rounded-2xl overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ ...spring }}
    >
      <div className="relative h-44">
        <Image src="/banner.png" alt="" fill sizes="(max-width: 1200px) calc(100vw - 2rem), 1152px" className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>

      <motion.div
        ref={barRef}
        className="relative bg-black/50 border-t border-white/10"
        initial={{ backdropFilter: "blur(0px)" }}
        animate={ready ? { backdropFilter: "blur(24px)" } : { backdropFilter: "blur(0px)" }}
        transition={{ type: "tween", ease: "easeOut", delay: 0.45, duration: 0.5 }}
        onUpdate={(latest) => {
          if (barRef.current && typeof latest.backdropFilter === "string") {
            (barRef.current.style as WebkitStyle).webkitBackdropFilter = latest.backdropFilter;
          }
        }}
      >
        <motion.div
          className="absolute -top-14 left-4 sm:-top-16 sm:left-6 w-24 h-24 sm:w-32 sm:h-32 rounded-full ring-4 ring-black/60 overflow-hidden"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={ready ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
          transition={{ ...spring, delay: 0.08 }}
        >
          <Image src="/pfp.png" alt="Lenvx" fill sizes="(max-width: 640px) 96px, 128px" className="object-cover" />
        </motion.div>

        <motion.div
          className="px-4 py-5 pl-32 sm:px-6 sm:py-6 sm:pl-44"
          initial={{ opacity: 0, x: -10 }}
          animate={ready ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
          transition={{ ...spring, delay: 0.14 }}
        >
          <span className="text-white text-xl font-medium tracking-wide">Lenvx</span>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
