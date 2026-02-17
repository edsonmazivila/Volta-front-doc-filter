'use client'

import { Cloud, Building2 } from 'lucide-react'

/**
 * Hybrid Deployment: "Best of both worlds" – cloud and on-prem connected by a
 * flowing bridge. Two zones with an interweaving path in the center.
 */
export function HybridDeploymentDiagram() {
	// Same blue as beam (Kubernetes section): blue-500 59,130,246
	const bgGradient = 'linear-gradient(135deg, rgba(30, 58, 138, 0.24) 0%, rgba(59, 130, 246, 0.22) 40%, rgba(37, 99, 235, 0.2) 70%, rgba(59, 130, 246, 0.18) 100%)'
	const gridColor = 'rgba(147, 197, 253, 0.28)'
	const centerGlow = 'radial-gradient(ellipse 90% 60% at 50% 50%, rgba(59, 130, 246, 0.08) 0%, transparent 55%)'

	return (
		<div
			className="w-full h-52 overflow-hidden relative"
			style={{
				maskImage: 'linear-gradient(to bottom, black 0%, black 60%, transparent 100%)',
				WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 60%, transparent 100%)',
				background: bgGradient,
			}}
		>
			<div className="absolute inset-0 z-0" style={{ background: centerGlow }} />
			<div
				className="absolute inset-0 z-0 opacity-[0.12]"
				style={{
					backgroundImage: `
						linear-gradient(${gridColor} 1px, transparent 1px),
						linear-gradient(90deg, ${gridColor} 1px, transparent 1px)
					`,
					backgroundSize: '56px 56px',
				}}
			/>
			{/* Two zones + flowing bridge */}
			<div className="absolute inset-0 z-10 flex items-center justify-center gap-4 px-4">
				{/* Cloud zone */}
				<div className="flex flex-col items-center flex-shrink-0">
					<div className="rounded-2xl bg-white/5 border border-blue-400/20 p-3.5 flex items-center justify-center drop-shadow-[0_0_12px_rgba(96,165,250,0.35)]">
						<Cloud className="text-blue-300" size={36} strokeWidth={1.5} />
					</div>
					<span className="mt-1.5 text-white/80 text-[9px] font-medium uppercase tracking-wider">Cloud</span>
				</div>
				{/* Flowing bridge: two interweaving paths */}
				<div className="flex-1 max-w-[140px] h-14 relative flex items-center justify-center">
					<svg
						className="absolute inset-0 w-full h-full"
						viewBox="0 0 140 56"
						preserveAspectRatio="xMidYMid meet"
						aria-hidden
					>
						<defs>
							<linearGradient id="hybrid-bridge-a" x1="0%" y1="0%" x2="100%" y2="50%">
								<stop offset="0%" stopColor="rgba(147,197,253,0.5)" />
								<stop offset="50%" stopColor="rgba(59,130,246,0.65)" />
								<stop offset="100%" stopColor="rgba(96,165,250,0.55)" />
							</linearGradient>
							<linearGradient id="hybrid-bridge-b" x1="0%" y1="100%" x2="100%" y2="50%">
								<stop offset="0%" stopColor="rgba(96,165,250,0.5)" />
								<stop offset="50%" stopColor="rgba(37,99,235,0.6)" />
								<stop offset="100%" stopColor="rgba(147,197,253,0.55)" />
							</linearGradient>
						</defs>
						{/* Two smooth curves that cross in the middle */}
						<path
							d="M 0 28 Q 35 8, 70 28 Q 105 48, 140 28"
							fill="none"
							stroke="url(#hybrid-bridge-a)"
							strokeWidth="2"
							strokeLinecap="round"
						/>
						<path
							d="M 0 28 Q 35 48, 70 28 Q 105 8, 140 28"
							fill="none"
							stroke="url(#hybrid-bridge-b)"
							strokeWidth="2"
							strokeLinecap="round"
						/>
					</svg>
				</div>
				{/* On-prem zone */}
				<div className="flex flex-col items-center flex-shrink-0">
					<div className="rounded-2xl bg-white/5 border border-indigo-400/20 p-3.5 flex items-center justify-center drop-shadow-[0_0_12px_rgba(99,102,241,0.3)]">
						<Building2 className="text-indigo-300" size={36} strokeWidth={1.5} />
					</div>
					<span className="mt-1.5 text-white/80 text-[9px] font-medium uppercase tracking-wider">On-prem</span>
				</div>
			</div>
		</div>
	)
}
