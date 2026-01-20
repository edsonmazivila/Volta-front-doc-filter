'use client'

import { useState } from 'react'
import type { CompanyTaxRule } from '@/lib/types/tax-rules'
import { getTaxRuleStatus, formatRate, formatCurrency } from '@/lib/utils/tax-rules'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Edit, MoreVertical, Trash2, Power, PowerOff } from 'lucide-react'

interface TaxRulesTableProps {
  taxRules: CompanyTaxRule[]
  onEdit: (taxRule: CompanyTaxRule) => void
  onDelete: (taxRule: CompanyTaxRule) => void
  onToggleStatus: (taxRule: CompanyTaxRule) => void
  canManage: boolean
}

const STATUS_COLORS = {
  active: 'bg-green-500',
  inactive: 'bg-gray-500',
  expired: 'bg-red-500',
  pending: 'bg-yellow-500',
} as const

const STATUS_LABELS = {
  active: 'Active',
  inactive: 'Inactive',
  expired: 'Expired',
  pending: 'Pending',
} as const

const CATEGORY_LABELS = {
  social_security: 'Social Security',
  income_tax: 'Income Tax',
  payroll_tax: 'Payroll Tax',
  other: 'Other',
} as const

const CALCULATION_TYPE_LABELS = {
  percentage: 'Percentage',
  fixed_amount: 'Fixed Amount',
  progressive: 'Progressive',
  custom: 'Custom',
} as const

export function TaxRulesTable({
  taxRules,
  onEdit,
  onDelete,
  onToggleStatus,
  canManage,
}: TaxRulesTableProps) {
  const [sortBy, setSortBy] = useState<'priority' | 'tax_code'>('priority')

  const sortedTaxRules = [...taxRules].sort((a, b) => {
    if (sortBy === 'priority') {
      return a.priority - b.priority
    }
    return a.tax_code.localeCompare(b.tax_code)
  })

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {taxRules.length} tax {taxRules.length === 1 ? 'rule' : 'rules'}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortBy('priority')}
            disabled={sortBy === 'priority'}
          >
            Sort by Priority
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortBy('tax_code')}
            disabled={sortBy === 'tax_code'}
          >
            Sort by Code
          </Button>
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Tax Code</TableHead>
              <TableHead>Tax Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Rate/Amount</TableHead>
              <TableHead>Applied To</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Tax Year</TableHead>
              {canManage && <TableHead className="w-[50px]"></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTaxRules.length === 0 ? (
              <TableRow>
                <TableCell colSpan={canManage ? 10 : 9} className="text-center text-muted-foreground py-8">
                  No tax rules configured
                </TableCell>
              </TableRow>
            ) : (
              sortedTaxRules.map((taxRule) => {
                const status = getTaxRuleStatus(taxRule)
                return (
                  <TableRow key={taxRule.id}>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`${STATUS_COLORS[status]} text-white border-0`}
                      >
                        {STATUS_LABELS[status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{taxRule.tax_code}</TableCell>
                    <TableCell className="font-medium">{taxRule.tax_name}</TableCell>
                    <TableCell>
                      {taxRule.tax_category ? CATEGORY_LABELS[taxRule.tax_category] : '-'}
                    </TableCell>
                    <TableCell>
                      {CALCULATION_TYPE_LABELS[taxRule.calculation_type]}
                    </TableCell>
                    <TableCell>
                      {taxRule.calculation_type === 'percentage' && taxRule.rate
                        ? formatRate(taxRule.rate)
                        : taxRule.calculation_type === 'fixed_amount' && taxRule.fixed_amount
                        ? formatCurrency(taxRule.fixed_amount)
                        : taxRule.calculation_type === 'progressive'
                        ? `${taxRule.brackets?.length || 0} brackets`
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 text-xs">
                        {taxRule.is_employee_contribution && (
                          <Badge variant="secondary" className="w-fit">Employee</Badge>
                        )}
                        {taxRule.is_employer_contribution && (
                          <Badge variant="secondary" className="w-fit">Employer</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{taxRule.priority}</TableCell>
                    <TableCell>{taxRule.tax_year}</TableCell>
                    {canManage && (
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEdit(taxRule)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onToggleStatus(taxRule)}>
                              {taxRule.is_active ? (
                                <>
                                  <PowerOff className="mr-2 h-4 w-4" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <Power className="mr-2 h-4 w-4" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onDelete(taxRule)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
