import { ReactNode } from 'react'

export function Card({ children, className = '' }: { children: ReactNode, className?: string }) {
  return (
    <div className={`glass rounded-xl p-4 ${className}`}>{children}</div>
  )
}

export function CardHeader({ title, action }: { title: string, action?: ReactNode }) {
  return (
    <div className='flex items-center justify-between mb-3'>
      <h2 className='text-sm font-medium'>{title}</h2>
      {action}
    </div>
  )
}

export function Stat({ label, value, trend }: { label: string, value: ReactNode, trend?: ReactNode }) {
  return (
    <div>
      <p className='text-sm muted-text'>{label}</p>
      <div className='flex items-baseline gap-2 mt-1'>
        <p className='text-2xl font-semibold'>{value}</p>
        {trend}
      </div>
    </div>
  )
}


