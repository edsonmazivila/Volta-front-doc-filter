import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up - Start Your Free Trial",
  description:
    "Create your Volta HR account and get started with powerful HR & payroll management. Free 14-day trial. No credit card required.",
  keywords: [
    "HR software signup",
    "payroll software trial",
    "free HR trial",
    "HR software demo",
    "start HR platform",
  ],
  openGraph: {
    title: "Start Your Free Volta HR Trial Today",
    description:
      "Sign up now and get 14 days free access to all features. No credit card required.",
    type: "website",
    url: "https://voltahr.com/signup",
  },
  twitter: {
    card: "summary",
    title: "Start Your Free Volta HR Trial",
    description: "14 days free. No credit card required. Get started now.",
  },
  alternates: {
    canonical: "https://voltahr.com/signup",
  },
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
