import { CalendarIcon, FileTextIcon } from "@radix-ui/react-icons";
import { BellIcon, Share2Icon } from "lucide-react";
import { cn } from "@/lib/utils";
import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";
import { Marquee } from "@/components/ui/marquee";
import { AnimatedBeamDemo } from "@/components/ui/hero-beam";
import { Calendar } from "@/components/ui/calendar";
import { AutomatedPayrollFlow } from "@/components/ui/auto-pay-flow";

// Fixed date to prevent hydration issues
const CALENDAR_DATE = new Date(2025, 12, 12);
const files = [
  {
    name: "Payroll",
    body: "Payroll summary by department and month for leadership reviews.",
  },
  {
    name: "finances.csv",
    body: "Exportable CSV with net pay, taxes, and employer costs.",
  },
  {
    name: "charts.png",
    body: "Headcount, overtime, and turnover trends visualized with charts.",
  },
  {
    name: "reports.pdf",
    body: "Access-controlled reports with audit trails and secure sharing.",
  },
  {
    name: "presets.json",
    body: "Saved report presets to quickly rerun common insights.",
  },
];

const features = [
  {
    Icon: FileTextIcon,
    name: "Reporting & Analytics",
    description:
      "Real‑time dashboards and exports give you visibility into payroll, and costs across companies.",
    href: "#",
    cta: "Learn more",
    className: "col-span-3 lg:col-span-1",
    background: (
      <Marquee
        pauseOnHover
        className="absolute top-10 [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)] [--duration:20s]"
      >
        {files.map((f, idx) => (
          <figure
            key={idx}
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
    name: "Automated Payroll",
    description:
      "Automate calculations, taxes, and deductions; export bank‑ready files and paystubs with full audit trails.",
    href: "#",
    cta: "Learn more",
    className: "col-span-3 lg:col-span-2",
    background: (
      <div className="absolute inset-0 flex items-start justify-center pt-6 [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)]">
        <AutomatedPayrollFlow />
      </div>
    ),
  },
  {
    Icon: Share2Icon,
    name: "HR & People Management",
    description:
      "Centralize employee records, roles, documents, leave policies and requests — with tenant‑safe access controls.",
    href: "#",
    cta: "Learn more",
    className: "col-span-3 lg:col-span-2",
    background: (
      <div className="absolute inset-0 [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)]">
        <AnimatedBeamDemo />
      </div>
    ),
  },
  {
    Icon: CalendarIcon,
    name: "Time & Attendance",
    description:
      "Track attendance, manage overtime, and streamline approvals with an intuitive experience.",
    className: "col-span-3 lg:col-span-1",
    href: "#",
    cta: "Learn more",
    background: (
      <Calendar
        mode="single"
        selected={CALENDAR_DATE}
        className="absolute top-10 right-0 origin-top scale-75 rounded-md border [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)] transition-all duration-300 ease-out group-hover:scale-90"
      />
    ),
  },
];

export function Features() {
  return (
    <BentoGrid>
      {features.map((feature, idx) => (
        <BentoCard key={idx} {...feature} />
      ))}
    </BentoGrid>
  );
}

export default Features;
