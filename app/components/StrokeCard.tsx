"use client";

import { type ReactNode } from "react";
import { motion, type HTMLMotionProps } from "motion/react";
import { useStrokeAnim, strokeSvg } from "../hooks/useStrokeAnim";

type Props = Omit<HTMLMotionProps<"div">, "children"> & { color?: string; children?: ReactNode };

export function StrokeCard({ className, children, color = "rgba(255,255,255,0.75)", onMouseEnter, onMouseLeave, onTouchEnd, onTouchCancel, ...props }: Props) {
  const { ref, enter, leave, svgProps } = useStrokeAnim<HTMLDivElement>(color);

  return (
    <motion.div
      ref={ref}
      data-cursor-stroke
      className={`relative ${className ?? ""}`}
      onMouseEnter={(e) => { enter(); onMouseEnter?.(e); }}
      onMouseLeave={(e) => { leave(); onMouseLeave?.(e); }}
      onTouchEnd={(e) => { leave(); onTouchEnd?.(e); }}
      onTouchCancel={(e) => { leave(); onTouchCancel?.(e); }}
      {...props}
    >
      {strokeSvg(svgProps)}
      {children}
    </motion.div>
  );
}
