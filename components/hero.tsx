"use client";

import { motion } from "motion/react";
import { Button, GridBackground } from "@/components/ui";
import Link from "next/link";
import Image from "next/image";
import { useLingui } from "@lingui/react";
import { msg } from "@lingui/core/macro";
import { HeroDashboardPreview } from "@/components/hero-dashboard-preview";

function DashboardPreviewContent() {
  return (
    <>
      <Image
        src="/Dashboard.png"
        alt="Dashboard Preview"
        width={1200}
        height={800}
        className="w-full h-auto opacity-90"
        priority
      />
      <div className="absolute inset-0 flex flex-col p-2 sm:px-4 sm:pt-[15px] sm:pb-0">
        <div className="flex-1 min-h-[min(82vh,780px)] w-full rounded-[30px] overflow-hidden flex flex-col">
          <HeroDashboardPreview />
        </div>
      </div>
      <div
        className="absolute inset-0 z-10 pointer-events-none rounded-t-3xl"
        style={{
          background: "linear-gradient(to top, rgb(23 23 23) 0%, rgba(23 23 23 / 0.5) 20%, transparent 40%)",
        }}
      />
    </>
  );
}

const Hero = () => {
  const { i18n } = useLingui();

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center w-full overflow-hidden bg-neutral-900">
      {/* Top perspective grid under navbar */}
      <GridBackground />

      {/* Content container */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-3 sm:pt-40">
        {/* Unique Value Prop Badge */}
        <motion.div
          className="flex justify-center mb-6"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-full">
            <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM9 9a1 1 0 112 0v4a1 1 0 11-2 0V9zm1-5a1 1 0 100 2 1 1 0 000-2z" />
            </svg>
            <span className="text-blue-400 font-semibold text-xs">
              {i18n._(msg`Built for Regulated Industries • SOC 2 Certified`)}
            </span>
          </div>
        </motion.div>

        {/* Main Headline - Problem/Solution Format */}
        <motion.h1
          className="tracking-wide leading-tight bg-opacity-50 bg-gradient-to-b from-neutral-50 to-neutral-400 bg-clip-text text-center text-4xl font-bold text-transparent md:text-7xl"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        >
          {i18n._(msg`HR & Payroll Platform`)}
          <br />
          <span className="text-3xl md:text-5xl">
            {i18n._(msg`That Keeps You Compliant`)}
          </span>
        </motion.h1>

        {/* Value Proposition - Business Outcomes */}
        <motion.div
          className="mx-auto mt-6 max-w-2xl text-center"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        >
          <p className="text-xl md:text-2xl font-semibold text-white mb-2">
            {i18n._(msg`Automate Payroll, Track Time, Manage Documents, All in One Place`)}
          </p>
        </motion.div>

        {/* CTAs */}
        <motion.div
          className="mt-8 flex items-center justify-center gap-4 flex-wrap"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
        >
          <Button
            variant="primaryGradient"
            className="px-8 py-4 text-lg font-semibold rounded-[12px] shadow-xl shadow-blue-500/20"
            asChild
          >
            <Link href="/signup">{i18n._(msg`Get Started`)}</Link>
          </Button>
          <Button
            className="px-8 py-4 text-lg font-semibold rounded-[12px] text-white bg-neutral-950 border border-white/30 hover:bg-neutral-800 transition-colors shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_1px_2px_rgba(0,0,0,0.5)]"
            asChild
          >
            <Link href="/login">{i18n._(msg`Sign In`)}</Link>
          </Button>
        </motion.div>

        {/* Dashboard Preview — hidden on mobile/small screens; fades in from bottom on appear */}
        <motion.div
          className="mt-20 relative w-full max-w-6xl mx-auto rounded-t-3xl overflow-hidden shadow-xl backdrop-blur-sm hidden md:block"
          initial={{ opacity: 0, y: 56 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <DashboardPreviewContent />
        </motion.div>
      </div>

      {/* Light Fade Effect at Bottom of Hero */}
      <div className="absolute bottom-0 left-0 w-full h-[600px] z-20 pointer-events-none">
        <Image
          src="/Light.png"
          alt=""
          fill
          className="object-cover object-bottom"
          priority
        />
      </div>
    </div>
  );
};

export default Hero;
