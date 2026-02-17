"use client";

import Image from "next/image";
import { useLingui } from "@lingui/react";
import { msg } from "@lingui/core/macro";
import { Star, MessageSquareQuote, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { SectionHeader } from "@/components/section-header";

export function SocialProof() {
	const { i18n } = useLingui();
	const [activeIndex, setActiveIndex] = useState(0);

	const testimonials = [
		{
			quote: i18n._(msg`Volta HR reduced our payroll processing time from 3 days to 3 hours. The automated tax calculations alone saved us countless headaches.`),
			author: "Maria Santos",
			role: i18n._(msg`HR Director, AMuaga`),
			company: "https://amuaga-web.vercel.app/",
		},
		{
			quote: i18n._(msg`The leave management system is a game-changer. Employees love the self-service portal, and managers have complete visibility.`),
			author: "João Pereira",
			role: i18n._(msg`Operations Manager, JECH`),
			company: "https://jechengenharia.com/",
		},
		{
			quote: i18n._(msg`Multi-tenant architecture allows us to manage 5 different companies from one platform. Reporting across entities is seamless.`),
			author: "Fatima Abdul",
			role: i18n._(msg`Finance Controller, InfraForge`),
			company: "https://infraforge.io",
		},
	];

	const stats = [
		{ value: 2500, suffix: "+", label: i18n._(msg`Employees Managed`) },
		{ value: 99.5, suffix: "%", label: i18n._(msg`Uptime Guaranteed`) },
		{ value: 60, suffix: "%", label: i18n._(msg`Reduction in HR Admin Time`) },
		{ value: 100, suffix: "%", label: i18n._(msg`Tax Compliance`) },
	];

	const goPrev = () => setActiveIndex((i) => (i - 1 + testimonials.length) % testimonials.length);
	const goNext = () => setActiveIndex((i) => (i + 1) % testimonials.length);

	return (
		<section
			id="testimonials"
			className="relative py-20 px-4 overflow-x-hidden"
		>
			{/* Grid + blue glow – starts below badge/title so they sit above it */}
			<div
				className="absolute top-44 bottom-0 left-1/2 -translate-x-1/2 w-screen max-w-none pointer-events-none"
				style={{
					maskImage: "linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)",
					WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)",
				}}
			>
				<Image
					src="/grid-testimonials.png"
					alt=""
					fill
					className="object-cover object-center"
					sizes="100vw"
					priority
				/>
			</div>
			<div className="max-w-7xl mx-auto relative z-10">
				<SectionHeader
					text={i18n._(msg`Testimonials`)}
					icon={MessageSquareQuote}
					className="mb-8"
				/>

				<h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-10">
					{i18n._(msg`Trusted by Forward-Thinking Companies`)}
				</h2>
			</div>

			{/* Carousel: masked area (card) + mobile arrows outside mask so they're visible above glow */}
			<div className="relative flex flex-col mb-16 -mx-4 w-[calc(100%+2rem)] max-w-none">
				<div
					className="relative min-h-[380px] overflow-visible"
					style={{
						maskImage: "linear-gradient(to bottom, black 0%, black 65%, transparent 100%)",
						WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 65%, transparent 100%)",
					}}
				>
					<div className="relative flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 min-h-[380px] px-2 md:px-4">
					{/* Desktop: arrows on sides */}
					<button
						type="button"
						onClick={goPrev}
						className="hidden md:flex flex-shrink-0 w-12 h-12 rounded-full bg-white/5 border border-white/10 items-center justify-center text-white hover:bg-blue-500/20 hover:border-blue-500/40 transition-all duration-300 z-30"
						aria-label={i18n._(msg`Previous testimonial`)}
					>
						<ChevronLeft className="w-6 h-6" />
					</button>

					<div className="relative w-full max-w-4xl min-h-[320px] md:min-h-[340px] flex items-end justify-center overflow-visible self-end min-w-0 px-0">
						{testimonials.map((testimonial, index) => {
							const offset = (index - activeIndex + testimonials.length) % testimonials.length;
							const normalizedOffset = offset > testimonials.length / 2 ? offset - testimonials.length : offset;
							const isActive = index === activeIndex;
							const isLeft = normalizedOffset < 0;
							const isRight = normalizedOffset > 0;

							return (
								<div
									key={testimonial.author}
									className="absolute inset-0 flex items-end justify-center px-1 md:px-4"
									style={{
										transform: `translateX(${normalizedOffset * 100}%)`,
										zIndex: isActive ? 20 : 10,
									}}
								>
									<div
										className={`
											relative w-full max-w-xl min-h-[300px] md:min-h-[340px] overflow-hidden transition-all duration-500 ease-out
											${isActive
												? "scale-100 opacity-100 blur-0 shadow-[0_0_20px_rgba(59,130,246,0.1)] rounded-2xl"
												: "scale-95 opacity-50 blur-sm pointer-events-none"
											}
										`}
									>
										{/* Card frame */}
										<Image
											src="/card-testimonials.png"
											alt=""
											width={672}
											height={380}
											className="absolute inset-0 w-full h-full object-cover object-top rounded-md"
										/>
										{/* Content over card body (below visual header) */}
										<div className="relative pt-[18%] px-4 md:px-8 pb-6 md:pb-8">
											<div className="flex gap-1 mb-4">
												{Array.from({ length: 5 }).map((_, i) => (
													<Star
														key={`${testimonial.author}-star-${i}`}
														className={`w-5 h-5 ${isActive ? "fill-blue-400/80 text-blue-400/80" : "fill-white/30 text-white/30"}`}
													/>
												))}
											</div>

											<blockquote className="text-gray-300 text-base md:text-lg leading-relaxed mb-6">
												&ldquo;{testimonial.quote}&rdquo;
											</blockquote>

											<div className="border-t border-white/10 pt-4">
												<p className="text-white font-semibold">{testimonial.author}</p>
												<p className="text-gray-400 text-sm">{testimonial.role}</p>
											</div>
										</div>
									</div>
								</div>
							);
						})}
					</div>

					<button
						type="button"
						onClick={goNext}
						className="hidden md:flex flex-shrink-0 w-12 h-12 rounded-full bg-white/5 border border-white/10 items-center justify-center text-white hover:bg-blue-500/20 hover:border-blue-500/40 transition-all duration-300 z-30"
						aria-label={i18n._(msg`Next testimonial`)}
					>
						<ChevronRight className="w-6 h-6" />
					</button>
					</div>
				</div>

				{/* Mobile: arrows below card, outside mask so they stay visible above glow */}
				<div className="flex md:hidden justify-center gap-6 pt-4 relative z-20">
					<button
						type="button"
						onClick={goPrev}
						className="flex-shrink-0 w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-blue-500/20 hover:border-blue-500/40 transition-all duration-300"
						aria-label={i18n._(msg`Previous testimonial`)}
					>
						<ChevronLeft className="w-6 h-6" />
					</button>
					<button
						type="button"
						onClick={goNext}
						className="flex-shrink-0 w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-blue-500/20 hover:border-blue-500/40 transition-all duration-300"
						aria-label={i18n._(msg`Next testimonial`)}
					>
						<ChevronRight className="w-6 h-6" />
					</button>
				</div>
			</div>

			<div className="max-w-7xl mx-auto relative z-10 px-4">
				{/* Dots – outside masked area so they're always visible */}
				<div className="flex justify-center gap-2 mb-12">
					{testimonials.map((_, index) => (
						<button
							key={index}
							type="button"
							onClick={() => setActiveIndex(index)}
							className={`w-2 h-2 rounded-full transition-all duration-300 ${index === activeIndex ? "bg-blue-400 w-6" : "bg-white/30 hover:bg-white/50"}`}
							aria-label={i18n._(msg`Go to testimonial ${index + 1}`)}
						/>
					))}
				</div>

				{/* Stats – below the grid, not inside it */}
				<div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20">
					{stats.map((stat) => (
						<AnimatedStat
							key={stat.label}
							value={stat.value}
							suffix={stat.suffix}
							label={stat.label}
						/>
					))}
				</div>
			</div>
		</section>
	);
}

