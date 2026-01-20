'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import type { CreateTaxRuleInput } from '@/lib/types/tax-rules'
import { validateTaxRule } from '@/lib/utils/tax-rules'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Loader2 } from 'lucide-react'

interface TaxRuleFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreateTaxRuleInput) => Promise<void>
  defaultValues?: Partial<CreateTaxRuleInput>
  isEdit?: boolean
}

const currentYear = new Date().getFullYear()

export function TaxRuleFormDialog({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
  isEdit = false,
}: TaxRuleFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  const form = useForm<CreateTaxRuleInput>({
    defaultValues: {
      tax_code: defaultValues?.tax_code || '',
      tax_name: defaultValues?.tax_name || '',
      tax_category: defaultValues?.tax_category || 'other',
      description: defaultValues?.description || '',
      is_employee_contribution: defaultValues?.is_employee_contribution ?? true,
      is_employer_contribution: defaultValues?.is_employer_contribution ?? false,
      calculation_type: defaultValues?.calculation_type || 'percentage',
      rate: defaultValues?.rate,
      fixed_amount: defaultValues?.fixed_amount,
      wage_base_limit: defaultValues?.wage_base_limit,
      minimum_threshold: defaultValues?.minimum_threshold,
      priority: defaultValues?.priority || 100,
      tax_year: defaultValues?.tax_year || currentYear,
      effective_date: defaultValues?.effective_date || `${currentYear}-01-01`,
      end_date: defaultValues?.end_date,
      is_active: defaultValues?.is_active ?? true,
    },
  })

  const calculationType = form.watch('calculation_type')

  const handleSubmit = async (data: CreateTaxRuleInput) => {
    // Normalizar dados antes de validar/enviar
    const normalizedData: CreateTaxRuleInput = {
      tax_code: data.tax_code,
      tax_name: data.tax_name,
      tax_category: data.tax_category || undefined,
      description: data.description || undefined,
      is_employee_contribution: Boolean(data.is_employee_contribution),
      is_employer_contribution: Boolean(data.is_employer_contribution),
      calculation_type: data.calculation_type,
      // Campos numéricos - converter e enviar undefined se vazio
      rate: data.rate !== undefined && data.rate !== null ? Number(data.rate) : undefined,
      fixed_amount: data.fixed_amount !== undefined && data.fixed_amount !== null ? Number(data.fixed_amount) : undefined,
      wage_base_limit: data.wage_base_limit !== undefined && data.wage_base_limit !== null ? Number(data.wage_base_limit) : undefined,
      minimum_threshold: data.minimum_threshold !== undefined && data.minimum_threshold !== null ? Number(data.minimum_threshold) : 0,
      priority: Number(data.priority),
      tax_year: Number(data.tax_year),
      // Datas em formato ISO 8601 com timezone
      effective_date: data.effective_date ? `${data.effective_date}T00:00:00Z` : `${currentYear}-01-01T00:00:00Z`,
      end_date: data.end_date && data.end_date.trim() !== '' ? `${data.end_date}T23:59:59Z` : undefined,
      is_active: data.is_active ?? true,
    }

    console.log('[Form] Normalized data:', normalizedData)

    // Validar antes de enviar
    const errors = validateTaxRule(normalizedData)
    if (errors.length > 0) {
      setValidationErrors(errors)
      return
    }

    setIsSubmitting(true)
    setValidationErrors([])

    try {
      await onSubmit(normalizedData)
      onOpenChange(false)
      form.reset()
    } catch (error) {
      console.error('Error submitting tax rule:', error)
      setValidationErrors(['An unexpected error occurred'])
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Tax Rule' : 'Create New Tax Rule'}</DialogTitle>
          <DialogDescription>
            Configure a tax rule for your company. The rule will be applied automatically during payroll processing.
          </DialogDescription>
        </DialogHeader>

        {validationErrors.length > 0 && (
          <div className="bg-destructive/10 border border-destructive rounded-md p-3">
            <p className="text-sm font-medium text-destructive mb-2">Validation Errors:</p>
            <ul className="list-disc list-inside text-sm text-destructive space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Basic Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="tax_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tax Code *</FormLabel>
                      <FormControl>
                        <Input placeholder="INSS_EMPLOYEE" {...field} />
                      </FormControl>
                      <FormDescription>Unique identifier (e.g., INSS_EMPLOYEE, IRPS)</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tax_category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="social_security">Social Security</SelectItem>
                          <SelectItem value="income_tax">Income Tax</SelectItem>
                          <SelectItem value="payroll_tax">Payroll Tax</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="tax_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tax Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="INSS Employee Contribution" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Optional description of this tax rule"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Contribution Type */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Who Pays?</h3>
              
              <div className="flex gap-6">
                <FormField
                  control={form.control}
                  name="is_employee_contribution"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Employee Contribution</FormLabel>
                        <FormDescription>Deducted from employee salary</FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_employer_contribution"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Employer Contribution</FormLabel>
                        <FormDescription>Paid by the company</FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Calculation Settings */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Calculation Settings</h3>
              
              <FormField
                control={form.control}
                name="calculation_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Calculation Type *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage</SelectItem>
                        <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
                        <SelectItem value="progressive">Progressive (with brackets)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {calculationType === 'percentage' && (
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="rate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rate (%) *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            placeholder="3"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                            value={field.value ?? ''}
                          />
                        </FormControl>
                        <FormDescription>Enter as percentage (e.g., 3 for 3%)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="wage_base_limit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Wage Base Limit</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="176100.00"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormDescription>Maximum taxable salary</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {calculationType === 'fixed_amount' && (
                <FormField
                  control={form.control}
                  name="fixed_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fixed Amount *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="100.00"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {calculationType === 'progressive' && (
                <div className="rounded-md border border-blue-200 bg-blue-50 p-4">
                  <p className="text-sm text-blue-900">
                    <strong>Progressive Tax:</strong> You will configure tax brackets after creating this rule.
                  </p>
                </div>
              )}

              <FormField
                control={form.control}
                name="minimum_threshold"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Threshold</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormDescription>Minimum salary to apply this tax</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Tax Year & Dates */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Validity Period</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="tax_year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tax Year *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="2000"
                          max="2100"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>Lower values execute first</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="effective_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Effective Date *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="end_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormDescription>Leave empty for no end date</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Active</FormLabel>
                      <FormDescription>
                        Only active rules are applied during payroll processing
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEdit ? 'Update' : 'Create'} Tax Rule
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
