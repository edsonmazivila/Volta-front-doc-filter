export { Button, buttonVariants } from '@/components/ui/button'

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`relative overflow-hidden rounded-md bg-[linear-gradient(90deg,rgba(255,255,255,.06),rgba(255,255,255,.12),rgba(255,255,255,.06))] bg-[length:200%_100%] animate-[shimmer_1.6s_infinite] ${className}`} />
}


