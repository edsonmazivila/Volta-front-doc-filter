'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import type { Company } from '@/lib/types/organization'

interface DocumentsFiltersProps {
  companies: Company[]
}

export function DocumentsFilters({ companies }: DocumentsFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const currentCompany = searchParams.get('company') || 'all'
  const currentStatus = searchParams.get('status') || 'all'

  const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    const params = new URLSearchParams(searchParams.toString())
    
    if (value === 'all') {
      params.delete('company')
    } else {
      params.set('company', value)
    }
    
    router.push(`?${params.toString()}`)
  }

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    const params = new URLSearchParams(searchParams.toString())
    
    if (value === 'all') {
      params.delete('status')
    } else {
      params.set('status', value)
    }
    
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="flex gap-4">
      <div className="flex-1">
        <label className="text-sm font-medium mb-2 block">Company</label>
        <select 
          className="w-full px-3 py-2 border rounded-lg bg-background"
          value={currentCompany}
          onChange={handleCompanyChange}
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
          onChange={handleStatusChange}
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
    </div>
  )
}
