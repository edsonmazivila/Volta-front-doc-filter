"use client";
import React from "react";
import type { ComponentProps, ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  FacebookIcon,
  LinkedinIcon,
} from "lucide-react";
import Image from "next/image";
import { useLingui } from "@lingui/react";
import { msg } from "@lingui/core/macro";

interface FooterLink {
  titleKey: ReturnType<typeof msg>;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface FooterSection {
  labelKey: ReturnType<typeof msg>;
  links: FooterLink[];
}

const footerLinks: FooterSection[] = [
  {
    labelKey: msg`Product`,
    links: [
      { titleKey: msg`Features`, href: "#features" },
      { titleKey: msg`Pricing`, href: "#pricing" },
      { titleKey: msg`Testimonials`, href: "#testimonials" },
    ],
  },
  {
    labelKey: msg`Company`,
    links: [
      { titleKey: msg`About Us`, href: "/about" },
      { titleKey: msg`Privacy Policy`, href: "/privacy" },
      { titleKey: msg`Terms of Services`, href: "/terms" },
    ],
  },
  {
    labelKey: msg`Resources`,
    links: [
      { titleKey: msg`Blog`, href: "/blog" },
      { titleKey: msg`Help`, href: "/help" },
    ],
  },
  {
    labelKey: msg`Social Links`,
    links: [
      { titleKey: msg`Facebook`, href: "#", icon: FacebookIcon },
      { titleKey: msg`LinkedIn`, href: "#", icon: LinkedinIcon },
    ],
  },
];

export function Footer() {
  const { i18n } = useLingui();
  return (
    <footer className="md:rounded-t-6xl relative w-full max-w-6xl mx-auto flex flex-col items-center justify-center rounded-t-4xl border-t bg-[radial-gradient(35%_128px_at_50%_0%,theme(backgroundColor.white/8%),transparent)] px-6 py-12 lg:py-16">
      <div className="bg-foreground/20 absolute top-0 right-1/2 left-1/2 h-px w-1/3 -translate-x-1/2 -translate-y-1/2 rounded-full blur" />

      <div className="grid w-full gap-8 xl:grid-cols-3 xl:gap-8">
        <AnimatedContainer className="space-y-4">
          {/* Logo para light mode */}
          <Image
            src="/logo/full-logo-blue-black-2000x827.svg"
            alt="logo"
            width={100}
            height={100}
            className="dark:hidden"
          />
          {/* Logo para dark mode */}
          <Image
            src="/logo/full-logo-blue-white-2000x827.svg"
            alt="logo"
            width={100}
            height={100}
            className="hidden dark:block"
          />
          <p className="text-muted-foreground mt-8 text-sm md:mt-0">
            Volta HR - Powered by Dorico Dynamics<br />
            © {new Date().getFullYear()} Dorico Dynamics. {i18n._(msg`All rights reserved.`)}
          </p>
        </AnimatedContainer>

        <div className="mt-10 grid grid-cols-2 gap-8 md:grid-cols-4 xl:col-span-2 xl:mt-0">
          {footerLinks.map((section, index) => (
            <AnimatedContainer key={i18n._(section.labelKey)} delay={0.1 + index * 0.1}>
              <div className="mb-10 md:mb-0">
                <h3 className="text-xs">{i18n._(section.labelKey)}</h3>
                <ul className="text-muted-foreground mt-4 space-y-2 text-sm">
                  {section.links.map((link) => (
                    <li key={i18n._(link.titleKey)}>
                      <a
                        href={link.href}
                        className="hover:text-foreground inline-flex items-center transition-all duration-300"
                      >
                        {link.icon && <link.icon className="me-1 size-4" />}
                        {i18n._(link.titleKey)}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </AnimatedContainer>
          ))}
        </div>
      </div>
    </footer>
  );
}

type ViewAnimationProps = {
  delay?: number;
  className?: ComponentProps<typeof motion.div>["className"];
  children: ReactNode;
};

function AnimatedContainer({
  className,
  delay = 0.1,
  children,
}: ViewAnimationProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ filter: "blur(4px)", translateY: -8, opacity: 0 }}
      whileInView={{ filter: "blur(0px)", translateY: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.8 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default Footer;
