import type { Metadata } from "next";
import Hero from "../components/hero";
import HomeHeader from "../components/home-header";
import { DeploymentFlexibility } from "@/components/deployment-flexibility";
import { SocialProof } from "@/components/social-proof";
import { Integrations } from "@/components/integrations";
import { SecurityCompliance } from "@/components/security-compliance";
import { FAQ as FrequentlyAskedQuestions } from "@/components/faq";
import { FinalCTA } from "@/components/final-cta";

export const metadata: Metadata = {
  title: "Volta HR - All-in-One HR & Payroll Platform for African Businesses",
  description:
    "Streamline employee management, time tracking, leave requests, and payroll processing. Secure, scalable, and built for growth. Start your free trial today.",
  keywords: [
    "HR software",
    "payroll system",
    "time tracking",
    "leave management",
    "employee management",
    "HR platform Africa",
    "payroll software Mozambique",
    "HRIS",
    "human resources management",
  ],
  openGraph: {
    title: "Volta HR - All-in-One HR & Payroll Platform",
    description:
      "Streamline your entire employee lifecycle with automated time tracking, leave management, and comprehensive reporting.",
    type: "website",
    url: "https://voltahr.com",
    siteName: "Volta HR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Volta HR - All-in-One HR & Payroll Platform",
    description:
      "Streamline employee management, time tracking, and payroll. Start your free trial today.",
  },
};

export default function Home() {
  return (
    <main className="bg-[#030009]">
      <HomeHeader />
      <Hero />
      <DeploymentFlexibility />
      <SocialProof />
      <Integrations />
      <SecurityCompliance />
      <FrequentlyAskedQuestions />
      <FinalCTA />
      {/* Temporarily hiding footer for future reuse */}
      {/*
      <Footer/>
      */}
    </main>
  );
}
