"use client";

import { useLingui } from "@lingui/react";
import { msg } from "@lingui/core/macro";
import { Cloud, Server, Network, CheckCircle2 } from "lucide-react";

export function DeploymentFlexibility() {
  const { i18n } = useLingui();

  const deploymentOptions = [
    {
      icon: Cloud,
      title: i18n._(msg`Multi-Cloud`),
      description: i18n._(msg`Deploy on AWS, Azure, Google Cloud, or any Kubernetes cluster. Full portability without vendor lock-in.`),
      highlights: [
        "AWS EKS",
        "Azure AKS",
        "Google GKE",
        "DigitalOcean",
      ],
    },
    {
      icon: Server,
      title: i18n._(msg`On-Premises`),
      description: i18n._(msg`Run on your own infrastructure for complete data sovereignty. Perfect for regulated industries and compliance requirements.`),
      highlights: [
        "Banking & Finance",
        "Healthcare",
        "Government",
        "Data Residency",
      ],
    },
    {
      icon: Network,
      title: i18n._(msg`Hybrid Deployment`),
      description: i18n._(msg`Mix cloud and on-prem deployments. Keep sensitive data on-premises while leveraging cloud scalability.`),
      highlights: [
        "Best of Both Worlds",
        "Phased Migration",
        "Disaster Recovery",
        "Cost Optimization",
      ],
    },
  ];

  return (
    <section className="py-16 px-4 bg-gradient-to-b from-[#030009] via-blue-950/5 to-[#030009]">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-full mb-4">
            <svg className="w-5 h-5 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13.5 2c-5.621 0-10.211 4.443-10.475 10h-3.025l5 6.625 5-6.625h-2.975c.257-3.351 3.06-6 6.475-6 3.584 0 6.5 2.916 6.5 6.5s-2.916 6.5-6.5 6.5c-1.863 0-3.542-.793-4.728-2.053l-2.427 3.216c1.877 1.754 4.389 2.837 7.155 2.837 5.79 0 10.5-4.71 10.5-10.5s-4.71-10.5-10.5-10.5z"/>
            </svg>
            <span className="text-blue-400 font-semibold text-sm">
              {i18n._(msg`What Sets Us Apart`)}
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            {i18n._(msg`Deploy on Your Terms`)}
          </h2>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto">
            {i18n._(msg`Unlike traditional SaaS-only HR platforms, Volta HR gives you complete deployment flexibility. Kubernetes-native architecture means you control where your data lives.`)}
          </p>
        </div>

        {/* Deployment Options Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {deploymentOptions.map((option) => {
            const Icon = option.icon;
            return (
              <div
                key={option.title}
                className="group relative bg-gradient-to-br from-gray-900/60 to-gray-800/40 border border-gray-700/50 rounded-2xl p-8 hover:border-blue-500/50 transition-all duration-300"
              >
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/10 group-hover:to-purple-500/10 rounded-2xl transition-all duration-300" />

                <div className="relative z-10">
                  {/* Icon */}
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-500/10 border border-blue-500/30 rounded-xl mb-6 group-hover:bg-blue-500/20 transition-colors duration-300">
                    <Icon className="w-7 h-7 text-blue-400" />
                  </div>

                  {/* Title */}
                  <h3 className="text-white font-bold text-2xl mb-3">
                    {option.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-400 mb-6 leading-relaxed">
                    {option.description}
                  </p>

                  {/* Highlights */}
                  <div className="flex flex-wrap gap-2">
                    {option.highlights.map((highlight) => (
                      <span
                        key={highlight}
                        className="px-3 py-1 bg-gray-800/60 border border-gray-600/30 rounded-lg text-gray-300 text-xs"
                      >
                        {highlight}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Why This Matters */}
        <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-2xl p-8 md:p-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                {i18n._(msg`Why Deployment Flexibility Matters`)}
              </h3>
              <p className="text-gray-300 leading-relaxed mb-6">
                {i18n._(msg`Most HR platforms force you into their cloud. We believe you should control your infrastructure, data residency, and compliance strategy.`)}
              </p>
              <div className="space-y-3">
                {[
                  i18n._(msg`No vendor lock-in - migrate between clouds freely`),
                  i18n._(msg`Meet strict data residency requirements`),
                  i18n._(msg`Comply with industry regulations (HIPAA, SOX, etc.)`),
                  i18n._(msg`Optimize costs with your existing infrastructure`),
                ].map((point) => (
                  <div key={point} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">{point}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gray-900/40 border border-gray-700/50 rounded-xl p-6">
              <h4 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                </svg>
                {i18n._(msg`Kubernetes Native`)}
              </h4>
              <p className="text-gray-400 text-sm mb-4">
                {i18n._(msg`Built from the ground up for Kubernetes. Enjoy:`)}
              </p>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                  {i18n._(msg`Auto-scaling based on demand`)}
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                  {i18n._(msg`Self-healing infrastructure`)}
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                  {i18n._(msg`Zero-downtime deployments`)}
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                  {i18n._(msg`Container-based isolation`)}
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                  {i18n._(msg`GitOps-friendly deployments`)}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
