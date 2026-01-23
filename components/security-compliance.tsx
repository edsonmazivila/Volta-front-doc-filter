"use client";

import { useLingui } from "@lingui/react";
import { msg } from "@lingui/core/macro";
import { Lock, Shield, Eye, Key, FileCheck, Database } from "lucide-react";

export function SecurityCompliance() {
  const { i18n } = useLingui();

  const badges = [
    {
      icon: Shield,
      title: "SOC 2 Type II Certified",
      description: i18n._(msg`Independently audited security controls`),
    },
    {
      icon: Lock,
      title: "GDPR Compliant",
      description: i18n._(msg`Full data protection compliance`),
    },
    {
      icon: Key,
      title: "SSL/TLS Encryption",
      description: i18n._(msg`Bank-level encryption in transit`),
    },
    {
      icon: Eye,
      title: "Multi-Factor Authentication",
      description: i18n._(msg`Enhanced account security with MFA/TOTP`),
    },
    {
      icon: FileCheck,
      title: "Regular Security Audits",
      description: i18n._(msg`Continuous security assessments`),
    },
    {
      icon: Database,
      title: "Data Encrypted at Rest",
      description: i18n._(msg`AES-256 encryption for stored data`),
    },
  ];

  return (
    <section className="py-20 px-4 bg-[#030009]">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {i18n._(msg`Enterprise-Grade Security You Can Trust`)}
          </h2>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto">
            {i18n._(msg`Your employee data is protected with bank-level security. Multi-tenant architecture ensures complete data isolation between organizations.`)}
          </p>
        </div>

        {/* Security Badges Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {badges.map((badge) => {
            const Icon = badge.icon;
            return (
              <div
                key={badge.title}
                className="group relative bg-gradient-to-br from-gray-900/60 to-gray-800/40 border border-gray-700/50 rounded-2xl p-8 hover:border-blue-500/50 transition-all duration-300"
              >
                {/* Glow effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/10 group-hover:to-purple-500/10 rounded-2xl transition-all duration-300" />

                <div className="relative z-10">
                  {/* Icon */}
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-500/10 border border-blue-500/30 rounded-xl mb-4 group-hover:bg-blue-500/20 transition-colors duration-300">
                    <Icon className="w-7 h-7 text-blue-400" />
                  </div>

                  {/* Title */}
                  <h3 className="text-white font-semibold text-lg mb-2">
                    {badge.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-400 text-sm">{badge.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
