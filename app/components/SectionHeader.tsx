"use client";

import { useRef, useState } from "react";

interface SectionHeaderProps {
  section: string;
  label: string;
}

type Phase = "label" | "copied" | "copied-exit";

const COPIED_TEXT = "Section link copied!";
const COOLDOWN = 2500;
const CHAR_DELAY = 28;
const EXIT_DURATION = COPIED_TEXT.length * CHAR_DELAY + 220;

const charIn = (delay: number) =>
  `charIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}ms forwards`;

const charOut = (delay: number) =>
  `charOut 0.2s ease-in ${delay}ms forwards`;

function Chars({
  text,
  getAnimation,
  initialOpacity,
}: {
  text: string;
  getAnimation: (delay: number) => string;
  initialOpacity: number;
}) {
  return (
    <>
      {text.split("").map((char, i) =>
        char === " " ? (
          <span key={i}>{" "}</span>
        ) : (
          <span
            key={i}
            className="inline-block"
            style={{
              opacity: initialOpacity,
              animation: getAnimation(i * CHAR_DELAY),
            }}
          >
            {char}
          </span>
        )
      )}
    </>
  );
}

export function SectionHeader({ section, label }: SectionHeaderProps) {
  const [phase, setPhase] = useState<Phase>("label");
  const [labelKey, setLabelKey] = useState(0);
  const cooldownTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const busy = useRef(false);

  async function handleCopy() {
    if (busy.current) return;
    try {
      const url = `${window.location.origin}${window.location.pathname}#${encodeURIComponent(section)}`;
      await navigator.clipboard.writeText(url);
      busy.current = true;
      setPhase("copied");

      if (cooldownTimer.current) clearTimeout(cooldownTimer.current);
      if (exitTimer.current) clearTimeout(exitTimer.current);

      cooldownTimer.current = setTimeout(() => {
        setPhase("copied-exit");
        exitTimer.current = setTimeout(() => {
          setPhase("label");
          setLabelKey((k) => k + 1);
          busy.current = false;
        }, EXIT_DURATION);
      }, COOLDOWN);
    } catch {}
  }

  const isCopied = phase === "copied" || phase === "copied-exit";

  return (
    <div className="flex items-center gap-2 mb-3">
      <button
        type="button"
        onClick={handleCopy}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleCopy(); } }}
        aria-label="Copy section link"
        data-cursor-hash
        className="text-zinc-600 hover:text-zinc-300 transition-colors font-mono font-bold select-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60 rounded-sm"
      >
        #
      </button>

      <div className="relative h-7 flex items-center">
        <h2
          key={isCopied ? "label-exit" : `label-${labelKey}`}
          className="text-white text-lg font-semibold whitespace-nowrap"
        >
          <Chars
            text={label}
            getAnimation={isCopied ? charOut : labelKey === 0 ? () => "none" : charIn}
            initialOpacity={isCopied ? 1 : labelKey === 0 ? 1 : 0}
          />
        </h2>

        {isCopied && (
          <h2
            aria-live="polite"
            className="absolute left-0 top-1/2 -translate-y-1/2 text-white text-lg font-semibold whitespace-nowrap"
          >
            <Chars
              text={COPIED_TEXT}
              getAnimation={phase === "copied-exit" ? charOut : charIn}
              initialOpacity={phase === "copied-exit" ? 1 : 0}
            />
          </h2>
        )}
      </div>
    </div>
  );
}
