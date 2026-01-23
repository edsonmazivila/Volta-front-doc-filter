import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing Plans - Transparent & Scalable",
  description:
    "Simple, transparent pricing that grows with your business. From startups to enterprises - find the perfect HR & payroll plan. No hidden fees. Start your free trial today.",
  keywords: [
    "HR software pricing",
    "payroll system cost",
    "HR platform plans",
    "employee management pricing",
    "affordable HR software",
    "HR SaaS pricing",
    "payroll software pricing",
  ],
  openGraph: {
    title: "Volta HR Pricing - Plans That Grow With You",
    description:
      "Compare our pricing tiers and find the perfect plan for your business. From $29/month for startups to custom enterprise solutions.",
    type: "website",
    url: "https://voltahr.com/pricing",
  },
  twitter: {
    card: "summary_large_image",
    title: "Volta HR Pricing - Plans That Grow With You",
    description:
      "Simple, transparent pricing. From $29/month. Start your free trial today.",
  },
  alternates: {
    canonical: "https://voltahr.com/pricing",
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
