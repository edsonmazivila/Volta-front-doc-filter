import { useId } from 'react'

export function LineChartPlaceholder({ className = '' }: { className?: string }) {
  const id = useId()
  return (
    <svg className={className} viewBox='0 0 600 240' role='img' aria-labelledby={`title-${id} desc-${id}`}>
      <title id={`title-${id}`}>Payroll trend line chart</title>
      <desc id={`desc-${id}`}>Displays total payroll amounts across periods</desc>
      <defs>
        <linearGradient id={`g-${id}`} x1='0' x2='0' y1='0' y2='1'>
          <stop offset='0%' stopColor='rgba(59,130,246,0.65)' />
          <stop offset='100%' stopColor='rgba(59,130,246,0.0)' />
        </linearGradient>
        <linearGradient id={`g-dark-${id}`} x1='0' x2='0' y1='0' y2='1'>
          <stop offset='0%' stopColor='rgba(99,102,241,0.6)' />
          <stop offset='100%' stopColor='rgba(99,102,241,0.0)' />
        </linearGradient>
        <filter id={`blur-${id}`}> 
          <feGaussianBlur in='SourceGraphic' stdDeviation='3' />
        </filter>
      </defs>
      <rect x='0' y='0' width='600' height='240' fill='transparent' />
      <g className='hidden dark:block' aria-hidden='true'>
        <path d='M0 180 C 60 160, 120 100, 180 120 S 300 180, 360 140 480 120, 600 160' stroke='rgba(99,102,241,0.9)' strokeWidth='2' fill='none' filter={`url(#blur-${id})`} />
        <path d='M0 180 C 60 160, 120 100, 180 120 S 300 180, 360 140 480 120, 600 160' stroke='rgba(99,102,241,1)' strokeWidth='2' fill='none' />
        <path d='M0 240 L0 180 C 60 160, 120 100, 180 120 S 300 180, 360 140 480 120, 600 160 L600 240 Z' fill={`url(#g-dark-${id})`} />
      </g>
      <g className='dark:hidden' aria-hidden='true'>
        <path d='M0 180 C 60 160, 120 100, 180 120 S 300 180, 360 140 480 120, 600 160' stroke='rgba(59,130,246,0.6)' strokeWidth='2' fill='none' filter={`url(#blur-${id})`} />
        <path d='M0 180 C 60 160, 120 100, 180 120 S 300 180, 360 140 480 120, 600 160' stroke='rgba(59,130,246,1)' strokeWidth='2' fill='none' />
        <path d='M0 240 L0 180 C 60 160, 120 100, 180 120 S 300 180, 360 140 480 120, 600 160 L600 240 Z' fill={`url(#g-${id})`} />
      </g>
    </svg>
  )
}


