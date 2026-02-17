"use client";

import { useLingui } from "@lingui/react";
import { msg } from "@lingui/core/macro";
import { Button } from "@/components/ui";
import Link from "next/link";
import Image from "next/image";
import { Check, Rocket } from "lucide-react";
import { SectionHeader } from "@/components/section-header";

export function FinalCTA() {
  const { i18n } = useLingui();

  const trustIndicators = [
    i18n._(msg`No credit card required`),
    i18n._(msg`14-day free trial`),
    i18n._(msg`Cancel anytime`),
  ];

  return (
    <section className="relative min-h-[380px] flex items-center justify-center overflow-hidden">
      {/* Background image - grid with blue glow */}
      <Image
        src="/CTA.png"
        alt=""
        fill
        className="object-cover object-center"
        priority
        sizes="100vw"
      />
      {/* Subtle overlay for text readability while keeping grid visible */}
      <div
        className="absolute inset-0 bg-neutral-950/50 z-[1]"
        aria-hidden
      />
      {/* Top stroke - fades out at left and right edges */}
      <div
        className="absolute top-0 left-0 right-0 h-px z-[2]"
        style={{
          background:
            'linear-gradient(to right, transparent 0%, rgba(96,165,250,0.95) 25%, rgba(96,165,250,0.95) 75%, transparent 100%)',
        }}
        aria-hidden
      />
      {/* Bottom stroke - fades out at left and right edges */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px z-[2]"
        style={{
          background:
            'linear-gradient(to right, transparent 0%, rgba(96,165,250,0.95) 25%, rgba(96,165,250,0.95) 75%, transparent 100%)',
        }}
        aria-hidden
      />
      <div className="relative z-10 w-full py-14 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <SectionHeader
            text={i18n._(msg`Get Started`)}
            icon={Rocket}
            className="mb-5"
          />
          {/* Headline */}
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
            {i18n._(msg`Ready to Transform Your HR Operations?`)}
          </h2>

          {/* Subheadline */}
          <p className="text-lg text-gray-200 mb-6 max-w-2xl mx-auto">
            {i18n._(msg`Join hundreds of companies across Africa who've simplified their HR and payroll with Volta.`)}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Button
              variant="primaryGradient"
              className="px-8 py-4 text-lg font-semibold min-w-[200px] rounded-lg"
              asChild
            >
              <Link href="/signup">
                {i18n._(msg`Sign Up Now`)}
              </Link>
            </Button>
            <Button
              variant="outline"
              className="px-8 py-4 text-lg font-semibold min-w-[200px] rounded-lg border-white/30 bg-transparent text-white hover:border-blue-400 hover:bg-blue-500/10 hover:text-white"
              asChild
            >
              <Link href="/contact">
                {i18n._(msg`Sign in`)}
              </Link>
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
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
      </div>
    </section>
  );
}
