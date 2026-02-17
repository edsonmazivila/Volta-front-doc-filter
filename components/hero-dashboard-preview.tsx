"use client";

import Image from "next/image";
import {
	LayoutDashboard,
	Users,
	Clock,
	FileText,
	Calendar,
	FileCheck,
	ClipboardCheck,
	Video,
	FolderOpen,
	CalendarCheck,
	Bell,
} from "lucide-react";

/**
 * Presentational dashboard mock for the hero section.
 * No logic, no real links—pure UI to show how the app looks.
 * Easy to maintain: edit MOCK_* constants to change copy/layout.
 */

const MOCK_NAV = [
	{
		title: "OVERVIEW",
		items: [{ label: "Dashboard", icon: LayoutDashboard, active: true }],
	},
	{
		title: "MANAGEMENT",
		items: [
			{ label: "Employees Management", icon: Users },
			{ label: "Team Timesheets", icon: Clock },
			{ label: "Team Attendance", icon: ClipboardCheck },
			{ label: "Team time off", icon: Calendar },
			{ label: "Meetings", icon: Video },
			{ label: "Team Documents", icon: FileText },
		],
	},
	{
		title: "SELF SERVICE",
		items: [
			{ label: "Paystubs", icon: FileCheck },
			{ label: "Attendance", icon: Clock },
			{ label: "Timesheets", icon: Clock },
			{ label: "Time Off", icon: CalendarCheck },
			{ label: "Documents", icon: FolderOpen },
		],
	},
] as const;

const MOCK_STATS = [
	{ label: "Total Employees", value: "23" },
	{ label: "Active Timesheets", value: "18" },
];

const MOCK_QUICK_ACTIONS = [
	{
		title: "Manage Employees",
		subtitle: "Add and update members",
		icon: Users,
		accent: "blue" as const,
	},
	{
		title: "View Timesheets",
		subtitle: "Review and approve",
		icon: ClipboardCheck,
		accent: "green" as const,
	},
];

/** Bar heights as % for Mon–Sun (visible chart) */
const MOCK_CHART_BARS = [45, 62, 78, 95, 88, 40, 20];

