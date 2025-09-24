import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { Card, CardHeader } from '@/components/dashboard/card'
import { Skeleton, Button } from '@/components/ui'
import Link from 'next/link'

export default function EmployeesPage() {
  return (
    <div className='min-h-dvh flex app-background'>
      <Sidebar />
      <main className='flex-1'>
        <Header title='Employees' />
        <section className='p-4 grid gap-4'>
          <div className='flex items-center justify-between'>
            <h2 className='text-sm font-medium'>Employee Management</h2>
            <Link href='/employees/new'><Button glow>Add Employee</Button></Link>
          </div>
          <Card>
            <CardHeader title='Directory' />
            <div className='overflow-auto'>
              <table className='w-full text-sm'>
                <thead className='text-left muted-text'>
                  <tr>
                    <th className='py-2 pr-4'>Name</th>
                    <th className='py-2 pr-4'>Role</th>
                    <th className='py-2 pr-4'>Status</th>
                    <th className='py-2 pr-4'>Department</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>
                      <td className='py-2 pr-4'><Skeleton className='h-5 w-48' /></td>
                      <td className='py-2 pr-4'><Skeleton className='h-5 w-24' /></td>
                      <td className='py-2 pr-4'><Skeleton className='h-5 w-20' /></td>
                      <td className='py-2 pr-4'><Skeleton className='h-5 w-28' /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </section>
      </main>
    </div>
  )
}


