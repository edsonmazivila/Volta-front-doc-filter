"use client";

import { useLingui } from "@lingui/react";
import { msg } from "@lingui/core/macro";
import {
	Workflow,
	Calculator,
	Cloud,
	Clock,
	Landmark,
	Mail,
	MessageCircle,
	Code2,
} from "lucide-react";
import { SectionHeader } from "@/components/section-header";

const integrationCategories = [
	{
		icon: Calculator,
		categoryKey: msg`Accounting`,
		descriptionKey: msg`Sync payroll and expenses with your existing accounting stack.`,
		tools: ["QuickBooks", "Xero", "SAP"],
		span: 7,
	},
	{
		icon: Cloud,
		categoryKey: msg`Cloud Storage`,
		descriptionKey: msg`Store documents and backups in your preferred cloud.`,
		tools: ["AWS S3", "Google Cloud", "Azure Blob"],
		span: 5,
	},
	{
		icon: Clock,
		categoryKey: msg`Time Clocks`,
		descriptionKey: msg`Connect hardware and software time clocks for accurate attendance.`,
		tools: ["BioPunch", "ZKTeco", "Fingerprint"],
		span: 4,
	},
	{
		icon: Landmark,
		categoryKey: msg`Banking`,
		descriptionKey: msg`Pay employees via ACH/NACHA, wire, or your bank's API.`,
		tools: ["ACH/NACHA", "Wire Transfer", "Bank API"],
		span: 4,
	},
	{
		icon: Mail,
		categoryKey: msg`Email`,
		descriptionKey: msg`Send payslips and notifications through your email provider.`,
		tools: ["Gmail", "Outlook", "Office 365"],
		span: 4,
	},
	{
		icon: MessageCircle,
		categoryKey: msg`Communication`,
		descriptionKey: msg`Notify teams and approve requests inside your chat workspace.`,
		tools: ["Slack", "MS Teams", "Discord"],
		span: 8,
	},
	{
		icon: Code2,
		categoryKey: msg`API & Custom`,
		descriptionKey: msg`Build custom integrations with our REST API and webhooks.`,
		tools: ["REST API", "Webhooks", "Custom connectors"],
		span: 4,
	},
];

export function Integrations() {
	const { i18n } = useLingui();

	return (
		<section className="relative py-20 px-4 bg-neutral-900 overflow-hidden">
			{/* Subtle blue glow behind content */}
			<div
				className="absolute inset-0 pointer-events-none"
				aria-hidden
				style={{
					background:
						"radial-gradient(ellipse 70% 50% at 50% 50%, rgba(59, 130, 246, 0.06) 0%, transparent 60%)",
				}}
			/>

			<div className="max-w-7xl mx-auto relative z-10">
				<SectionHeader
					text={i18n._(msg`Seamless Integration`)}
					icon={Workflow}
					className="mb-8"
				/>

				<div className="text-center mb-16">
					<h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
						{i18n._(msg`Integrates with Your Favorite Tools`)}
					</h2>
					<p className="text-gray-400 text-lg max-w-2xl mx-auto">
						{i18n._(msg`Connect Volta HR with the tools you already use. Seamless integration with accounting software, time clocks, and cloud storage.`)}
					</p>
				</div>

				{/* Bento-style grid: row1 7+5, row2 4+4+4, row3 8+4 */}
				<div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-12">
					{integrationCategories.map((item) => {
						const Icon = item.icon;
						const category = i18n._(item.categoryKey);
						const description = i18n._(item.descriptionKey);
						const spanClass =
							item.span === 12
								? "md:col-span-12"
								: item.span === 8
									? "md:col-span-8"
									: item.span === 7
										? "md:col-span-7"
										: item.span === 5
											? "md:col-span-5"
											: "md:col-span-4";
						return (
							<div
								key={category}
								className={`group relative rounded-2xl overflow-hidden ${spanClass}`}
							>
								{/* Always-visible soft glow inside card */}
								<div
									className="absolute inset-0 rounded-2xl opacity-100 transition-opacity duration-500"
									style={{
										background:
											"radial-gradient(ellipse 100% 80% at 50% -20%, rgba(59, 130, 246, 0.08) 0%, transparent 50%)",
									}}
									aria-hidden
								/>
								{/* Stronger glow on hover */}
								<div
									className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
									style={{
										background:
											"radial-gradient(ellipse 80% 80% at 50% 0%, rgba(59, 130, 246, 0.14) 0%, transparent 60%)",
									}}
									aria-hidden
								/>
								<div className="relative bg-white/[0.06] border border-white/10 rounded-2xl p-8 backdrop-blur-sm group-hover:bg-white/[0.08] group-hover:border-blue-500/40 transition-all duration-300 h-full">
									{/* Icon with always-visible glow */}
									<div className="relative inline-flex items-center justify-center w-14 h-14 rounded-xl mb-5">
										<div
											className="absolute -inset-1 rounded-2xl blur-md opacity-80 group-hover:opacity-100 transition-opacity duration-300"
											style={{
												background:
													"radial-gradient(circle at center, rgba(59, 130, 246, 0.35) 0%, transparent 70%)",
											}}
											aria-hidden
										/>
										<div className="relative flex items-center justify-center w-14 h-14 bg-blue-500/15 border border-blue-500/40 rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.15)] group-hover:bg-blue-500/20 group-hover:border-blue-500/50 group-hover:shadow-[0_0_28px_rgba(59,130,246,0.25)] transition-all duration-300">
											<Icon className="w-7 h-7 text-blue-400" />
										</div>
									</div>

									<h3 className="text-white font-semibold text-lg mb-2">
										{category}
									</h3>
									<p className="text-gray-400 text-sm leading-relaxed mb-4">
										{description}
									</p>
									<div className="flex flex-wrap gap-2">
										{item.tools.map((tool) => (
											<span
												key={tool}
												className="px-3 py-1.5 bg-blue-500/5 border border-blue-500/20 rounded-lg text-gray-300 text-sm hover:bg-blue-500/15 hover:border-blue-500/40 transition-all duration-200 cursor-default"
											>
												{tool}
											</span>
										))}
									</div>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</section>
	);
}
