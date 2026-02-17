'use client'

import { Building2 } from 'lucide-react'

/**
 * On-Premises: "Within your perimeter" – one cohesive zone with building at center
 * and infrastructure nodes along the inner ring. More conceptual, less flowchart.
 */
export function OnPremisesDiagram() {
	const cx = 160
	const cy = 90
	const rings = [56, 72, 88]
	const nodeAngles = [0, 72, 144, 216, 288]

	// Indigo theme (blue family): glow and grid match infrastructure/on-prem
	const bgGradient = 'linear-gradient(135deg, rgba(49, 46, 129, 0.22) 0%, rgba(67, 56, 202, 0.25) 40%, rgba(79, 70, 229, 0.2) 70%, rgba(99, 102, 241, 0.18) 100%)'
	const gridColor = 'rgba(129, 140, 248, 0.28)'
	const centerGlow = 'radial-gradient(ellipse 85% 65% at 50% 50%, rgba(99, 102, 241, 0.09) 0%, transparent 55%)'

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
			{/* Single-frame "control zone" diagram */}
			<div className="absolute inset-0 z-10 flex items-center justify-center">
				<svg
					className="w-full h-full max-h-[180px] max-w-[320px]"
					viewBox="0 0 320 180"
					preserveAspectRatio="xMidYMid meet"
					aria-hidden
				>
					<defs>
						<linearGradient id="onprem-ring" x1="0%" y1="0%" x2="100%" y2="100%">
							<stop offset="0%" stopColor="rgba(129,140,248,0.25)" />
							<stop offset="50%" stopColor="rgba(99,102,241,0.4)" />
							<stop offset="100%" stopColor="rgba(79,70,229,0.2)" />
						</linearGradient>
						<filter id="onprem-glow" x="-30%" y="-30%" width="160%" height="160%">
							<feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
							<feMerge>
								<feMergeNode in="blur" />
								<feMergeNode in="SourceGraphic" />
							</feMerge>
						</filter>
					</defs>
					{/* Concentric rings = your perimeter / sovereignty boundary */}
					{rings.map((r, i) => (
						<circle
							key={r}
							cx={cx}
							cy={cy}
							r={r}
							fill="none"
							stroke="url(#onprem-ring)"
							strokeWidth={i === 0 ? 1.5 : 1}
							strokeDasharray={i === rings.length - 1 ? '4 6' : 'none'}
							opacity={0.6 - i * 0.12}
						/>
					))}
					{/* Small infrastructure nodes on the inner ring (mini server blocks, centered in circle) */}
					{nodeAngles.map((angle, i) => {
						const rad = (angle * Math.PI) / 180
						// Round to avoid server/client float mismatch and hydration errors
						const x = Math.round((cx + 48 * Math.cos(rad)) * 100) / 100
						const y = Math.round((cy + 48 * Math.sin(rad)) * 100) / 100
						// Rect stack: width 3, total height 13 (4+0.5+4+0.5+4); center at (-2.5, 1.5)
						const iconCenterX = 2.5
						const iconCenterY = -1.5
						return (
							<g key={i} transform={`translate(${x},${y})`} filter="url(#onprem-glow)">
								<circle
									cx={0}
									cy={0}
									r={12}
									fill="rgba(99,102,241,0.08)"
									stroke="rgba(129,140,248,0.35)"
									strokeWidth={1}
								/>
								<g transform={`translate(${iconCenterX},${iconCenterY})`}>
									<rect x={-4} y={-5} width={3} height={4} rx={0.5} fill="rgba(165,180,252,0.9)" />
									<rect x={-4} y={-0.5} width={3} height={4} rx={0.5} fill="rgba(129,140,248,0.85)" />
									<rect x={-4} y={4} width={3} height={4} rx={0.5} fill="rgba(99,102,241,0.8)" />
								</g>
							</g>
						)
					})}
				</svg>
				{/* Center: your premises */}
				<div
					className="absolute inset-0 flex items-center justify-center pointer-events-none"
					aria-hidden
				>
					<div className="rounded-2xl bg-black/20 border border-indigo-400/20 p-3 shadow-[0_0_24px_rgba(99,102,241,0.35)]">
						<Building2
							className="text-indigo-300"
							size={42}
							strokeWidth={1.5}
						/>
					</div>
				</div>
			</div>
		</div>
	)
}
