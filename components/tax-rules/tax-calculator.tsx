'use client'

import { useState, useEffect } from 'react'
import { calculateAllTaxes, formatCurrency } from '@/lib/utils/tax-rules'
import type { CompanyTaxRule } from '@/lib/types/tax-rules'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Calculator } from 'lucide-react'

interface TaxCalculatorProps {
  taxRules: CompanyTaxRule[]
}

export function TaxCalculator({ taxRules }: TaxCalculatorProps) {
  const [grossSalary, setGrossSalary] = useState<number>(50000)
  const [calculation, setCalculation] = useState<ReturnType<typeof calculateAllTaxes> | null>(null)

  useEffect(() => {
    if (grossSalary > 0 && taxRules.length > 0) {
      const result = calculateAllTaxes(grossSalary, taxRules)
      setCalculation(result)
    } else {
      setCalculation(null)
    }
  }, [grossSalary, taxRules])

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          <CardTitle>Tax Calculator</CardTitle>
        </div>
        <CardDescription>
          Preview how taxes will be calculated for a given salary
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input */}
        <div className="space-y-2">
          <Label htmlFor="gross-salary">Gross Salary</Label>
          <Input
            id="gross-salary"
            type="number"
            step="0.01"
            min="0"
            value={grossSalary}
            onChange={(e) => setGrossSalary(parseFloat(e.target.value) || 0)}
            placeholder="Enter gross salary"
          />
        </div>

        {/* Results */}
        {calculation && (
          <div className="space-y-4">
            {/* Deductions Table */}
            {calculation.details.filter(d => d.isEmployeeContribution).length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Employee Deductions</h4>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tax</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {calculation.details
                        .filter(d => d.isEmployeeContribution)
                        .map((detail, index) => (
                          <TableRow key={index}>
                            <TableCell>{detail.taxName}</TableCell>
                            <TableCell className="font-mono text-sm">{detail.taxCode}</TableCell>
                            <TableCell className="text-right font-medium">
                              {formatCurrency(detail.amount)}
                            </TableCell>
                          </TableRow>
                        ))
                      }
                      <TableRow className="bg-muted/50 font-medium">
                        <TableCell colSpan={2}>Total Deductions</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(calculation.employeeDeductions)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {/* Employer Contributions */}
            {calculation.details.filter(d => d.isEmployerContribution).length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Employer Contributions</h4>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tax</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {calculation.details
                        .filter(d => d.isEmployerContribution)
                        .map((detail, index) => (
                          <TableRow key={index}>
                            <TableCell>{detail.taxName}</TableCell>
                            <TableCell className="font-mono text-sm">{detail.taxCode}</TableCell>
                            <TableCell className="text-right font-medium">
                              {formatCurrency(detail.amount)}
                            </TableCell>
                          </TableRow>
                        ))
                      }
                      <TableRow className="bg-muted/50 font-medium">
                        <TableCell colSpan={2}>Total Employer Cost</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(calculation.employerContributions)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {/* Summary */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Gross Salary</p>
                <p className="text-2xl font-bold">{formatCurrency(grossSalary)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Deductions</p>
                <p className="text-2xl font-bold text-destructive">
                  -{formatCurrency(calculation.employeeDeductions)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Net Salary</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(calculation.netSalary)}
                </p>
              </div>
            </div>

            {calculation.employerContributions > 0 && (
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Total Employer Cost</p>
                    <p className="text-xs text-muted-foreground">
                      Salary + employer contributions
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-lg px-3 py-1">
                    {formatCurrency(grossSalary + calculation.employerContributions)}
                  </Badge>
                </div>
              </div>
            )}
          </div>
        )}

        {taxRules.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No active tax rules configured
          </div>
        )}
      </CardContent>
    </Card>
  )
}
