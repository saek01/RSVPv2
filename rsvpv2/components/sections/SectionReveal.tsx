"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";

const EASE = [0.4, 0, 0.2, 1] as const;

type Props = {
  children: ReactNode;
  className?: string;
  id?: string;
  delay?: number;
} & Omit<HTMLMotionProps<"section">, "id">;

/**
 * Wraps a section so it fades + lifts in as it scrolls into view.
 * Uses `whileInView` from framer-motion; safe to use multiple times
 * on a single page.
 */
export function SectionReveal({
  children,
  className,
  id,
  delay = 0,
  ...rest
}: Props) {
  return (
    <motion.section
      id={id}
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-12% 0px -10% 0px" }}
      transition={{ duration: 0.65, ease: EASE, delay }}
      {...rest}
    >
      {children}
    </motion.section>
  );
}
