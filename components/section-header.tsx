"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

interface SectionHeaderProps {
    text: string;
    icon?: LucideIcon;
    className?: string;
}

export const SectionHeader = ({ text, icon: Icon, className }: SectionHeaderProps) => {
    return (
        <div className={`w-full flex items-center justify-center relative overflow-hidden py-12 ${className}`}>
            <div className="flex items-center gap-3">
                {/* Left Line with Diamond */}
                <div className="flex items-center">
                    <div className="w-16 md:w-32 h-[1.5px] bg-gradient-to-r from-transparent to-blue-500/50" />
                    <div className="w-1.5 h-1.5 bg-blue-400 rotate-45 transform" />
                </div>

                {/* Center Badge */}
                <div className="relative z-10">
                    <div className="absolute inset-0 bg-blue-500/5 blur-xl rounded-full" />
                    <div className="relative px-6 py-2 border border-blue-500/30 rounded-full flex items-center gap-3 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
                        {Icon && <Icon className="w-5 h-5 text-blue-400" />}
                        <span className="text-blue-100 font-medium text-sm tracking-wide">
                            {text}
                        </span>
                    </div>
                </div>

                {/* Right Line with Diamond */}
                <div className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-blue-400 rotate-45 transform" />
                    <div className="w-16 md:w-32 h-[1.5px] bg-gradient-to-l from-transparent to-blue-500/50" />
                </div>
            </div>
        </div>
    );
};
