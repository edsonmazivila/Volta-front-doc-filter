"use client";

import { useLingui } from "@lingui/react";
import { msg } from "@lingui/core/macro";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function Integrations() {
  const { i18n } = useLingui();

  const integrations = [
    {
      category: i18n._(msg`Accounting`),
      tools: ["QuickBooks", "Xero", "SAP"],
    },
    {
      category: i18n._(msg`Cloud Storage`),
      tools: ["AWS S3", "Google Cloud", "Azure Blob"],
    },
    {
      category: i18n._(msg`Time Clocks`),
      tools: ["BioPunch", "ZKTeco", "Fingerprint"],
    },
    {
      category: i18n._(msg`Banking`),
      tools: ["ACH/NACHA", "Wire Transfer", "Bank API"],
    },
    {
      category: i18n._(msg`Email`),
      tools: ["Gmail", "Outlook", "Office 365"],
    },
    {
      category: i18n._(msg`Communication`),
      tools: ["Slack", "MS Teams", "Discord"],
    },
  ];

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-[#030009] to-gray-900/30">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {i18n._(msg`Integrates with Your Favorite Tools`)}
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            {i18n._(msg`Connect Volta HR with the tools you already use. Seamless integration with accounting software, time clocks, and cloud storage.`)}
          </p>
        </div>

        {/* Integrations Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {integrations.map((integration) => (
            <div
              key={integration.category}
              className="bg-gray-900/40 border border-gray-700/50 rounded-xl p-6 hover:border-blue-500/50 hover:bg-gray-800/40 transition-all duration-300"
            >
              <h3 className="text-white font-semibold text-lg mb-4">
                {integration.category}
              </h3>
              <div className="flex flex-wrap gap-2">
                {integration.tools.map((tool) => (
                  <span
                    key={tool}
                    className="px-3 py-1.5 bg-gray-800/60 border border-gray-600/30 rounded-lg text-gray-300 text-sm hover:bg-blue-900/30 hover:border-blue-500/50 transition-all duration-200"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link href="/integrations" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200 group">
            {i18n._(msg`View All Integrations`)}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
          </Link>
        </div>
      </div>
    </section>
  );
}
