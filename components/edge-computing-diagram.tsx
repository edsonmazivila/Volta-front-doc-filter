'use client'

import { User, Globe } from 'lucide-react'

/**
 * Edge Computing: "Closer to your users" – user at center, edge nodes (globe)
 * around with short dashed paths suggesting low latency and distributed deployment.
 */
export function EdgeComputingDiagram() {
	const vb = { w: 320, h: 180 }
	const cx = vb.w / 2
	const cy = vb.h / 2
	const nodeRadius = 52
	const angles = [0, 90, 180, 270]

	const nodePositions = angles.map((angle) => {
		const rad = (angle * Math.PI) / 180
		return {
			x: cx + nodeRadius * Math.cos(rad),
			y: cy + nodeRadius * Math.sin(rad),
			leftPct: ((cx + nodeRadius * Math.cos(rad)) / vb.w) * 100,
			topPct: ((cy + nodeRadius * Math.sin(rad)) / vb.h) * 100,
		}
	})

	// Blue theme to match other cards (same family as Multi-Cloud / Hybrid beam)
	const bgGradient = 'linear-gradient(135deg, rgba(30, 58, 138, 0.22) 0%, rgba(59, 130, 246, 0.2) 40%, rgba(37, 99, 235, 0.18) 70%, rgba(147, 197, 253, 0.15) 100%)'
	const gridColor = 'rgba(147, 197, 253, 0.28)'
	const centerGlow = 'radial-gradient(ellipse 90% 70% at 50% 50%, rgba(59, 130, 246, 0.08) 0%, transparent 55%)'

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
			{/* Diagram area: same aspect ratio as SVG so icons and lines align */}
			<div className="absolute inset-0 z-10 flex items-center justify-center">
				<div
					className="relative h-full max-w-full"
					style={{ aspectRatio: `${vb.w} / ${vb.h}` }}
				>
					<svg
						className="absolute inset-0 w-full h-full"
						viewBox={`0 0 ${vb.w} ${vb.h}`}
						preserveAspectRatio="xMidYMid meet"
						aria-hidden
					>
						<defs>
							<linearGradient id="edge-line" x1="0%" y1="0%" x2="100%" y2="0%">
								<stop offset="0%" stopColor="rgba(147,197,253,0.5)" />
								<stop offset="100%" stopColor="rgba(59,130,246,0.55)" />
							</linearGradient>
						</defs>
						{nodePositions.map((pos, i) => (
							<line
								key={i}
								x1={cx}
								y1={cy}
								x2={Math.round(pos.x * 100) / 100}
								y2={Math.round(pos.y * 100) / 100}
								stroke="url(#edge-line)"
								strokeWidth="1.5"
								strokeDasharray="4 3"
							/>
						))}
					</svg>
					{/* Center: user (your users) */}
					<div
						className="absolute flex items-center justify-center -translate-x-1/2 -translate-y-1/2"
						style={{ left: '50%', top: '50%' }}
					>
						<div className="rounded-2xl bg-black/20 border border-blue-400/20 p-2.5 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
							<User className="text-blue-300" size={36} strokeWidth={1.5} />
						</div>
					</div>
					{/* Edge nodes: globes */}
					{nodePositions.map((pos, i) => (
						<div
							key={i}
							className="absolute w-9 h-9 flex items-center justify-center -translate-x-1/2 -translate-y-1/2 rounded-xl bg-blue-500/10 border border-blue-400/25"
							style={{
								left: `${pos.leftPct}%`,
								top: `${pos.topPct}%`,
							}}
						>
							<Globe className="text-blue-300" size={18} strokeWidth={1.5} />
						</div>
					))}
				</div>
			</div>
		</div>
	)
}
