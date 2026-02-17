"use client";

import { useLingui } from "@lingui/react";
import { msg } from "@lingui/core/macro";
import { ChevronDown, CircleHelp, MessageCircle, Phone } from "lucide-react";
import { useState } from "react";
import { SectionHeader } from "@/components/section-header";
import { Button } from "@/components/ui/button";

export function FAQ() {
  const { i18n } = useLingui();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: i18n._(msg`Is my data secure?`),
      answer: i18n._(msg`Absolutely. Volta HR uses bank-level encryption (SSL/TLS), multi-factor authentication, and is SOC 2 Type II certified. Your data is encrypted both in transit and at rest.`),
    },
    {
      question: i18n._(msg`Can I manage multiple companies?`),
      answer: i18n._(msg`Yes! Volta HR's multi-tenant architecture allows organization admins to manage unlimited companies from a single dashboard.`),
    },
    {
      question: i18n._(msg`How does payroll tax calculation work?`),
      answer: i18n._(msg`Volta HR automatically calculates federal, state, and local taxes based on your configured jurisdictions. Tax tables are kept up-to-date for compliance.`),
    },
    {
      question: i18n._(msg`Do you offer a free trial?`),
      answer: i18n._(msg`Yes! Start with a 14-day free trial—no credit card required.`),
    },
    {
      question: i18n._(msg`Can employees access the system on mobile?`),
      answer: i18n._(msg`Yes. Volta HR is fully responsive and optimized for mobile devices, allowing employees to check in, request leave, and view paystubs on the go.`),
    },
    {
      question: i18n._(msg`What kind of support do you offer?`),
      answer: i18n._(msg`We offer email support for all plans, priority support for Professional plans, and dedicated account management for Enterprise customers.`),
    },
    {
      question: i18n._(msg`Can I migrate from my current HR system?`),
      answer: i18n._(msg`Yes! We provide migration assistance and data import tools. Contact our team to discuss your specific needs.`),
    },
  ];

  return (
    <section className="py-20 px-4 bg-neutral-900">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <SectionHeader
          text={i18n._(msg`Support`)}
          icon={CircleHelp}
          className="mb-8"
        />
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {i18n._(msg`Frequently Asked Questions`)}
          </h2>
          <p className="text-gray-400 text-lg">
            {i18n._(msg`Everything you need to know about Volta HR`)}
          </p>
        </div>

        {/* Two-column: FAQ list + Contact card */}
        <div className="grid lg:grid-cols-[1fr_340px] gap-8 lg:gap-10 items-start">
          {/* FAQ Accordion - transparent cards with blue glow from bottom when expanded */}
          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index
              return (
                <div
                  key={faq.question}
                  className="relative rounded-2xl overflow-hidden border border-white/10 bg-transparent transition-all duration-300 hover:border-white/15"
                >
                  {/* Blue gradient from bottom when expanded */}
                  {isOpen && (
                    <div
                      className="absolute inset-0 pointer-events-none bg-gradient-to-t from-blue-500/25 from-0% via-blue-500/8 via-35% to-transparent to-100%"
                      aria-hidden
                    />
                  )}
                  <div className="relative">
                    <button
                      onClick={() => setOpenIndex(isOpen ? null : index)}
                      className="w-full px-6 py-5 flex items-center justify-between text-left transition-colors duration-200"
                    >
                      <span className="text-white font-semibold text-lg pr-8">
                        {faq.question}
                      </span>
                      <ChevronDown
                        className={`w-6 h-6 text-blue-400 flex-shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                      />
                    </button>

                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-96" : "max-h-0"}`}
                    >
                      <div className="px-6 pb-5 text-gray-300 leading-relaxed border-t border-white/10 pt-4">
                        {faq.answer}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Contact Support card - glass blur with inner shadow + blue from bottom */}
          <div className="relative rounded-2xl overflow-hidden shrink-0">
            {/* Glass blur + inner shadow container */}
            <div
              className="relative p-8 h-full min-h-[280px] flex flex-col rounded-2xl border border-white/10 backdrop-blur-xl bg-transparent overflow-hidden"
              style={{
                boxShadow:
                  "inset 0 0 60px -15px rgba(0,0,0,0.2), inset 0 0 0 1px rgba(255,255,255,0.06), 0 25px 50px -12px rgba(0,0,0,0.25)",
              }}
            >
              {/* Blue gradient from bottom - same as question cards */}
              <div
                className="absolute inset-0 pointer-events-none bg-gradient-to-t from-blue-500/25 from-0% via-blue-500/8 via-35% to-transparent to-100%"
                aria-hidden
              />
              {/* Subtle glow accents */}
              <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />

              <div className="relative flex flex-col items-center text-center flex-1">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-500/20 border border-blue-400/30 mb-5">
                  <MessageCircle className="w-7 h-7 text-blue-400" />
                </div>
                <h3 className="text-white font-bold text-xl mb-2">
                  {i18n._(msg`You have different questions?`)}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-6">
                  {i18n._(msg`Our team will answer all your questions.`)}
                </p>
                <Button
                  variant="primaryGradient"
                  size="lg"
                  className="w-full rounded-xl shadow-md shadow-blue-500/25"
                  asChild
                >
                  <a href="mailto:support@volta-hr.com">
                    <Phone className="w-4 h-4" />
                    {i18n._(msg`Contact Support Team`)}
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
