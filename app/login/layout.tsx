import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login - Access Your HR Dashboard",
  description:
    "Sign in to your Volta HR account to manage employees, track time, process payroll, and access comprehensive HR tools.",
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: "https://voltahr.com/login",
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
