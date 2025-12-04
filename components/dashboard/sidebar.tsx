"use client";

import Link from "next/link";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useMemo,
} from "react";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Clock,
  FileText,
  Calendar,
  DollarSign,
  BarChart3,
  UserCog,
  Building2,
  Briefcase,
  FileCheck,
  CalendarCheck,
  FolderOpen,
  X,
  ClipboardCheck,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui";
import { useSession } from "@/components/auth/session-context";
import { usePermissions } from "@/lib/rbac/hooks";
import Image from "next/image";
import { useLingui } from "@lingui/react";
import { msg } from "@lingui/core/macro";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

type NavSection = {
  title: string;
  items: NavItem[];
};

/**
 * Hook to get translated navigation sections
 */
function useNavSections(): NavSection[] {
  const { i18n } = useLingui();

  return useMemo(() => [
    {
      title: i18n._(msg`Overview`),
      items: [{ href: "/dashboard", label: i18n._(msg`Dashboard`), icon: LayoutDashboard }],
    },
    {
      title: i18n._(msg`Management`),
      items: [
        {
          href: "/dashboard/employees",
          label: i18n._(msg`Employees Management`),
          icon: Users,
        },
        { href: "/dashboard/timesheets", label: i18n._(msg`Team Timesheets`), icon: Clock },
        {
          href: "/dashboard/attendance",
          label: i18n._(msg`Team Attendance`),
          icon: ClipboardCheck,
        },
        { href: "/dashboard/leaves", label: i18n._(msg`Team time off`), icon: Calendar },
        { href: "/dashboard/payroll", label: i18n._(msg`Payroll`), icon: DollarSign },
        { href: "/dashboard/meetings", label: i18n._(msg`Meetings`), icon: Video },
        { href: "/dashboard/documents", label: i18n._(msg`Team Documents`), icon: FileText },
      ],
    },
    {
      title: i18n._(msg`Self Service`),
      items: [
        { href: "/dashboard/paystubs", label: i18n._(msg`Paystubs`), icon: FileCheck },
        { href: "/dashboard/my-attendance", label: i18n._(msg`Attendance`), icon: Clock },
        { href: "/dashboard/my-timesheets", label: i18n._(msg`Timesheets`), icon: Clock },
        { href: "/dashboard/my-leaves", label: i18n._(msg`Time Off`), icon: CalendarCheck },
        { href: "/dashboard/my-documents", label: i18n._(msg`Documents`), icon: FolderOpen },
        { href: "/dashboard/profile", label: i18n._(msg`Profile`), icon: UserCog },
      ],
    },
    {
      title: i18n._(msg`Administration`),
      items: [
        {
          href: "/dashboard/departments",
          label: i18n._(msg`Department Management`),
          icon: Building2,
        },
        { href: "/dashboard/reports", label: i18n._(msg`Reports`), icon: BarChart3 },
        { href: "/dashboard/company", label: i18n._(msg`Company`), icon: Briefcase },
      ],
    },
  ], [i18n]);
}

// Keep for backwards compatibility with any external imports
export const NAV_SECTIONS: NavSection[] = [
  {
    title: "Overview",
    items: [{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Management",
    items: [
      { href: "/dashboard/employees", label: "Employees Management", icon: Users },
      { href: "/dashboard/timesheets", label: "Team Timesheets", icon: Clock },
      { href: "/dashboard/attendance", label: "Team Attendance", icon: ClipboardCheck },
      { href: "/dashboard/leaves", label: "Team time off", icon: Calendar },
      { href: "/dashboard/payroll", label: "Payroll", icon: DollarSign },
      { href: "/dashboard/meetings", label: "Meetings", icon: Video },
      { href: "/dashboard/documents", label: "Team Documents", icon: FileText },
    ],
  },
  {
    title: "Self Service",
    items: [
      { href: "/dashboard/paystubs", label: "Paystubs", icon: FileCheck },
      { href: "/dashboard/my-attendance", label: "Attendance", icon: Clock },
      { href: "/dashboard/my-timesheets", label: "Timesheets", icon: Clock },
      { href: "/dashboard/my-leaves", label: "Time Off", icon: CalendarCheck },
      { href: "/dashboard/my-documents", label: "Documents", icon: FolderOpen },
      { href: "/dashboard/profile", label: "Profile", icon: UserCog },
    ],
  },
  {
    title: "Administration",
    items: [
      { href: "/dashboard/departments", label: "Department Management", icon: Building2 },
      { href: "/dashboard/reports", label: "Reports", icon: BarChart3 },
      { href: "/dashboard/company", label: "Company", icon: Briefcase },
    ],
  },
];

type SidebarContextValue = {
  open: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
};
const SidebarContext = createContext<SidebarContextValue | null>(null);

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used within SidebarProvider");
  return ctx;
}

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const openDrawer = useCallback(() => setOpen(true), []);
  const closeDrawer = useCallback(() => setOpen(false), []);
  return (
    <SidebarContext.Provider value={{ open, openDrawer, closeDrawer }}>
      {children}
      <SidebarDrawer />
    </SidebarContext.Provider>
  );
}

