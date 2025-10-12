import { Header } from '@/components/dashboard/header'
import { Card, CardHeader } from '@/components/dashboard/card'
import { Button } from '@/components/ui'
import { requireRole } from '@/lib/rbac/server'

export default async function SettingsPage() {
  // Only system admins can access settings
  await requireRole(['system_admin','hr_manager','payroll_manager'])
  return (
    <>
      <Header title='Settings' />
      <section className='p-4 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto'>
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
    </>
  )
}


