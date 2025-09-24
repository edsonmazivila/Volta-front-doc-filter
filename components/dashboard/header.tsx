import { ThemeToggle } from '@/components/dashboard/theme-toggle'
import { Button } from '@/components/ui'
import { Plus, Play, FileBarChart2 } from 'lucide-react'
import { SidebarTrigger } from '@/components/dashboard/sidebar'

export function Header({ title }: { title: string }) {
  return (
    <header className='sticky top-0 z-10 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='h-14 px-4 flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <SidebarTrigger />
          <h1 className='text-lg font-medium'>{title}</h1>
        </div>
        <div className='flex items-center gap-2'>
          <Button glow className='hidden sm:inline-flex'><Play size={16}/> Run payroll</Button>
          <Button className='hidden md:inline-flex'><FileBarChart2 size={16}/> Reports</Button>
          <Button><Plus size={16}/> Add</Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}


