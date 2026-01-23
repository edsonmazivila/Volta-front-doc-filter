"use client";

import React from "react";
import { Button } from "@/components/ui";
import Link from "next/link";
import { useLingui } from "@lingui/react";
import { msg } from "@lingui/core/macro";

const Hero = () => {
  const { i18n } = useLingui();

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center w-full overflow-hidden">
      {/* Smooth professional gradient with multiple stops to prevent banding */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_#1e3a8a_0%,_#1e293b_25%,_#0f172a_50%,_#020617_100%)]" />
      
      {/* Additional overlay for extra smoothness */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950/20 via-transparent to-slate-950/40" />
      
      {/* Subtle noise texture to break up any remaining banding */}
      <div className="absolute inset-0 opacity-[0.015] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')]" />
      
      {/* Soft glow accents */}
      <div className="absolute top-0 left-1/3 w-[800px] h-[800px] bg-blue-600/[0.08] rounded-full blur-[128px]" />
      <div className="absolute bottom-0 right-1/3 w-[700px] h-[700px] bg-indigo-600/[0.06] rounded-full blur-[120px]" />
      
      {/* Content container */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-24">
        {/* Unique Value Prop Badge */}
        <div className="flex justify-center mb-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-full">
            <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM9 9a1 1 0 112 0v4a1 1 0 11-2 0V9zm1-5a1 1 0 100 2 1 1 0 000-2z" />
            </svg>
            <span className="text-blue-400 font-semibold text-sm">
              {i18n._(msg`Built for Regulated Industries • SOC 2 Certified`)}
            </span>
          </div>
        </div>

        {/* Main Headline - Problem/Solution Format */}
        <h1 className="tracking-wide leading-tight bg-opacity-50 bg-gradient-to-b from-neutral-50 to-neutral-400 bg-clip-text text-center text-4xl font-bold text-transparent md:text-7xl">
          {i18n._(msg`HR & Payroll Platform`)}
          <br />
          <span className="text-3xl md:text-5xl">
            {i18n._(msg`That Keeps You Compliant`)}
          </span>
        </h1>

        {/* Value Proposition - Business Outcomes */}
        <div className="mx-auto mt-6 max-w-2xl text-center">
          <p className="text-xl md:text-2xl font-semibold text-white mb-2">
            {i18n._(msg`Automate Payroll, Track Time, Manage Documents—All in One Place`)}
          </p>
        </div>

        {/* CTAs */}
        <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
          <Button
            variant="primaryGradient"
            className="px-8 py-4 text-lg font-semibold shadow-xl shadow-blue-500/20"
            asChild
          >
            <Link href="/signup">{i18n._(msg`Start Free Trial`)}</Link>
          </Button>
          <Button
            variant="outline"
            className="px-8 py-4 text-lg font-semibold border-gray-600 hover:border-blue-500 hover:bg-blue-500/10"
            asChild
          >
            <Link href="/pricing">{i18n._(msg`View Pricing`)}</Link>
          </Button>
        </div>

        {/* Consolidated Trust Indicators */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs text-gray-400">
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {i18n._(msg`14-Day Free Trial`)}
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {i18n._(msg`No Credit Card`)}
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {i18n._(msg`SOC 2 Certified`)}
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {i18n._(msg`99.5% SLA`)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Hero;
