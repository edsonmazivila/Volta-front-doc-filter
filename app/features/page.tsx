"use client";

import { useLingui } from "@lingui/react";
import { msg } from "@lingui/core/macro";
import HomeHeader from "@/components/home-header";
import {
  Users,
  Clock,
  DollarSign,
  FileText,
  Calendar,
  BarChart3,
  Shield,
  Zap,
  Building2,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui";

export default function FeaturesPage() {
  const { i18n } = useLingui();

  const features = [
    {
      icon: Users,
      title: i18n._(msg`HR & People Management`),
      description: i18n._(msg`Centralize employee records, roles, documents, leave policies, and requests with tenant-safe access controls.`),
      features: [
        i18n._(msg`Employee profiles & documents`),
        i18n._(msg`Department hierarchies`),
        i18n._(msg`Role-based permissions`),
        i18n._(msg`Multi-company support`),
        i18n._(msg`Organizational structure`),
      ],
    },
    {
      icon: Clock,
      title: i18n._(msg`Time & Attendance`),
      description: i18n._(msg`Track attendance, manage overtime, and streamline approvals with an intuitive, mobile-friendly experience.`),
      features: [
        i18n._(msg`One-click check-in/check-out`),
        i18n._(msg`Real-time attendance monitoring`),
        i18n._(msg`Absence justification workflows`),
        i18n._(msg`Overtime tracking`),
        i18n._(msg`CSV export for reporting`),
      ],
    },
    {
      icon: DollarSign,
      title: i18n._(msg`Automated Payroll`),
      description: i18n._(msg`Automate calculations, taxes, and deductions. Export bank-ready files and paystubs with full audit trails.`),
      features: [
        i18n._(msg`Calculate payroll in seconds`),
        i18n._(msg`Automatic tax calculations`),
        i18n._(msg`Generate paystubs instantly`),
        i18n._(msg`Export to Excel/PDF/ACH formats`),
        i18n._(msg`Full audit trails`),
      ],
    },
    {
      icon: Calendar,
      title: i18n._(msg`Leave Management`),
      description: i18n._(msg`Empower employees to request time off while managers maintain full visibility and control over team availability.`),
      features: [
        i18n._(msg`Leave request & approval flows`),
        i18n._(msg`Automatic balance tracking`),
        i18n._(msg`Multiple leave policies`),
        i18n._(msg`Team leave calendar`),
        i18n._(msg`Leave accrual automation`),
      ],
    },
    {
      icon: FileText,
      title: i18n._(msg`Document Management`),
      description: i18n._(msg`Secure document storage with virus scanning, approval workflows, and role-based access control.`),
      features: [
        i18n._(msg`Virus-scanned uploads`),
        i18n._(msg`Company & employee documents`),
        i18n._(msg`Approval workflows`),
        i18n._(msg`Cloud or local storage (S3)`),
        i18n._(msg`Version control`),
      ],
    },
    {
      icon: BarChart3,
      title: i18n._(msg`Reporting & Analytics`),
      description: i18n._(msg`Real-time dashboards and exports give you visibility into payroll, attendance, and costs across companies.`),
      features: [
        i18n._(msg`Payroll reports & registers`),
        i18n._(msg`Tax liability tracking`),
        i18n._(msg`Department cost analysis`),
        i18n._(msg`Export to PDF/Excel/CSV`),
        i18n._(msg`Custom report builder`),
      ],
    },
    {
      icon: Building2,
      title: i18n._(msg`Multi-Tenant Architecture`),
      description: i18n._(msg`Manage unlimited organizations and companies from a single platform with complete data isolation.`),
      features: [
        i18n._(msg`Unlimited organizations`),
        i18n._(msg`Complete data isolation`),
        i18n._(msg`Cross-company reporting`),
        i18n._(msg`Centralized administration`),
        i18n._(msg`Organization hierarchies`),
      ],
    },
    {
      icon: Shield,
      title: i18n._(msg`Enterprise Security`),
      description: i18n._(msg`Bank-level security with SOC 2 certification, GDPR compliance, and multi-factor authentication.`),
      features: [
        i18n._(msg`SOC 2 Type II Certified`),
        i18n._(msg`GDPR Compliant`),
        i18n._(msg`SSL/TLS Encryption`),
        i18n._(msg`Multi-factor authentication`),
        i18n._(msg`Data encrypted at rest`),
      ],
    },
  ];

  const benefits = [
    {
      title: i18n._(msg`Save Time`),
      description: i18n._(msg`Reduce HR admin time by 60% with automated workflows`),
    },
    {
      title: i18n._(msg`Stay Compliant`),
      description: i18n._(msg`100% tax compliance with automatic calculations`),
    },
    {
      title: i18n._(msg`Scale Easily`),
      description: i18n._(msg`Grow from 10 to 10,000 employees on one platform`),
    },
    {
      title: i18n._(msg`Mobile Ready`),
      description: i18n._(msg`Full mobile experience for employees on the go`),
    },
  ];

  return (
    <main className="bg-[#030009] min-h-screen">
      <HomeHeader />

      {/* Hero Section */}
      <div className="py-20 px-4 pt-32">
        <div className="max-w-7xl mx-auto text-center mb-20">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            {i18n._(msg`Everything You Need to Manage Your Workforce`)}
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-8">
            {i18n._(msg`One platform. Complete control. From hire to retire.`)}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              variant="primaryGradient"
              className="px-8 py-4 text-lg font-semibold"
              asChild
            >
              <Link href="/signup">
                {i18n._(msg`Get Started Free`)}
              </Link>
            </Button>
            <Button
              variant="outline"
              className="px-8 py-4 text-lg font-semibold border-gray-600 hover:border-blue-500 hover:bg-blue-500/10"
              asChild
            >
              <Link href="/pricing">
                {i18n._(msg`View Pricing`)}
              </Link>
            </Button>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-6 mb-20">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="bg-gradient-to-br from-gray-900/60 to-gray-800/40 border border-gray-700/50 rounded-xl p-6 text-center"
            >
              <h3 className="text-white font-semibold text-lg mb-2">
                {benefit.title}
              </h3>
              <p className="text-gray-400 text-sm">{benefit.description}</p>
            </div>
          ))}
        </div>

        {/* Features Grid */}
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-16">
            {i18n._(msg`Comprehensive Features`)}
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="bg-gradient-to-br from-gray-900/60 to-gray-800/40 border border-gray-700/50 rounded-2xl p-8 hover:border-blue-500/50 transition-all duration-300"
                >
                  {/* Icon */}
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-500/10 border border-blue-500/30 rounded-xl mb-6">
                    <Icon className="w-7 h-7 text-blue-400" />
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-white font-bold text-2xl mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 mb-6 leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Feature List */}
                  <ul className="space-y-3">
                    {feature.features.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-3 text-gray-300"
                      >
                        <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-4xl mx-auto text-center mt-20 py-16 px-6 bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-2xl">
          <Zap className="w-12 h-12 text-blue-400 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {i18n._(msg`Ready to Get Started?`)}
          </h2>
          <p className="text-gray-300 text-lg mb-8">
            {i18n._(msg`Join hundreds of companies simplifying their HR operations with Volta.`)}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              variant="primaryGradient"
              className="px-8 py-4 text-lg font-semibold"
              asChild
            >
              <Link href="/signup">
                {i18n._(msg`Start Free Trial`)}
              </Link>
            </Button>
            <Button
              variant="outline"
              className="px-8 py-4 text-lg font-semibold border-gray-600 hover:border-blue-500 hover:bg-blue-500/10"
              asChild
            >
              <Link href="/contact">
                {i18n._(msg`Contact Sales`)}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
