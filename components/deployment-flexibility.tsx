"use client";

import { useLingui } from "@lingui/react";
import { msg } from "@lingui/core/macro";
import { Cloud, Server, Network, Globe, CheckCircle2, Boxes } from "lucide-react";
import { SectionHeader } from "@/components/section-header";
import { MultiCloudDiagram } from "@/components/multi-cloud-diagram";
import { OnPremisesDiagram } from "@/components/on-premises-diagram";
import { HybridDeploymentDiagram } from "@/components/hybrid-deployment-diagram";
import { EdgeComputingDiagram } from "@/components/edge-computing-diagram";

export function DeploymentFlexibility() {
  const { i18n } = useLingui();

  const deploymentOptions = [
    {
      icon: Cloud,
      title: i18n._(msg`Multi-Cloud`),
      description: i18n._(msg`Deploy on AWS, Azure, Google Cloud, or any Kubernetes cluster. Full portability without vendor lock-in.`),
      highlights: [
        i18n._(msg`AWS EKS`),
        i18n._(msg`Azure AKS`),
        i18n._(msg`Google GKE`),
        i18n._(msg`DigitalOcean`),
      ],
      image: null,
      customVisual: "multiCloud",
    },
    {
      icon: Server,
      title: i18n._(msg`On-Premises`),
      description: i18n._(msg`Run on your own infrastructure for complete data sovereignty. Perfect for regulated industries and compliance requirements.`),
      highlights: [
        i18n._(msg`Banking & Finance`),
        i18n._(msg`Healthcare`),
        i18n._(msg`Government`),
        i18n._(msg`Data Residency`),
      ],
      image: null,
      customVisual: "onPremises",
    },
    {
      icon: Network,
      title: i18n._(msg`Hybrid Deployment`),
      description: i18n._(msg`Mix cloud and on-prem deployments. Keep sensitive data on-premises while leveraging cloud scalability.`),
      highlights: [
        i18n._(msg`Best of Both Worlds`),
        i18n._(msg`Phased Migration`),
        i18n._(msg`Disaster Recovery`),
        i18n._(msg`Cost Optimization`),
      ],
      image: null,
      customVisual: "hybrid",
    },
    {
      icon: Globe,
      title: i18n._(msg`Edge Computing`),
      description: i18n._(msg`Deploy closer to your users for ultra-low latency. Perfect for distributed teams and remote locations.`),
      highlights: [
        i18n._(msg`Low Latency`),
        i18n._(msg`Distributed Teams`),
        i18n._(msg`Remote Sites`),
        i18n._(msg`Global Performance`),
      ],
      image: null,
      customVisual: "edge",
    },
  ];

  return (
    <section className="relative py-16 px-4 bg-neutral-900 overflow-hidden">
      <div
        className="absolute bottom-[125px] left-0 w-full pointer-events-none select-none mix-blend-screen opacity-100"
        style={{
          maskImage: 'linear-gradient(to bottom, transparent, black 25%, black 80%, transparent)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)',
        }}
      >
        <img
          src="/deploy-bg.png"
          alt=""
          className="w-full h-auto object-cover"
          draggable="false"
        />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <SectionHeader
          text={i18n._(msg`What Sets Us Apart`)}
          icon={Boxes}
          className="mb-8"
        />
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            {i18n._(msg`Deploy on Your Terms`)}
          </h2>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto">
            {i18n._(msg`Unlike traditional SaaS-only HR platforms, Volta HR gives you complete deployment flexibility. Kubernetes-native architecture means you control where your data lives.`)}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {deploymentOptions.map((option, index) => {
            const Icon = option.icon;
            const isTopCard = index === 0;

            return (
              <div
                key={option.title}
                className={`group relative rounded-3xl transition-all duration-300 h-full border border-white/[0.08] ${isTopCard ? "md:col-span-3" : ""}`}
              >
                <div className="relative bg-transparent backdrop-blur-md rounded-[calc(1.5rem-1px)] overflow-hidden h-full">

                  {/* Card Image or custom visual */}
                  {option.customVisual === "multiCloud" ? (
                    <MultiCloudDiagram />
                  ) : option.customVisual === "onPremises" ? (
                    <OnPremisesDiagram />
                  ) : option.customVisual === "hybrid" ? (
                    <HybridDeploymentDiagram />
                  ) : option.customVisual === "edge" ? (
                    <EdgeComputingDiagram />
                  ) : option.image ? (
                    <div
                      className="w-full h-52 overflow-hidden relative"
                      style={{
                        maskImage: 'linear-gradient(to bottom, black 0%, black 60%, transparent 100%)',
                        WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 60%, transparent 100%)',
                      }}
                    >
                      <img
                        src={option.image}
                        alt={option.title}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  ) : null}

                  <div className={`relative z-10 flex flex-col h-full ${(option.image || option.customVisual) ? "-mt-12 px-4" : "p-4"}`}>
                    {/* Icon */}
                    <div className="inline-flex items-center justify-center w-10 h-10 bg-white/5 border border-white/10 rounded-2xl mb-4 group-hover:bg-blue-500/20 transition-colors duration-300 backdrop-blur-sm">
                      <Icon className="w-5 h-5 text-blue-400" />
                    </div>

                    {/* Title */}
                    <h3 className="text-white font-bold text-lg mb-2">
                      {option.title}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-400 text-sm mb-4 leading-relaxed flex-grow">
                      {option.description}
                    </p>

                    {/* Highlights */}
                    <div className="flex flex-wrap gap-2 mt-auto">
                      {option.highlights.map((highlight) => (
                        <span
                          key={highlight}
                          className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-gray-300 text-xs"
                        >
                          {highlight}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Why This Matters */}
      <div className="mt-24 max-w-7xl mx-auto bg-white/5 border border-white/10 rounded-3xl p-10 backdrop-blur-md relative z-10 overflow-hidden">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-6">
              {i18n._(msg`Why Deployment Flexibility Matters`)}
            </h3>
            <p className="text-gray-300 leading-relaxed mb-8 text-sm">
              {i18n._(msg`Most HR platforms force you into their cloud. We believe you should control your infrastructure, data residency, and compliance strategy.`)}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                i18n._(msg`No vendor lock-in`),
                i18n._(msg`Data residency`),
                i18n._(msg`Compliance Ready`),
                i18n._(msg`Cost Optimized`),
              ].map((point) => (
                <div key={point} className="flex items-center gap-2 text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-blue-400" />
                  <span className="text-sm">{point}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="space-y-6">
              <h4 className="text-white font-bold text-xl flex items-center gap-3">
                <Boxes className="w-6 h-6 text-blue-400" />
                {i18n._(msg`Kubernetes Native`)}
              </h4>
              <ul className="grid grid-cols-1 gap-3">
                {[
                  i18n._(msg`Auto-scaling on demand`),
                  i18n._(msg`Self-healing infrastructure`),
                  i18n._(msg`Zero-downtime deployments`),
                  i18n._(msg`GitOps-friendly workflows`),
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-gray-400 bg-white/5 border border-white/5 px-4 py-2 rounded-xl text-sm">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section >
  );
}
