"use client";

import { useLingui } from "@lingui/react";
import { msg } from "@lingui/core/macro";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

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
    <section className="py-20 px-4 bg-gradient-to-b from-gray-900/30 to-[#030009]">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {i18n._(msg`Frequently Asked Questions`)}
          </h2>
          <p className="text-gray-400 text-lg">
            {i18n._(msg`Everything you need to know about Volta HR`)}
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={faq.question}
              className="bg-gray-900/40 border border-gray-700/50 rounded-xl overflow-hidden hover:border-gray-600/50 transition-all duration-300"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-800/30 transition-colors duration-200"
              >
                <span className="text-white font-semibold text-lg pr-8">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-6 h-6 text-gray-400 flex-shrink-0 transition-transform duration-300 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openIndex === index ? "max-h-96" : "max-h-0"
                }`}
              >
                <div className="px-6 pb-5 text-gray-300 leading-relaxed border-t border-gray-700/30 pt-4">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
