"use client";

import { useLingui } from "@lingui/react";
import { msg } from "@lingui/core/macro";
import {
    Users,
    Clock,
    DollarSign,
    Calendar,
    FileText,
    BarChart3,
    ArrowRight,
    Sparkles,
    Boxes,
    Shield,
} from "lucide-react";
import Link from "next/link";
import { SectionHeader } from "@/components/section-header";

export function FeaturesHighlights() {
    const { i18n } = useLingui();

    const features = [
        {
            icon: Users,
            title: i18n._(msg`HR & People Management`),
            description: i18n._(
                msg`Centralize employee records, roles, and org structure with tenant-safe access controls.`
            ),
            image: "/feature-1.png",
            size: "large" as const,
            textPosition: "top-[60%]",
            hasIcons: true,
        },
        {
            icon: DollarSign,
            title: i18n._(msg`Automated Payroll`),
            description: i18n._(
                msg`Calculate payroll in seconds with automatic taxes, deductions, and bank-ready exports.`
            ),
            image: "/feature-2.png",
            size: "large" as const,
            textPosition: "top-[60%]",
            hasCenterIcon: true,
        },
        {
            icon: Clock,
            title: i18n._(msg`Time & Attendance`),
            description: i18n._(
                msg`One-click check-in, real-time monitoring, overtime tracking, and much more.`
            ),
            image: "/feature-3.png",
            size: "small" as const,
            textPosition: "bottom-2",
        },
        {
            icon: Calendar,
            title: i18n._(msg`Leave Management`),
            description: i18n._(
                msg`Self-service leave requests with approval flows, balance tracking, and team calendars.`
            ),
            image: "/feature-4.png",
            size: "small" as const,
            textPosition: "top-4",
        },
        {
            icon: BarChart3,
            title: i18n._(msg`Reporting & Analytics`),
            description: i18n._(
                msg`Real-time dashboards with payroll reports, cost analysis, and export to PDF/Excel.`
            ),
            image: "/feature-5.png",
            size: "large" as const,
            textPosition: "top-4",
        },
        {
            icon: Shield,
            title: i18n._(msg`Enterprise Security`),
            description: i18n._(
                msg`Bank-level security with SOC 2 certification, data encryption, and RBAC.`
            ),
            image: "/feature-6.png",
            size: "large" as const,
            textPosition: "bottom-10",
        },
    ];

    // Split into rows for bento layout
    const topRow = features.slice(0, 2); // 2 large cards
    const middleRow = features.slice(2, 4); // 2 small cards
    const bottomRow = features.slice(4, 6); // 2 large cards

    return (
        <section className="py-24 px-4 bg-neutral-900 overflow-hidden">
            <div className="max-w-6xl mx-auto">
                <SectionHeader
                    text={i18n._(msg`Core Features`)}
                    icon={Sparkles}
                    className="mb-4"
                />

                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                        {i18n._(msg`Everything You Need, All in One Place`)}
                    </h2>
                    <p className="text-gray-400 text-lg max-w-3xl mx-auto">
                        {i18n._(
                            msg`From hiring to payroll, Volta HR covers the entire employee lifecycle with powerful automation.`
                        )}
                    </p>
                </div>

                {/* Bento Grid - Using 12-column system to vary widths */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* Row 1: Large + Medium */}
                    <div className="md:col-span-7">
                        <BentoCard feature={features[0]} />
                    </div>
                    <div className="md:col-span-5">
                        <BentoCard feature={features[1]} />
                    </div>

                    {/* Row 2: Small + Medium-Large */}
                    <div className="md:col-span-5">
                        <BentoCard feature={features[2]} />
                    </div>
                    <div className="md:col-span-7">
                        <BentoCard feature={features[4]} />
                    </div>

                    {/* Row 3: Medium-Large + Medium-Small */}
                    <div className="md:col-span-7">
                        <BentoCard feature={features[3]} />
                    </div>
                    <div className="md:col-span-5">
                        <BentoCard feature={features[5]} />
                    </div>
                </div>

                {/* View All Features Link */}
                <div className="text-center mt-12">
                    <Link
                        href="/features"
                        className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200 group"
                    >
                        {i18n._(msg`View All Features`)}
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                    </Link>
                </div>
            </div>
        </section>
    );
}

interface BentoFeature {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
    image: string;
    size: "large" | "small";
    textPosition: string;
    hasIcons?: boolean;
    hasCenterIcon?: boolean;
}

/* ─── Icon bubble used on cards with icon overlays ─── */
function IconBubble({
    icon: Icon,
    className,
}: {
    icon: React.ComponentType<{ className?: string }>;
    className?: string;
}) {
    return (
        <div
            className={`absolute flex items-center justify-center w-11 h-11 rounded-full bg-blue-500/20 border border-blue-400/40 backdrop-blur-sm z-10 ${className}`}
        >
            <Icon className="w-5 h-5 text-blue-400" />
        </div>
    );
}

/* ─── Flexible Bento Card Layout ─── */
function BentoCard({ feature }: { feature: BentoFeature }) {
    return (
        <div className="group relative p-[1px] rounded-3xl transition-all duration-300 h-full">
            <div
                className="absolute inset-0 rounded-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                    background: `linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.08) 50%, transparent 70%)`,
                }}
            />
            <div className="relative rounded-3xl overflow-hidden h-full border border-white/10 hover:border-white/15 transition-all duration-300 group/card bg-neutral-900">
                {/* Background image fills entire card - using object-cover to eliminate gaps */}
                <div className="relative w-full aspect-square md:aspect-auto md:h-[400px] lg:h-[450px] overflow-hidden">
                    <img
                        src={feature.image}
                        alt={feature.title}
                        className="w-full h-full object-cover transform group-hover/card:scale-105 transition-transform duration-700"
                    />

                    {/* Optional Center Icon Overlay */}
                    {feature.hasCenterIcon && (
                        <div className="absolute top-[26%] left-1/2 -translate-x-1/2 flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-blue-600 border-2 border-blue-400 shadow-[0_0_40px_rgba(37,99,235,0.4)] z-20">
                            {(() => {
                                const Icon = feature.icon;
                                return <Icon className="w-6 h-6 md:w-8 md:h-8 text-white" />;
                            })()}
                        </div>
                    )}

                    {/* Optional Icon Overlay (arc style) */}
                    {feature.hasIcons && (
                        <div className="absolute inset-0 pointer-events-none z-10">
                            <IconBubble icon={Users} className="top-[5%] left-1/2 -translate-x-1/2" />
                            <IconBubble icon={Clock} className="top-[18%] left-[25%]" />
                            <IconBubble icon={DollarSign} className="top-[12%] right-[30%]" />
                            <IconBubble icon={Calendar} className="top-[30%] right-[12%]" />
                            <IconBubble icon={FileText} className="top-[28%] left-[15%]" />
                        </div>
                    )}

                    {/* Subtle dark gradient for text legibility on light images */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Text overlay with custom position */}
                <div className={`absolute left-0 right-0 z-10 px-8 text-center transition-all duration-300 group-hover/card:transform group-hover/card:-translate-y-2 ${feature.textPosition}`}>
                    <h3 className="text-white font-bold text-xl mb-2 drop-shadow-2xl">{feature.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed max-w-sm mx-auto drop-shadow-xl">
                        {feature.description}
                    </p>
                </div>
            </div>
        </div>
    );
}
