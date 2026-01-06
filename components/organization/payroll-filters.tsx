'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Card } from '@/components/dashboard/card'

interface PayrollFiltersProps {
  companies: Array<{ id: string; name: string }>
}

export function PayrollFilters({ companies }: PayrollFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const currentCompany = searchParams.get('company') || 'all'
  const currentStatus = searchParams.get('status') || 'all'

  const handleCompanyChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'all') {
      params.delete('company')
    } else {
      params.set('company', value)
    }
    router.push(`?${params.toString()}`)
  }

  const handleStatusChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'all') {
      params.delete('status')
    } else {
      params.set('status', value)
    }
    router.push(`?${params.toString()}`)
  }

  return (
    <Card>
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="text-sm font-medium mb-2 block">Company</label>
          <select 
            className="w-full px-3 py-2 border rounded-lg bg-background"
            value={currentCompany}
            onChange={(e) => handleCompanyChange(e.target.value)}
          >
            <option value="all">All Companies</option>
            {companies.map(company => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="text-sm font-medium mb-2 block">Status</label>
          <select 
            className="w-full px-3 py-2 border rounded-lg bg-background"
            value={currentStatus}
            onChange={(e) => handleStatusChange(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="calculated">Calculated</option>
            <option value="processed">Processed</option>
          </select>
        </div>
      </div>
    </Card>
  )
}
