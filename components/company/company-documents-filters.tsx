'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import type { Company } from '@/lib/types/organization'

interface CompanyDocumentsFiltersProps {
  companies: Company[]
}

export function CompanyDocumentsFilters({ companies }: CompanyDocumentsFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const currentCompany = searchParams.get('company') || 'all'
  const currentType = searchParams.get('type') || 'all'

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

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    const params = new URLSearchParams(searchParams.toString())
    
    if (value === 'all') {
      params.delete('type')
    } else {
      params.set('type', value)
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
        <label className="text-sm font-medium mb-2 block">Document Type</label>
        <select 
          className="w-full px-3 py-2 border rounded-lg bg-background"
          value={currentType}
          onChange={handleTypeChange}
        >
          <option value="all">All Types</option>
          <option value="business_license">Business License</option>
          <option value="tax_certificate">Tax Certificate</option>
          <option value="insurance">Insurance</option>
          <option value="contract">Contract</option>
          <option value="other">Other</option>
        </select>
      </div>
    </div>
  )
}
