"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

type SlideInProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
};

const FADE_EASING: [number, number, number, number] = [0.25, 0.8, 0.25, 1];

export function SlideIn({ children, delay = 0, className }: SlideInProps) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  if (!isReady) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.32, ease: FADE_EASING, delay }}
    >
      {children}
    </motion.div>
  );
}
