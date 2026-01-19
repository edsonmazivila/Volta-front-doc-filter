'use client'

import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import type { CreateTaxBracketInput } from '@/lib/types/tax-rules'
import { validateTaxBrackets, formatCurrency, formatRate } from '@/lib/utils/tax-rules'
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
  FormField,
  FormItem,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/card'

interface TaxBracketsFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (brackets: CreateTaxBracketInput[]) => Promise<void>
  taxRuleName: string
  existingBrackets?: CreateTaxBracketInput[]
}

export function TaxBracketsFormDialog({
  open,
  onOpenChange,
  onSubmit,
  taxRuleName,
  existingBrackets = [],
}: TaxBracketsFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  const form = useForm<{ brackets: CreateTaxBracketInput[] }>({
    defaultValues: {
      brackets: existingBrackets.length > 0 
        ? existingBrackets 
        : [
            {
              bracket_order: 1,
              min_income: 0,
              max_income: 100000,
              rate: 0.10,
              base_tax_amount: 0,
            },
          ],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'brackets',
  })

  const handleAddBracket = () => {
    const lastBracket = fields[fields.length - 1]
    const newBracket: CreateTaxBracketInput = {
      bracket_order: fields.length + 1,
      min_income: lastBracket?.max_income || 0,
      max_income: (lastBracket?.max_income || 0) + 100000,
      rate: 0.15,
      base_tax_amount: 0, // User will need to calculate this
    }
    append(newBracket)
  }

  const handleSubmit = async (data: { brackets: CreateTaxBracketInput[] }) => {
    const errors = validateTaxBrackets(data.brackets)
    if (errors.length > 0) {
      setValidationErrors(errors)
      return
    }

    setIsSubmitting(true)
    setValidationErrors([])

    try {
      await onSubmit(data.brackets)
      onOpenChange(false)
      form.reset()
    } catch (error) {
      console.error('Error submitting tax brackets:', error)
      setValidationErrors(['An unexpected error occurred'])
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configure Tax Brackets</DialogTitle>
          <DialogDescription>
            Set up progressive tax brackets for <strong>{taxRuleName}</strong>
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

        <Card className="p-4 bg-muted/50">
          <h4 className="text-sm font-medium mb-2">📋 How Progressive Tax Works:</h4>
          <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
            <li><strong>Bracket Order:</strong> Sequential order (1, 2, 3...)</li>
            <li><strong>Min/Max Income:</strong> Income range for this bracket</li>
            <li><strong>Rate:</strong> Tax rate applied to income within this bracket</li>
            <li><strong>Base Tax Amount:</strong> Accumulated tax from previous brackets</li>
            <li><strong>Last Bracket:</strong> Set Max Income to &quot;unlimited&quot; by leaving empty or setting very high value</li>
          </ul>
        </Card>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Order</TableHead>
                    <TableHead>Min Income</TableHead>
                    <TableHead>Max Income</TableHead>
                    <TableHead>Rate (%)</TableHead>
                    <TableHead>Base Tax</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field, index) => (
                    <TableRow key={field.id}>
                      <TableCell>
                        <FormField
                          control={form.control}
                          name={`brackets.${index}.bracket_order`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="1"
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                                  className="w-16"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <FormField
                          control={form.control}
                          name={`brackets.${index}.min_income`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                  className="w-full"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <FormField
                          control={form.control}
                          name={`brackets.${index}.max_income`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  placeholder="Unlimited"
                                  {...field}
                                  onChange={(e) => {
                                    const val = e.target.value
                                    field.onChange(val ? parseFloat(val) : null)
                                  }}
                                  value={field.value ?? ''}
                                  className="w-full"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <FormField
                          control={form.control}
                          name={`brackets.${index}.rate`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  max="100"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) / 100)}
                                  value={field.value ? field.value * 100 : ''}
                                  className="w-20"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <FormField
                          control={form.control}
                          name={`brackets.${index}.base_tax_amount`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                  className="w-full"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => remove(index)}
                          disabled={fields.length === 1}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleAddBracket}
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Bracket
            </Button>

            {/* Preview */}
            {fields.length > 0 && (
              <Card className="p-4">
                <h4 className="text-sm font-medium mb-3">Preview</h4>
                <div className="space-y-2 text-sm">
                  {fields.map((_, index) => {
                    const bracket = form.watch(`brackets.${index}`)
                    return (
                      <div key={index} className="flex items-center justify-between border-b pb-2 last:border-0">
                        <div>
                          <span className="font-medium">Bracket {bracket.bracket_order}:</span>{' '}
                          {formatCurrency(bracket.min_income)} - {' '}
                          {bracket.max_income ? formatCurrency(bracket.max_income) : 'Unlimited'}
                        </div>
                        <div className="text-right">
                          <span className="font-medium">{formatRate(bracket.rate)}</span>
                          {bracket.base_tax_amount > 0 && (
                            <span className="text-xs text-muted-foreground ml-2">
                              (+ {formatCurrency(bracket.base_tax_amount)} base)
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </Card>
            )}

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
                Save Brackets
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
