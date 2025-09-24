"use client"
import React from "react"

// A lightweight animated flow to visualize automated payroll steps
// Uses pure Tailwind CSS utilities and simple CSS keyframes

export function AutomatedPayrollFlow() {
	return (
		<div className="relative mx-auto mt-6 w-[520px] max-w-full">
			{/* Path line */}
			<div className="absolute left-1/2 top-0 h-[220px] w-px -translate-x-1/2 bg-gradient-to-b from-emerald-300/40 via-sky-300/40 to-transparent" />

			<div className="relative grid grid-cols-3 gap-4">
				{/* Step 1: Calculate */}
				<div className="col-span-3 flex items-center justify-between rounded-xl border border-black/5 bg-white/70 p-4 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-white/5">
					<div className="flex items-center gap-3">
						<div className="flex h-9 w-9 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/30">Σ</div>
						<div>
							<p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">Calculate</p>
							<p className="text-xs text-neutral-500 dark:text-neutral-400">Gross, benefits, deductions</p>
						</div>
					</div>
					<div className="relative">
						<span className="absolute right-0 top-1/2 hidden -translate-y-1/2 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 ring-1 ring-emerald-500/30 sm:inline">auto</span>
					</div>
				</div>

				{/* Step 2: Taxes */}
				<div className="col-span-2 rounded-xl border border-black/5 bg-white/70 p-4 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-white/5">
					<div className="flex items-center gap-3">
						<div className="flex h-9 w-9 items-center justify-center rounded-md bg-sky-500/10 text-sky-500 ring-1 ring-sky-500/30">%</div>
						<div>
							<p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">Taxes & Statutory</p>
							<p className="text-xs text-neutral-500 dark:text-neutral-400">PAYE, NSSF, NHIF</p>
						</div>
					</div>
				</div>
				<div className="col-span-1 rounded-xl border border-black/5 bg-white/70 p-4 text-right shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-white/5">
					<p className="text-xs text-neutral-500 dark:text-neutral-400">Cycle</p>
					<p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">Monthly</p>
				</div>

				{/* Step 3: Bank File */}
				<div className="col-span-2 rounded-xl border border-black/5 bg-white/70 p-4 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-white/5">
					<div className="flex items-center gap-3">
						<div className="flex h-9 w-9 items-center justify-center rounded-md bg-indigo-500/10 text-indigo-500 ring-1 ring-indigo-500/30">₿</div>
						<div>
							<p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">Bank File & Paystubs</p>
							<p className="text-xs text-neutral-500 dark:text-neutral-400">CSV/ACH + PDF stubs</p>
						</div>
					</div>
				</div>
				<div className="col-span-1 rounded-xl border border-black/5 bg-white/70 p-4 text-right shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-white/5">
					<p className="text-xs text-neutral-500 dark:text-neutral-400">Status</p>
					<p className="text-sm font-semibold text-emerald-600">Ready</p>
				</div>
			</div>

			{/* Animated dot moving down the path */}
			<div className="pointer-events-none absolute left-1/2 top-2 -translate-x-1/2">
				<span className="block h-2 w-2 animate-[flow_3s_linear_infinite] rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(16,185,129,0.15)]" />
			</div>

			<style jsx>{`
				@keyframes flow {
					0% { transform: translate(-50%, 0); opacity: .8 }
					30% { transform: translate(-50%, 70px); opacity: 1 }
					60% { transform: translate(-50%, 150px); opacity: 1 }
					100% { transform: translate(-50%, 210px); opacity: .9 }
				}
			`}</style>
		</div>
	)
}

export default AutomatedPayrollFlow


