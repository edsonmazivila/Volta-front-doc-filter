"use client";

import { CalendarIcon, FileTextIcon } from "@radix-ui/react-icons";
import { BellIcon, Share2Icon } from "lucide-react";
import { cn } from "@/lib/utils";
import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";
import { Marquee } from "@/components/ui/marquee";
import { AnimatedBeamDemo } from "@/components/ui/hero-beam";
import { Calendar } from "@/components/ui/calendar";
import { AutomatedPayrollFlow } from "@/components/ui/auto-pay-flow";
import { useLingui } from "@lingui/react";
import { msg } from "@lingui/core/macro";

// Fixed date to prevent hydration issues
const CALENDAR_DATE = new Date(2025, 12, 12);

export function Features() {
  const { i18n } = useLingui();

  const files = [
    {
      name: i18n._(msg`Payroll`),
      body: i18n._(msg`Payroll summary by department and month for leadership reviews.`),
    },
    {
      name: "finances.csv",
      body: i18n._(msg`Exportable CSV with net pay, taxes, and employer costs.`),
    },
    {
      name: "charts.png",
      body: i18n._(msg`Headcount, overtime, and turnover trends visualized with charts.`),
    },
    {
      name: "reports.pdf",
      body: i18n._(msg`Access-controlled reports with audit trails and secure sharing.`),
    },
    {
      name: "presets.json",
      body: i18n._(msg`Saved report presets to quickly rerun common insights.`),
    },
  ];

  const features = [
    {
      Icon: FileTextIcon,
      name: i18n._(msg`Reporting & Analytics`),
      description: i18n._(msg`Real‑time dashboards and exports give you visibility into payroll, and costs across companies.`),
      href: "#",
      cta: i18n._(msg`Learn more`),
      className: "col-span-3 lg:col-span-1",
      background: (
        <Marquee
          pauseOnHover
          className="absolute top-10 [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)] [--duration:20s]"
        >
          {files.map((f) => (
            <figure
              key={f.name}
              className={cn(
                "relative w-32 cursor-pointer overflow-hidden rounded-xl border p-4",
                "border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]",
                "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]",
                "transform-gpu blur-[1px] transition-all duration-300 ease-out hover:blur-none"
              )}
            >
              <div className="flex flex-row items-center gap-2">
                <div className="flex flex-col">
                  <figcaption className="text-sm font-medium dark:text-white">
                    {f.name}
                  </figcaption>
                </div>
              </div>
              <blockquote className="mt-2 text-xs">{f.body}</blockquote>
            </figure>
          ))}
        </Marquee>
      ),
    },
    {
      Icon: BellIcon,
      name: i18n._(msg`Automated Payroll`),
      description: i18n._(msg`Automate calculations, taxes, and deductions; export bank‑ready files and paystubs with full audit trails.`),
      href: "#",
      cta: i18n._(msg`Learn more`),
      className: "col-span-3 lg:col-span-2",
      background: (
        <div className="absolute inset-0 flex items-start justify-center pt-6 [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)]">
          <AutomatedPayrollFlow />
        </div>
      ),
    },
    {
      Icon: Share2Icon,
      name: i18n._(msg`HR & People Management`),
      description: i18n._(msg`Centralize employee records, roles, documents, leave policies and requests — with tenant‑safe access controls.`),
      href: "#",
      cta: i18n._(msg`Learn more`),
      className: "col-span-3 lg:col-span-2",
      background: (
        <div className="absolute inset-0 [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)]">
          <AnimatedBeamDemo />
        </div>
      ),
    },
    {
      Icon: CalendarIcon,
      name: i18n._(msg`Time & Attendance`),
      description: i18n._(msg`Track attendance, manage overtime, and streamline approvals with an intuitive experience.`),
      className: "col-span-3 lg:col-span-1",
      href: "#",
      cta: i18n._(msg`Learn more`),
      background: (
        <Calendar
          mode="single"
          selected={CALENDAR_DATE}
          className="absolute top-10 right-0 origin-top scale-75 rounded-md border [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)] transition-all duration-300 ease-out group-hover:scale-90"
        />
      ),
    },
  ];

  return (
    <BentoGrid>
      {features.map((feature) => (
        <BentoCard key={feature.name} {...feature} />
      ))}
    </BentoGrid>
  );
}
