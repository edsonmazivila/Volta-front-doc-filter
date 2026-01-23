import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Features - Complete HR & Payroll Solution",
  description:
    "Explore powerful HR features including employee management, time tracking, automated payroll, leave management, advanced reporting, and comprehensive compliance tools.",
  keywords: [
    "HR features",
    "payroll features",
    "time tracking software",
    "leave management system",
    "employee management features",
    "HR automation",
    "payroll automation",
    "compliance management",
    "HR reporting",
  ],
  openGraph: {
    title: "Volta HR Features - Everything You Need to Manage Your Team",
    description:
      "Comprehensive HR & payroll features: employee management, time tracking, automated payroll processing, leave management, and advanced analytics.",
    type: "website",
    url: "https://voltahr.com/features",
  },
  twitter: {
    card: "summary_large_image",
    title: "Volta HR Features - Complete HR Solution",
    description:
      "All the tools you need: time tracking, payroll automation, leave management, and powerful reporting.",
  },
  alternates: {
    canonical: "https://voltahr.com/features",
  },
};

export default function FeaturesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
