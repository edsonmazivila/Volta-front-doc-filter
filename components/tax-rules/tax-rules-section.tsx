'use client'

import { useState, useEffect } from 'react'
import { useSession } from '@/components/auth/session-context'
import { getTaxRules, createTaxRule, updateTaxRule, deleteTaxRule, toggleTaxRuleStatus, createTaxBrackets } from '@/lib/services/tax-rules'
import type { CompanyTaxRule, CreateTaxRuleInput, CreateTaxBracketInput } from '@/lib/types/tax-rules'
import { canManageTaxRules } from '@/lib/rbac/tax-rules-permissions'
import { TaxRulesTable } from './tax-rules-table'
import { TaxRuleFormDialog } from './tax-rule-form-dialog'
import { TaxBracketsFormDialog } from './tax-brackets-form-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Plus, Loader2, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { useLingui } from '@lingui/react'
import { msg } from '@lingui/core/macro'

export function TaxRulesSection({ taxRules: initialTaxRules }: { taxRules: CompanyTaxRule[] }) {
  const { user } = useSession()
  const { i18n } = useLingui()
  const [taxRules, setTaxRules] = useState<CompanyTaxRule[]>(initialTaxRules)
  const [loading, setLoading] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showBracketsDialog, setShowBracketsDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedTaxRule, setSelectedTaxRule] = useState<CompanyTaxRule | null>(null)

  const userRole = user?.role || 'employee'
  const canManage = canManageTaxRules(userRole)

  // Carregar todas as tax rules ativas (de todos os anos)
  const loadTaxRules = async () => {  
    console.log('[TaxRulesSection] 🔄 Loading all active tax rules...')
    setLoading(true)
    try {
      const rules = await getTaxRules({ is_active: true })
      console.log('[TaxRulesSection] ✅ Loaded tax rules:', {
        count: rules.length,
        rules: rules.map(r => ({ id: r.id, code: r.tax_code, name: r.tax_name, year: r.tax_year, active: r.is_active }))
      })
      setTaxRules(rules)
    } catch (error) {
      console.error('[TaxRulesSection] ❌ Error loading tax rules:', error)
      toast.error(i18n._(msg`Failed to load tax rules`))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTaxRules()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Handlers
  const handleCreate = async (data: CreateTaxRuleInput) => {
    const result = await createTaxRule(data)
    
    console.log('[TaxRulesSection] Create result:', result)
    
    if (result.success) {
      setShowCreateDialog(false)
      toast.success(i18n._(msg`Tax rule created successfully`))
      
      console.log('[TaxRulesSection] Reloading tax rules...')
      await loadTaxRules()
      
      // Se for imposto progressivo, abrir dialog de brackets
      if (data.calculation_type === 'progressive' && result.data) {
        setSelectedTaxRule(result.data as CompanyTaxRule)
        setShowBracketsDialog(true)
      }
    } else {
      toast.error(result.errors?._form?.[0] || i18n._(msg`Failed to create tax rule`))
    }
  }

  const handleEdit = (taxRule: CompanyTaxRule) => {
    setSelectedTaxRule(taxRule)
    setShowEditDialog(true)
  }

  const handleUpdate = async (data: CreateTaxRuleInput) => {
    if (!selectedTaxRule) return

    const result = await updateTaxRule({ id: selectedTaxRule.id, ...data })
    
    if (result.success) {
      setShowEditDialog(false)
      setSelectedTaxRule(null)
      toast.success(i18n._(msg`Tax rule updated successfully`))
      await loadTaxRules()
    } else {
      toast.error(result.errors?._form?.[0] || i18n._(msg`Failed to update tax rule`))
    }
  }

  const handleDelete = (taxRule: CompanyTaxRule) => {
    setSelectedTaxRule(taxRule)
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    if (!selectedTaxRule) return

    const ruleName = selectedTaxRule.tax_name
    const ruleId = selectedTaxRule.id
    console.log('[TaxRulesSection] 🗑️ Deleting tax rule:', { id: ruleId, name: ruleName })
    
    const result = await deleteTaxRule(ruleId)
    
    console.log('[TaxRulesSection] 📥 Delete result:', result)
    
    setShowDeleteDialog(false)
    setSelectedTaxRule(null)
    
    if (result.success) {
      toast.success(`✅ Tax rule "${ruleName}" deleted successfully`)
      console.log('[TaxRulesSection] 🔄 Reloading tax rules after delete...')
      await loadTaxRules()
      console.log('[TaxRulesSection] ✅ Tax rules reloaded')
    } else {
      toast.error(result.errors?._form?.[0] || i18n._(msg`Failed to delete tax rule`))
    }
  }

  const handleToggleStatus = async (taxRule: CompanyTaxRule) => {
    const result = await toggleTaxRuleStatus(taxRule.id, !taxRule.is_active)
    
    if (result.success) {
      toast.success(i18n._(msg`Tax rule ${taxRule.is_active ? 'deactivated' : 'activated'}`))
      await loadTaxRules()
    } else {
      toast.error(result.errors?._form?.[0] || i18n._(msg`Failed to toggle tax rule status`))
    }
  }

  const handleCreateBrackets = async (brackets: CreateTaxBracketInput[]) => {
    if (!selectedTaxRule) return

    const result = await createTaxBrackets(selectedTaxRule.id, brackets)
    
    if (result.success) {
      setShowBracketsDialog(false)
      setSelectedTaxRule(null)
      toast.success(i18n._(msg`Tax brackets created successfully`))
      await loadTaxRules()
    } else {
      toast.error(result.errors?._form?.[0] || i18n._(msg`Failed to create tax brackets`))
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Tax Rules Management</CardTitle>
              <CardDescription>
                Configure dynamic tax rules for your company. These rules are automatically applied during payroll processing.
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={loadTaxRules}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>

              {canManage && (
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Tax Rule
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <TaxRulesTable
              taxRules={taxRules}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleStatus={handleToggleStatus}
              canManage={canManage}
            />
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <TaxRuleFormDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSubmit={handleCreate}
        defaultValues={{ tax_year: new Date().getFullYear() }}
      />

      {/* Edit Dialog */}
      {selectedTaxRule && (
        <TaxRuleFormDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          onSubmit={handleUpdate}
          defaultValues={{
            ...selectedTaxRule,
            rate: selectedTaxRule.rate ?? undefined,
            fixed_amount: selectedTaxRule.fixed_amount ?? undefined,
            wage_base_limit: selectedTaxRule.wage_base_limit ?? undefined,
            minimum_threshold: selectedTaxRule.minimum_threshold ?? undefined,
            end_date: selectedTaxRule.end_date ?? undefined,
          }}
          isEdit
        />
      )}

      {/* Brackets Dialog */}
      {selectedTaxRule && (
        <TaxBracketsFormDialog
          open={showBracketsDialog}
          onOpenChange={setShowBracketsDialog}
          onSubmit={handleCreateBrackets}
          taxRuleName={selectedTaxRule.tax_name}
          existingBrackets={selectedTaxRule.brackets?.map(b => ({
            bracket_order: b.bracket_order,
            min_income: b.min_income,
            max_income: b.max_income ?? undefined,
            rate: b.rate,
            base_tax_amount: b.base_tax_amount,
          }))}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tax Rule</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the tax rule <strong>{selectedTaxRule?.tax_name}</strong>? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedTaxRule(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
