'use client'

import { Cloud } from 'lucide-react'

export function MultiCloudDiagram() {
	// Wider viewBox so diagram fills the long top card; nodes spread toward edges
	const vb = { w: 520, h: 208 }
	const cx = vb.w / 2
	const cy = vb.h / 2
	const edgeX = 75
	const farX = vb.w - 75
	const topY = 44
	const bottomY = vb.h - 44

	const NODES = [
		{ left: '50%', top: '50%', label: 'Any', size: 40 },
		{ left: `${(edgeX / vb.w) * 100}%`, top: `${(topY / vb.h) * 100}%`, label: 'AWS', size: 28 },
		{ left: `${(farX / vb.w) * 100}%`, top: `${(topY / vb.h) * 100}%`, label: 'GCP', size: 28 },
		{ left: `${(edgeX / vb.w) * 100}%`, top: `${(bottomY / vb.h) * 100}%`, label: 'K8s', size: 28 },
		{ left: `${(farX / vb.w) * 100}%`, top: `${(bottomY / vb.h) * 100}%`, label: 'Azure', size: 28 },
	]

	const linesWithArrow: [number, number, number, number][] = [
		[cx, cy, edgeX, topY],
		[cx, cy, farX, topY],
		[cx, cy, edgeX, bottomY],
		[cx, cy, farX, bottomY],
	]
	const linesNoArrow: [number, number, number, number][] = [
		[edgeX, topY, farX, topY],
		[edgeX, bottomY, farX, bottomY],
	]

	// Blue/indigo theme: glow and grid match icon color
	const bgGradient = 'linear-gradient(135deg, rgba(30, 58, 138, 0.35) 0%, rgba(49, 46, 129, 0.25) 40%, rgba(30, 58, 138, 0.2) 70%, rgba(30, 64, 175, 0.3) 100%)'
	const gridColor = 'rgba(147, 197, 253, 0.35)'
	const centerGlow = 'radial-gradient(ellipse 90% 70% at 50% 40%, rgba(59, 130, 246, 0.08) 0%, transparent 55%)'

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
			{/* Grid tinted with card theme (blue) */}
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
			{/* Diagram area: same aspect ratio as SVG viewBox so icons and lines share coordinates */}
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
							<marker id="multi-cloud-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
								<path d="M0,0 L6,3 L0,6 Z" fill="rgba(96, 165, 250, 0.95)" />
							</marker>
						</defs>
						{linesWithArrow.map(([x1, y1, x2, y2], i) => (
							<line
								key={`a-${i}`}
								x1={x1}
								y1={y1}
								x2={x2}
								y2={y2}
								stroke="rgba(96, 165, 250, 0.6)"
								strokeWidth="1.2"
								strokeDasharray="5 4"
								markerEnd="url(#multi-cloud-arrow)"
							/>
						))}
						{linesNoArrow.map(([x1, y1, x2, y2], i) => (
							<line
								key={`b-${i}`}
								x1={x1}
								y1={y1}
								x2={x2}
								y2={y2}
								stroke="rgba(96, 165, 250, 0.45)"
								strokeWidth="1.2"
								strokeDasharray="5 4"
							/>
						))}
					</svg>
					{/* Cloud icons + labels: same box as SVG so % positions match line endpoints */}
					<div className="absolute inset-0 pointer-events-none">
						{NODES.map((node, i) => (
							<div
								key={i}
								className="absolute flex flex-col items-center -translate-x-1/2 -translate-y-1/2"
								style={{ left: node.left, top: node.top }}
							>
								<Cloud
									className={i === 0 ? "text-blue-300 drop-shadow-[0_0_8px_rgba(96,165,250,0.6)]" : "text-blue-400/90 drop-shadow-[0_0_6px_rgba(96,165,250,0.4)]"}
									size={node.size}
									strokeWidth={1.5}
								/>
								<span className="mt-1.5 text-white text-[10px] font-medium whitespace-nowrap">
									{node.label}
								</span>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	)
}
