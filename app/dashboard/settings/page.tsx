import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { Card, CardHeader } from '@/components/dashboard/card'
import { Button } from '@/components/ui'

export default function SettingsPage() {
  return (
    <div className='min-h-dvh flex app-background'>
      <Sidebar />
      <main className='flex-1'>
        <Header title='Settings' />
        <section className='p-4 grid grid-cols-1 md:grid-cols-2 gap-4'>
          <Card>
            <CardHeader title='Company Profile' />
            <Button>Edit</Button>
          </Card>
          <Card>
            <CardHeader title='Payroll Settings' />
            <Button>Edit</Button>
          </Card>
          <Card>
            <CardHeader title='Users & Roles' />
            <Button>Manage</Button>
          </Card>
          <Card>
            <CardHeader title='Integrations' />
            <Button>Configure</Button>
          </Card>
        </section>
      </main>
    </div>
  )
}