export function Sidebar() {
  const { user } = useSession();
  const pathname = usePathname();
  const { canAccessPage } = usePermissions();
  const navSections = useNavSections();
  const { i18n } = useLingui();

  // Compute filtered sections directly each render to reflect current role immediately
  const hideSelfService = user?.role === "system_admin";
  const selfServiceTitle = i18n._(msg`Self Service`);
  const filteredSections = navSections.filter(
    (section) => !(hideSelfService && section.title === selfServiceTitle)
  )
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => canAccessPage(item.href)),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <aside className="hidden md:flex w-64 shrink-0 border-r border-border bg-background/50 backdrop-blur flex-col">
      <div className="p-1 border-b border-border">
        <Image
          src="/logo/full-logo-blue-white.svg"
          alt="NEXUpayroll"
          width={100}
          height={100}
          className="h-auto w-20"
        />
      </div>


      <nav className="flex-1 overflow-y-auto p-3 space-y-6">
        {filteredSections.map((section) => (
          <div key={section.title}>
            <h3 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {section.title}
            </h3>
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground font-medium"
                        : "hover:bg-muted text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}

export function SidebarTrigger({ className = "" }: { className?: string }) {
  const { openDrawer } = useSidebar();
  const { i18n } = useLingui();
  return (
    <Button
      aria-label={i18n._(msg`Open menu`)}
      className={`md:hidden ${className}`}
      variant="outline"
      size="sm"
      onClick={openDrawer}
    >
      {i18n._(msg`Menu`)}
    </Button>
  );
}

function SidebarDrawer() {
  const { open, closeDrawer } = useSidebar();
  const { user } = useSession();
  const pathname = usePathname();
  const { canAccessPage } = usePermissions();
  const navSections = useNavSections();
  const { i18n } = useLingui();

  // Compute filtered sections directly each render
  const hideSelfService = user?.role === "system_admin";
  const selfServiceTitle = i18n._(msg`Self Service`);
  const filteredSections = navSections.filter(
    (section) => !(hideSelfService && section.title === selfServiceTitle)
  )
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => canAccessPage(item.href)),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <div
      aria-hidden={!open}
      className={`fixed inset-0 z-50 md:hidden ${
        open ? "" : "pointer-events-none"
      }`}
    >
      <div
        className={`absolute inset-0 bg-black/60 transition-opacity ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={closeDrawer}
        aria-label="Close menu overlay"
      />
      <aside
        className={`absolute left-0 top-0 h-full w-72 bg-background border-r border-border flex flex-col transition-transform ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="text-lg font-bold">NEXUpayroll</h2>
          <button
            onClick={closeDrawer}
            aria-label="Close menu"
            className="p-2 hover:bg-muted rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>


        <nav className="flex-1 overflow-y-auto p-3 space-y-6">
          {filteredSections.map((section) => (
            <div key={section.title}>
              <h3 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeDrawer}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                        isActive
                          ? "bg-primary text-primary-foreground font-medium"
                          : "hover:bg-muted text-foreground"
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>
    </div>
  );
}
