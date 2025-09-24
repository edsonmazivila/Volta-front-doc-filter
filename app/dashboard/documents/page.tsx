import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { Card, CardHeader } from '@/components/dashboard/card'
import { Button, Skeleton } from '@/components/ui'

export default function DocumentsPage() {
  return (
    <div className='min-h-dvh flex app-background'>
      <Sidebar />
      <main className='flex-1'>
        <Header title='Documents' />
        <section className='p-4 grid gap-4'>
          <div className='flex items-center justify-between'>
            <h2 className='text-sm font-medium'>Company Documents</h2>
            <Button>Upload</Button>
          </div>
          <Card>
            <CardHeader title='Library' />
            <div className='space-y-2'>
              {Array.from({ length: 6 }).map((_, i) => (<Skeleton key={i} className='h-10' />))}
            </div>
          </Card>
        </section>
      </main>
    </div>
  )
}


