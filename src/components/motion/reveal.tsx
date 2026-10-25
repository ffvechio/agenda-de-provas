"use client";

import { motion, type Variants } from "motion/react";
import type { ReactNode } from "react";

const variantes: Variants = {
  oculto: { opacity: 0, y: 16 },
  visivel: { opacity: 1, y: 0 },
};

export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial="oculto"
      whileInView="visivel"
      viewport={{ once: true, margin: "-40px" }}
      variants={variantes}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
