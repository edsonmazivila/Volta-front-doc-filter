"use client";

import { useLingui } from "@lingui/react";
import { msg } from "@lingui/core/macro";
import { Star } from "lucide-react";

export function SocialProof() {
  const { i18n } = useLingui();

  const testimonials = [
    {
      quote: i18n._(msg`Volta HR reduced our payroll processing time from 3 days to 3 hours. The automated tax calculations alone saved us countless headaches.`),
      author: "Maria Santos",
      role: i18n._(msg`HR Director, Tech Startup Mozambique`),
    },
    {
      quote: i18n._(msg`The leave management system is a game-changer. Employees love the self-service portal, and managers have complete visibility.`),
      author: "João Pereira",
      role: i18n._(msg`Operations Manager, Retail Chain`),
    },
    {
      quote: i18n._(msg`Multi-tenant architecture allows us to manage 5 different companies from one platform. Reporting across entities is seamless.`),
      author: "Fatima Abdul",
      role: i18n._(msg`Finance Controller, Holding Group`),
    },
  ];

  const stats = [
    { value: "50,000+", label: i18n._(msg`Employees Managed`) },
    { value: "99.5%", label: i18n._(msg`Uptime Guaranteed`) },
    { value: "60%", label: i18n._(msg`Reduction in HR Admin Time`) },
    { value: "100%", label: i18n._(msg`Tax Compliance`) },
  ];

  return (
    <section className="py-20 px-4 bg-[#030009]">
      <div className="max-w-7xl mx-auto">
        {/* Section Title */}
        <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-16">
          {i18n._(msg`Trusted by Forward-Thinking Companies`)}
        </h2>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.author}
              className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-gray-700/50 rounded-2xl p-8 hover:border-blue-500/50 transition-all duration-300"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={`${testimonial.author}-star-${i}`}
                    className="w-5 h-5 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-gray-300 text-base leading-relaxed mb-6">
                "{testimonial.quote}"
              </blockquote>

              {/* Author */}
              <div className="border-t border-gray-700/50 pt-4">
                <p className="text-white font-semibold">{testimonial.author}</p>
                <p className="text-gray-400 text-sm">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                {stat.value}
              </div>
              <div className="text-gray-400 text-sm md:text-base">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
