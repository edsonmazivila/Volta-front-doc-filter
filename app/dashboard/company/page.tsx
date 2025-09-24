import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { Card, CardHeader } from '@/components/dashboard/card'
import { Button } from '@/components/ui'

export default function CompanyPage() {
  return (
    <div className='min-h-dvh flex app-background'>
      <Sidebar />
      <main className='flex-1'>
        <Header title='Company Management' />
        <section className='p-4 grid grid-cols-1 md:grid-cols-2 gap-4'>
          <Card>
            <CardHeader title='Company Profile' />
            <Button>Edit</Button>
          </Card>
          <Card>
            <CardHeader title='Banking & Payments' />
            <Button>Configure</Button>
          </Card>
          <Card>
            <CardHeader title='Compliance & Tax' />
            <Button>Review</Button>
          </Card>
          <Card>
            <CardHeader title='Document Templates' />
            <Button>Manage</Button>
          </Card>
        </section>
      </main>
    </div>
  )
}


