import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type ButtonVariant = 'default' | 'primary' | 'ghost'

export function Button({ children, className = '', glow = false, variant = 'default', ...props }: { children: ReactNode, className?: string, glow?: boolean, variant?: ButtonVariant } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
	const variantClass =
		variant === 'primary'
			? 'btn-primary btn-pill'
			: variant === 'ghost'
				? 'btn-ghost btn-pill'
				: 'btn'

	return (
		<button className={cn(variantClass, glow && 'btn-glow', className)} {...props}>
			{children}
		</button>
	)
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton ${className}`} />
}


