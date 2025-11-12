"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { ActionPanels } from "@/components/marketing/action-panels";
import { CascadeMetrics } from "@/components/marketing/cascade-metrics";
import { FeatureShowcase } from "@/components/marketing/feature-showcase";
import { HeroSection } from "@/components/marketing/hero-section";
import { MarketingFooter } from "@/components/marketing/marketing-footer";

export default function HomePage() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="space-y-12 lg:space-y-16">
      <HeroSection expanded={expanded} onToggle={() => setExpanded((prev) => !prev)} />
      <AnimatePresence initial={false}>
        {expanded ? (
          <motion.div
            key="homepage-expanded"
            className="space-y-12 lg:space-y-16"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
          >
            <FeatureShowcase />
            <CascadeMetrics />
            <ActionPanels />
            <MarketingFooter />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
