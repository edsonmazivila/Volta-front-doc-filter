"use client";

import { useLingui } from "@lingui/react";
import { msg } from "@lingui/core/macro";
import HomeHeader from "@/components/home-header";
import Footer from "@/components/footer";
import { FinalCTA } from "@/components/final-cta";
import {
	Users,
	Clock,
	DollarSign,
	FileText,
	Calendar,
	BarChart3,
	Shield,
	Building2,
	CheckCircle2,
	Sparkles,
} from "lucide-react";
import { SectionHeader } from "@/components/section-header";

export default function FeaturesPage() {
	const { i18n } = useLingui();

	const features = [
		{
			icon: Users,
			title: i18n._(msg`HR & People Management`),
			description: i18n._(msg`Centralize employee records, roles, documents, leave policies, and requests with tenant-safe access controls.`),
			features: [
				i18n._(msg`Employee profiles & documents`),
				i18n._(msg`Department hierarchies`),
				i18n._(msg`Role-based permissions`),
				i18n._(msg`Multi-company support`),
				i18n._(msg`Organizational structure`),
			],
		},
		{
			icon: Clock,
			title: i18n._(msg`Time & Attendance`),
			description: i18n._(msg`Track attendance, manage overtime, and streamline approvals with an intuitive, mobile-friendly experience.`),
			features: [
				i18n._(msg`One-click check-in/check-out`),
				i18n._(msg`Real-time attendance monitoring`),
				i18n._(msg`Absence justification workflows`),
				i18n._(msg`Overtime tracking`),
				i18n._(msg`CSV export for reporting`),
			],
		},
		{
			icon: DollarSign,
			title: i18n._(msg`Automated Payroll`),
			description: i18n._(msg`Automate calculations, taxes, and deductions. Export bank-ready files and paystubs with full audit trails.`),
			features: [
				i18n._(msg`Calculate payroll in seconds`),
				i18n._(msg`Automatic tax calculations`),
				i18n._(msg`Generate paystubs instantly`),
				i18n._(msg`Export to Excel/PDF/ACH formats`),
				i18n._(msg`Full audit trails`),
			],
		},
		{
			icon: Calendar,
			title: i18n._(msg`Leave Management`),
			description: i18n._(msg`Empower employees to request time off while managers maintain full visibility and control over team availability.`),
			features: [
				i18n._(msg`Leave request & approval flows`),
				i18n._(msg`Automatic balance tracking`),
				i18n._(msg`Multiple leave policies`),
				i18n._(msg`Team leave calendar`),
				i18n._(msg`Leave accrual automation`),
			],
		},
		{
			icon: FileText,
			title: i18n._(msg`Document Management`),
			description: i18n._(msg`Secure document storage with virus scanning, approval workflows, and role-based access control.`),
			features: [
				i18n._(msg`Virus-scanned uploads`),
				i18n._(msg`Company & employee documents`),
				i18n._(msg`Approval workflows`),
				i18n._(msg`Cloud or local storage (S3)`),
				i18n._(msg`Version control`),
			],
		},
		{
			icon: BarChart3,
			title: i18n._(msg`Reporting & Analytics`),
			description: i18n._(msg`Real-time dashboards and exports give you visibility into payroll, attendance, and costs across companies.`),
			features: [
				i18n._(msg`Payroll reports & registers`),
				i18n._(msg`Tax liability tracking`),
				i18n._(msg`Department cost analysis`),
				i18n._(msg`Export to PDF/Excel/CSV`),
				i18n._(msg`Predefined reports & dashboards`),
			],
		},
		{
			icon: Building2,
			title: i18n._(msg`Multi-Tenant Architecture`),
			description: i18n._(msg`Manage unlimited organizations and companies from a single platform with complete data isolation.`),
			features: [
				i18n._(msg`Unlimited organizations`),
				i18n._(msg`Complete data isolation`),
				i18n._(msg`Cross-company reporting`),
				i18n._(msg`Centralized administration`),
				i18n._(msg`Organization hierarchies`),
			],
		},
		{
			icon: Shield,
			title: i18n._(msg`Enterprise Security`),
			description: i18n._(msg`Bank-level security with SOC 2 certification, GDPR compliance, and multi-factor authentication.`),
			features: [
				i18n._(msg`SOC 2 Type II Certified`),
				i18n._(msg`GDPR Compliant`),
				i18n._(msg`SSL/TLS Encryption`),
				i18n._(msg`Multi-factor authentication`),
				i18n._(msg`Data encrypted at rest`),
			],
		},
	];

	return (
		<main className="bg-neutral-900 min-h-screen">
			<HomeHeader />

			<section className="py-20 px-4 pt-28">
				<div className="max-w-7xl mx-auto">
					<SectionHeader
						text={i18n._(msg`Features`)}
						icon={Sparkles}
						className="mb-8"
					/>

					{/* Hero */}
					<div className="text-center mb-16">
						<h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
							{i18n._(msg`Everything You Need to Manage Your Workforce`)}
						</h1>
						<p className="text-gray-400 text-lg max-w-3xl mx-auto">
							{i18n._(msg`One platform. Complete control. From hire to retire.`)}
						</p>
					</div>

					{/* Features Grid – same card style as Security/Integrations */}
					<h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-12">
						{i18n._(msg`Comprehensive Features`)}
					</h2>

					<div className="grid md:grid-cols-2 gap-8">
						{features.map((feature) => {
							const Icon = feature.icon;
							return (
								<div
									key={feature.title}
									className="group relative bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm hover:bg-white/10 hover:border-blue-500/50 transition-all duration-300"
								>
									<div className="inline-flex items-center justify-center w-14 h-14 bg-blue-500/10 border border-blue-500/30 rounded-xl mb-6 group-hover:bg-blue-500/20 transition-colors duration-300">
										<Icon className="w-7 h-7 text-blue-400" />
									</div>

									<h3 className="text-white font-bold text-2xl mb-3">
										{feature.title}
									</h3>
									<p className="text-gray-400 mb-6 leading-relaxed">
										{feature.description}
									</p>

									<ul className="space-y-3">
										{feature.features.map((item) => (
											<li
												key={item}
												className="flex items-start gap-3 text-gray-300"
											>
												<CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
												<span className="text-sm">{item}</span>
											</li>
										))}
									</ul>
								</div>
							);
						})}
					</div>
				</div>
			</section>

			<FinalCTA />

			<Footer />
		</main>
	);
}