function AnimatedStat({ value, suffix, label }: Readonly<{ value: number; suffix: string; label: string }>) {
	const [count, setCount] = useState(0);
	const [isVisible, setIsVisible] = useState(false);
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setIsVisible(true);
				}
			},
			{ threshold: 0.3 }
		);

		if (ref.current) {
			observer.observe(ref.current);
		}

		return () => observer.disconnect();
	}, []);

	useEffect(() => {
		if (!isVisible) return;

		const duration = 2000;
		const steps = 60;
		const increment = value / steps;
		const stepDuration = duration / steps;

		let currentStep = 0;
		const timer = setInterval(() => {
			currentStep++;
			if (currentStep <= steps) {
				setCount(Math.min(increment * currentStep, value));
			} else {
				clearInterval(timer);
				setCount(value);
			}
		}, stepDuration);

		return () => clearInterval(timer);
	}, [isVisible, value]);

	const formatNumber = (num: number) => {
		if (suffix === "+") {
			return Math.floor(num).toLocaleString();
		}
		return num.toFixed(1);
	};

	return (
		<div ref={ref} className="text-center">
			<div className="text-4xl md:text-5xl font-bold text-blue-400 mb-2">
				{formatNumber(count)}{suffix}
			</div>
			<div className="text-gray-400 text-sm md:text-base">
				{label}
			</div>
		</div>
	);
}
