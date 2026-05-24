"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { usePS2Ready } from "../hooks/usePS2Ready";

const spring = { type: "spring" as const, damping: 24, stiffness: 180, mass: 0.9 };

export function ProfileHeader() {
  const ready = usePS2Ready();

  return (
    <motion.div
      className="rounded-2xl overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ ...spring }}
    >
      <div className="relative h-44">
        <Image src="/banner.png" alt="" fill sizes="100vw" className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>

      <motion.div
        className="relative bg-black/50 border-t border-white/10"
        initial={{ backdropFilter: "blur(0px)" }}
        animate={ready ? { backdropFilter: "blur(24px)" } : { backdropFilter: "blur(0px)" }}
        transition={{ type: "tween", ease: "easeOut", delay: 0.45, duration: 0.5 }}
      >
        <motion.div
          className="absolute -top-16 left-6 w-32 h-32 rounded-full ring-4 ring-black/60 overflow-hidden"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={ready ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
          transition={{ ...spring, delay: 0.08 }}
        >
          <Image src="/pfp.png" alt="Lenvx" fill sizes="128px" className="object-cover" />
        </motion.div>

        <motion.div
          className="px-6 py-6 pl-44"
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
