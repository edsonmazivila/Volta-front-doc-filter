"use client";

import { useLingui } from "@lingui/react";
import { msg } from "@lingui/core/macro";
import { Lock, Shield, Eye, Key, FileCheck, Database, ShieldCheck } from "lucide-react";
import { SectionHeader } from "@/components/section-header";

export function SecurityCompliance() {
	const { i18n } = useLingui();

	const badges: Array<{
		icon: typeof Shield;
		title: string;
		description: string;
		span: number;
		featured: boolean;
		fullWidthBanner?: boolean;
	}> = [
		{
			icon: Shield,
			title: "SOC 2 Type II Certified",
			description: i18n._(msg`Independently audited security controls`),
			span: 8,
			featured: true,
		},
		{
			icon: Lock,
			title: "GDPR Compliant",
			description: i18n._(msg`Full data protection compliance`),
			span: 4,
			featured: false,
		},
		{
			icon: Key,
			title: "SSL/TLS Encryption",
			description: i18n._(msg`Bank-level encryption in transit`),
			span: 4,
			featured: false,
		},
		{
			icon: Eye,
			title: "Multi-Factor Authentication",
			description: i18n._(msg`Enhanced account security with MFA/TOTP`),
			span: 4,
			featured: false,
		},
		{
			icon: FileCheck,
			title: "Regular Security Audits",
			description: i18n._(msg`Continuous security assessments`),
			span: 4,
			featured: false,
		},
		{
			icon: Database,
			title: "Data Encrypted at Rest",
			description: i18n._(msg`AES-256 encryption for stored data`),
			span: 12,
			featured: false,
			fullWidthBanner: true,
		},
	];

	return (
		<section className="relative py-24 px-4 bg-neutral-900 overflow-hidden">
			{/* Subtle grid pattern for depth */}
			<div
				className="absolute inset-0 pointer-events-none opacity-[0.03]"
				aria-hidden
				style={{
					backgroundImage: `
						linear-gradient(rgba(59, 130, 246, 0.4) 1px, transparent 1px),
						linear-gradient(90deg, rgba(59, 130, 246, 0.4) 1px, transparent 1px)
					`,
					backgroundSize: "48px 48px",
				}}
			/>
			{/* Stronger blue glow */}
			<div
				className="absolute inset-0 pointer-events-none"
				aria-hidden
				style={{
					background:
						"radial-gradient(ellipse 80% 60% at 50% 40%, rgba(59, 130, 246, 0.08) 0%, transparent 55%)",
				}}
			/>

			<div className="max-w-7xl mx-auto relative z-10">
				<SectionHeader
					text={i18n._(msg`Security & Compliance`)}
					icon={ShieldCheck}
					className="mb-8"
				/>

				<div className="text-center mb-16">
					<h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
						{i18n._(msg`Enterprise-Grade Security You Can Trust`)}
					</h2>
					<p className="text-gray-400 text-lg max-w-3xl mx-auto">
						{i18n._(msg`Your employee data is protected with bank-level security. Multi-tenant architecture ensures complete data isolation between organizations.`)}
					</p>
				</div>

				{/* Bento: row1 hero 8+4, row2 4+4+4, row3 banner 12 */}
				<div className="grid grid-cols-1 md:grid-cols-12 gap-6">
					{badges.map((badge) => {
						const Icon = badge.icon;
						const spanClass =
							badge.span === 12
								? "md:col-span-12"
								: badge.span === 8
									? "md:col-span-8"
									: badge.span === 5
										? "md:col-span-5"
										: "md:col-span-4";
						const isFeatured = badge.featured === true;
						const isBanner = badge.fullWidthBanner === true;

						return (
							<div
								key={badge.title}
								className={`group relative rounded-2xl overflow-hidden ${spanClass}`}
							>
								{/* Card glow */}
								<div
									className="absolute inset-0 rounded-2xl opacity-100 transition-opacity duration-500"
									style={{
										background:
											"radial-gradient(ellipse 100% 80% at 50% -20%, rgba(59, 130, 246, 0.08) 0%, transparent 50%)",
									}}
									aria-hidden
								/>
								<div
									className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
									style={{
										background:
											"radial-gradient(ellipse 80% 80% at 50% 0%, rgba(59, 130, 246, 0.14) 0%, transparent 60%)",
									}}
									aria-hidden
								/>

								{/* Featured card: top accent line */}
								{isFeatured && (
									<div
										className="absolute top-0 left-0 right-0 h-px rounded-t-2xl z-10"
										style={{
											background: "linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.6), transparent)",
										}}
										aria-hidden
									/>
								)}

								<div
									className={`relative border border-white/10 rounded-2xl backdrop-blur-sm group-hover:bg-white/[0.08] group-hover:border-blue-500/40 transition-all duration-300 h-full
										${isBanner ? "bg-white/[0.08] p-8 md:py-10 md:px-10" : "bg-white/[0.06] p-8"}
										${isBanner ? "md:flex md:items-center md:gap-10" : ""}
									`}
								>
									{/* Icon */}
									<div
										className={`relative inline-flex items-center justify-center rounded-xl mb-5
											${isFeatured ? "w-16 h-16 md:mb-6" : "w-14 h-14"}
											${isBanner ? "md:mb-0 md:flex-shrink-0 md:w-20 md:h-20" : ""}
										`}
									>
										<div
											className="absolute -inset-1 rounded-2xl blur-md opacity-80 group-hover:opacity-100 transition-opacity duration-300"
											style={{
												background:
													"radial-gradient(circle at center, rgba(59, 130, 246, 0.35) 0%, transparent 70%)",
											}}
											aria-hidden
										/>
										<div
											className={`relative flex items-center justify-center rounded-xl border border-blue-500/40 shadow-[0_0_20px_rgba(59,130,246,0.15)] group-hover:bg-blue-500/20 group-hover:border-blue-500/50 group-hover:shadow-[0_0_28px_rgba(59,130,246,0.25)] transition-all duration-300
												${isFeatured ? "w-16 h-16 bg-blue-500/15" : "w-14 h-14 bg-blue-500/15"}
												${isBanner ? "md:w-20 md:h-20 md:bg-blue-500/20" : ""}
											`}
										>
											<Icon
												className={`text-blue-400 ${isFeatured ? "w-8 h-8" : "w-7 h-7"} ${isBanner ? "md:w-10 md:h-10" : ""}`}
											/>
										</div>
									</div>

									<div className={isBanner ? "md:flex-1 md:min-w-0" : ""}>
										<h3
											className={`text-white font-semibold mb-2
												${isFeatured ? "text-xl md:text-2xl" : "text-lg"}
												${isBanner ? "md:text-2xl" : ""}
											`}
										>
											{badge.title}
										</h3>
										<p
											className={`text-gray-400 leading-relaxed ${isFeatured ? "text-base" : "text-sm"} ${isBanner ? "md:text-lg" : ""}`}
										>
											{badge.description}
										</p>
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
