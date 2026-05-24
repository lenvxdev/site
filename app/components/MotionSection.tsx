"use client";

import { animate, motion, useInView, useMotionValue } from "motion/react";
import { useEffect, useRef, type ReactNode } from "react";
import { usePS2Ready } from "../hooks/usePS2Ready";

interface Props {
  id: string;
  className?: string;
  children: ReactNode;
  delay?: number;
}

export function MotionSection({ id, className, children, delay = 0 }: Props) {
  const ready    = usePS2Ready();
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const inView   = useInView(outerRef, { once: true, margin: "-40px" });
  const height   = useMotionValue<number | string>("auto");
  const first    = useRef(true);

  useEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;

    const targetHeight = () => {
      const innerH  = inner.getBoundingClientRect().height;
      const style   = getComputedStyle(outer);
      const padV    = parseFloat(style.paddingTop)    + parseFloat(style.paddingBottom);
      const borderV = parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
      return innerH + padV + borderV;
    };

    const obs = new ResizeObserver(() => {
      const h = targetHeight();
      if (first.current) {
        height.set(h);
        first.current = false;
        return;
      }
      animate(height, h, { duration: 0.4, ease: [0.22, 1, 0.36, 1] });
    });

    obs.observe(inner);
    return () => obs.disconnect();
  }, [height]);

  return (
    <motion.div
      ref={outerRef}
      id={id}
      style={{ height, overflow: "hidden" }}
      initial={{ opacity: 0, y: 20, backdropFilter: "blur(0px)" }}
      animate={ready && inView
        ? { opacity: 1, y: 0, backdropFilter: "blur(24px)" }
        : { opacity: 0, y: 20, backdropFilter: "blur(0px)" }
      }
      transition={{
        type: "spring", damping: 24, stiffness: 180, mass: 0.9, delay,
        backdropFilter: { type: "tween", ease: "easeOut", delay: delay + 0.45, duration: 0.5 },
      }}
      onUpdate={(latest) => {
        if (outerRef.current && typeof latest.backdropFilter === "string") {
          (outerRef.current.style as CSSStyleDeclaration & { webkitBackdropFilter?: string }).webkitBackdropFilter = latest.backdropFilter;
        }
      }}
      className={className}
    >
      <div ref={innerRef}>
        {children}
      </div>
    </motion.div>
  );
}
