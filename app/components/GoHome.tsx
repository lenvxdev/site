"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { takeRsodHandle } from "../lib/redMode";
import { requestReplay } from "../hooks/usePS2Ready";

const GLITCH_DURATION = 800;

export function GoHome() {
  const router = useRouter();
  const [leaving, setLeaving] = useState(false);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (leaving) return;
    setLeaving(true);

    const rsod = takeRsodHandle();
    if (rsod) rsod.fadeTo(0, GLITCH_DURATION);

    requestReplay(true);
    setTimeout(() => router.push("/"), GLITCH_DURATION);
  }, [leaving, router]);

  return (
    <>
      <Link
        href="/"
        onClick={handleClick}
        className="text-zinc-500 text-sm mt-5 inline-block hover:text-white transition-colors"
      >
        go home
      </Link>

      {leaving && (
        <motion.div
          className="fixed inset-0 z-[150] bg-black pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0.08, 1, 0.25, 0.9, 0.05, 1] }}
          transition={{
            duration: GLITCH_DURATION / 1000,
            times: [0, 0.06, 0.16, 0.28, 0.42, 0.6, 0.78, 1.0],
            ease: "linear",
          }}
        />
      )}
    </>
  );
}