export function HeroDashboardPreview() {
	return (
		<div className="flex w-full h-full min-h-0 rounded-[30px] overflow-hidden border border-neutral-800 bg-neutral-900 shadow-2xl">
			{/* Subtle grid behind entire dashboard */}
			<div
				className="absolute inset-0 pointer-events-none opacity-[0.04] rounded-[30px]"
				aria-hidden
				style={{
					backgroundImage: `
						linear-gradient(rgba(59, 130, 246, 0.5) 1px, transparent 1px),
						linear-gradient(90deg, rgba(59, 130, 246, 0.5) 1px, transparent 1px)
					`,
					backgroundSize: "20px 20px",
				}}
			/>

			{/* Sidebar — fills height */}
			<aside className="rounded-tl-3xl relative flex-shrink-0 w-56 flex flex-col border-r border-white/10 bg-neutral-950/80 backdrop-blur-sm">
				<div className="p-4 border-b border-white/10 flex items-center justify-center flex-shrink-0">
					<Image
						src="/logo/SVG/full-logo-purple-white-2000x1500.svg"
						alt="Volta HR"
						width={120}
						height={48}
						className="h-8 w-auto object-contain"
					/>
				</div>
				<nav className="flex-1 overflow-y-auto p-3 space-y-6 min-h-0">
					{MOCK_NAV.map((section) => (
						<div key={section.title}>
							<p className="text-[10px] font-semibold text-white/50 uppercase tracking-wider px-3 mb-2">
								{section.title}
							</p>
							<ul className="space-y-0.5">
								{section.items.map((item) => {
									const Icon = item.icon;
									const isActive = "active" in item && item.active === true;
									return (
										<li key={item.label}>
											<button
												type="button"
												className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-left transition-all duration-200 cursor-pointer
													${isActive ? "bg-white/10 text-white" : "text-white/80 hover:bg-white/10 hover:text-white"}
												`}
											>
												<Icon className="w-4 h-4 flex-shrink-0 text-inherit" />
												<span className="truncate">{item.label}</span>
											</button>
										</li>
									);
								})}
							</ul>
						</div>
					))}
				</nav>
			</aside>

			{/* Main content */}
			<main className="relative flex-1 flex flex-col min-w-0 bg-neutral-900/50">
				{/* Header */}
				<header className="flex-shrink-0 h-12 px-4 flex items-center justify-between border-b border-white/10">
					<h1 className="text-lg font-semibold text-white">Dashboard</h1>
					<div className="flex items-center gap-2">
						<button
							type="button"
							className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white text-sm font-medium hover:bg-white/20 transition-colors cursor-pointer"
							aria-label="Profile"
						>
							H
						</button>
						<button
							type="button"
							className="p-2 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors"
							aria-label="Notifications"
						>
							<Bell className="w-5 h-5" />
						</button>
					</div>
				</header>

				{/* Scrollable body */}
				<div className="flex-1 overflow-auto p-4 space-y-6">
					{/* Stats row */}
					<section className="grid grid-cols-2 gap-4">
						{MOCK_STATS.map((stat) => (
							<button
								type="button"
								key={stat.label}
								className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-sm text-left transition-all duration-200 hover:border-white/20 hover:bg-white/[0.08] cursor-pointer"
							>
								<p className="text-sm text-white/60">{stat.label}</p>
								<p className="text-2xl font-semibold text-white mt-1">{stat.value}</p>
							</button>
						))}
					</section>

					{/* Quick Actions */}
					<section>
						<h2 className="text-sm font-medium text-white/70 mb-3">Quick Actions</h2>
						<div className="grid grid-cols-2 gap-3">
							{MOCK_QUICK_ACTIONS.map((action) => {
								const Icon = action.icon;
								const isGreen = action.accent === "green";
								return (
									<button
										type="button"
										key={action.title}
										className={`rounded-2xl border p-4 flex items-center gap-3 text-left transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.99]
											${isGreen ? "border-green-500/40 bg-green-500/5 hover:border-green-500/60 hover:bg-green-500/10" : "border-white/10 bg-white/[0.06] hover:border-white/20 hover:bg-white/[0.08]"}
										`}
									>
										<div
											className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
												${isGreen ? "bg-green-500/20 text-green-400" : "bg-blue-500/20 text-blue-400"}
											`}
										>
											<Icon className="w-5 h-5" />
										</div>
										<div className="min-w-0">
											<h3 className="font-medium text-white text-sm">{action.title}</h3>
											<p className="text-xs text-white/50 truncate">{action.subtitle}</p>
										</div>
									</button>
								);
							})}
						</div>
					</section>

					{/* This Week's Hours — visible bar chart */}
					<section>
						<div className="flex items-center justify-between mb-3">
							<h2 className="text-sm font-medium text-white/70">This Week&apos;s Hours</h2>
							<button
								type="button"
								className="text-xs text-blue-400 hover:text-blue-300 hover:underline cursor-pointer transition-colors"
							>
								View All
							</button>
						</div>
						<div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-sm transition-colors hover:border-white/15 cursor-default">
							{/* Y-axis labels */}
							<div className="flex gap-2 mb-2">
								<div className="flex flex-col justify-between text-[10px] text-white/40 w-6 flex-shrink-0">
									<span>160</span>
									<span>120</span>
									<span>80</span>
									<span>40</span>
									<span>0</span>
								</div>
								{/* Chart area with bars */}
								<div className="flex-1 min-w-0 h-[140px] flex items-end gap-1 sm:gap-2">
									{MOCK_CHART_BARS.map((pct, i) => (
										<div key={i} className="flex-1 h-full flex flex-col justify-end items-center gap-1 min-w-0">
											<div
												className="w-full max-w-8 rounded-t-md flex-shrink-0 transition-transform hover:opacity-90"
												style={{
													height: `${Math.max(10, pct)}%`,
													background: "linear-gradient(to top, rgba(59, 130, 246, 0.95), rgba(147, 197, 253, 0.55))",
												}}
											/>
										</div>
									))}
								</div>
							</div>
							<div className="flex justify-between mt-2 text-[10px] text-white/40 px-8">
								<span>Mon</span>
								<span>Tue</span>
								<span>Wed</span>
								<span>Thu</span>
								<span>Fri</span>
								<span>Sat</span>
								<span>Sun</span>
							</div>
						</div>
					</section>
				</div>
			</main>
		</div>
	);
}
