import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { Card, CardHeader } from '@/components/dashboard/card'
import { LineChartPlaceholder } from '@/components/dashboard/line-chart'
import { Button } from '@/components/ui'

export default function ReportsPage() {
  return (
    <div className='min-h-dvh flex app-background'>
      <Sidebar />
      <main className='flex-1'>
        <Header title='Reports & Analytics' />
        <section className='p-4 grid gap-4'>
          <div className='flex items-center justify-between'>
            <h2 className='text-sm font-medium'>Overview</h2>
            <Button>Export</Button>
          </div>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
            <Card className='p-0 overflow-hidden'>
              <div className='p-4'><CardHeader title='Payroll Totals' /></div>
              <div className='px-2 pb-2'><LineChartPlaceholder className='w-full h-[300px]' /></div>
            </Card>
            <Card className='p-0 overflow-hidden'>
              <div className='p-4'><CardHeader title='Headcount Trend' /></div>
              <div className='px-2 pb-2'><LineChartPlaceholder className='w-full h-[300px]' /></div>
            </Card>
          </div>
        </section>
      </main>
    </div>
  )
}


