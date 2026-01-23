"use client";

import { useLingui } from "@lingui/react";
import { msg } from "@lingui/core/macro";
import { Button } from "@/components/ui";
import Link from "next/link";
import { Check } from "lucide-react";

export function FinalCTA() {
  const { i18n } = useLingui();

  const trustIndicators = [
    i18n._(msg`No credit card required`),
    i18n._(msg`14-day free trial`),
    i18n._(msg`Cancel anytime`),
    i18n._(msg`Free migration assistance`),
  ];

  return (
    <section className="py-24 px-4 bg-gradient-to-b from-[#030009] via-blue-950/10 to-[#030009] relative overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-3xl" />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        {/* Headline */}
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          {i18n._(msg`Ready to Transform Your HR Operations?`)}
        </h2>

        {/* Subheadline */}
        <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
          {i18n._(msg`Join hundreds of companies across Africa who've simplified their HR and payroll with Volta.`)}
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <Button
            variant="primaryGradient"
            className="px-8 py-4 text-lg font-semibold min-w-[200px]"
            asChild
          >
            <Link href="/signup">
              {i18n._(msg`Get Started Free`)}
            </Link>
          </Button>
          <Button
            variant="outline"
            className="px-8 py-4 text-lg font-semibold min-w-[200px] border-gray-600 hover:border-blue-500 hover:bg-blue-500/10"
            asChild
          >
            <Link href="/contact">
              {i18n._(msg`Schedule a Demo`)}
            </Link>
          </Button>
        </div>

        {/* Trust Indicators */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
          {trustIndicators.map((indicator) => (
            <div
              key={indicator}
              className="flex items-center justify-center gap-2 text-gray-300"
            >
              <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
              <span className="text-sm">{indicator}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
