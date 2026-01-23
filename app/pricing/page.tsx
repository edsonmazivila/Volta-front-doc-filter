"use client";

import { useLingui } from "@lingui/react";
import { msg } from "@lingui/core/macro";
import { Button } from "@/components/ui";
import Link from "next/link";
import HomeHeader from "@/components/home-header";
import { Check, Zap, ArrowRight } from "lucide-react";

export default function PricingPage() {
  const { i18n } = useLingui();

  const pricingTiers = [
    {
      name: i18n._(msg`Starter`),
      price: "$29",
      period: i18n._(msg`/month`),
      description: i18n._(msg`Up to 25 employees`),
      features: [
        i18n._(msg`Core HR management`),
        i18n._(msg`Time & attendance`),
        i18n._(msg`Leave management`),
        i18n._(msg`Basic reporting`),
        i18n._(msg`Email support`),
      ],
      cta: i18n._(msg`Start Free Trial`),
      popular: false,
    },
    {
      name: i18n._(msg`Professional`),
      price: "$79",
      period: i18n._(msg`/month`),
      description: i18n._(msg`Up to 100 employees`),
      features: [
        i18n._(msg`Everything in Starter`),
        i18n._(msg`Automated payroll`),
        i18n._(msg`Document management`),
        i18n._(msg`Advanced reporting`),
        i18n._(msg`Priority support`),
        i18n._(msg`API access`),
      ],
      cta: i18n._(msg`Start Free Trial`),
      popular: true,
    },
    {
      name: i18n._(msg`Enterprise`),
      price: i18n._(msg`Custom`),
      period: "",
      description: i18n._(msg`Unlimited employees`),
      features: [
        i18n._(msg`Everything in Professional`),
        i18n._(msg`Multi-tenant (unlimited orgs)`),
        i18n._(msg`Custom integrations`),
        i18n._(msg`Dedicated account manager`),
        i18n._(msg`99.9% SLA`),
        i18n._(msg`White-label options`),
      ],
      cta: i18n._(msg`Contact Sales`),
      popular: false,
    },
  ];

  return (
    <main className="bg-[#030009] min-h-screen">
      <HomeHeader />

      <div className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 pt-20">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {i18n._(msg`Simple, Transparent Pricing`)}
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              {i18n._(msg`Plans that grow with your business. No hidden fees. No surprises.`)}
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {pricingTiers.map((tier) => (
              <div
                key={tier.name}
                className={`relative bg-gradient-to-br from-gray-900/60 to-gray-800/40 border rounded-2xl p-8 ${
                  tier.popular
                    ? "border-blue-500 shadow-xl shadow-blue-500/20 scale-105"
                    : "border-gray-700/50 hover:border-gray-600/50"
                } transition-all duration-300`}
              >
                {/* Popular Badge */}
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full text-white text-sm font-semibold flex items-center gap-1">
                    <Zap className="w-4 h-4" />
                    {i18n._(msg`Most Popular`)}
                  </div>
                )}

                {/* Tier Name */}
                <h3 className="text-2xl font-bold text-white mb-2">
                  {tier.name}
                </h3>

                {/* Price */}
                <div className="mb-4">
                  <span className="text-5xl font-bold text-white">
                    {tier.price}
                  </span>
                  {tier.period && (
                    <span className="text-gray-400 text-lg ml-2">
                      {tier.period}
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className="text-gray-400 mb-8">{tier.description}</p>

                {/* CTA Button */}
                <Button
                  variant={tier.popular ? "primaryGradient" : "outline"}
                  className={`w-full mb-8 ${
                    tier.popular
                      ? ""
                      : "border-gray-600 hover:border-blue-500 hover:bg-blue-500/10"
                  }`}
                  asChild
                >
                  <Link
                    href={
                      tier.name === "Enterprise" ? "/contact" : "/signup"
                    }
                  >
                    {tier.cta}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>

                {/* Features List */}
                <div className="space-y-3 border-t border-gray-700/50 pt-6">
                  {tier.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* FAQ Section */}
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-white text-center mb-8">
              {i18n._(msg`Pricing FAQs`)}
            </h2>

            <div className="space-y-6">
              <div className="bg-gray-900/40 border border-gray-700/50 rounded-xl p-6">
                <h3 className="text-white font-semibold mb-2">
                  {i18n._(msg`Can I change plans later?`)}
                </h3>
                <p className="text-gray-400">
                  {i18n._(msg`Yes! You can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle.`)}
                </p>
              </div>

              <div className="bg-gray-900/40 border border-gray-700/50 rounded-xl p-6">
                <h3 className="text-white font-semibold mb-2">
                  {i18n._(msg`What happens if I exceed my employee limit?`)}
                </h3>
                <p className="text-gray-400">
                  {i18n._(msg`We'll notify you when you're approaching your limit. You can upgrade to the next tier or contact us for custom pricing.`)}
                </p>
              </div>

              <div className="bg-gray-900/40 border border-gray-700/50 rounded-xl p-6">
                <h3 className="text-white font-semibold mb-2">
                  {i18n._(msg`Do you offer annual billing discounts?`)}
                </h3>
                <p className="text-gray-400">
                  {i18n._(msg`Yes! Save 20% when you pay annually. Contact our sales team for annual pricing.`)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
