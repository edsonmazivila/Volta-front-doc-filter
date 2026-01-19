'use server'

import { cache } from 'react'
import { revalidateEntityMutation, CacheTags } from '@/lib/cache-utils'
import { getAuthCookieHeader } from '@/lib/auth/server-utils'
import { API_BASE_URL } from '@/lib/config'
import type {
  CompanyTaxRule,
  TaxRulesListResponse,
  TaxRuleResponse,
  TaxBracketsResponse,
  CreateTaxRuleInput,
  UpdateTaxRuleInput,
  CreateTaxBracketInput,
  TaxRulesFilter,
  TaxRuleActionResult,
} from '@/lib/types/tax-rules'

// ============================================================================
// Cache Tags
// ============================================================================

const TAX_RULES_TAG = CacheTags.TAX_RULES

// ============================================================================
// READ Operations (Cached)
// ============================================================================

/**
 * Listar impostos da empresa com filtros opcionais
 * @param filters - Filtros para buscar impostos (tax_year, is_active, etc.)
 */
export async function getTaxRules(filters?: TaxRulesFilter): Promise<CompanyTaxRule[]> {
  try {
    const cookieHeader = await getAuthCookieHeader()
    
    console.log('[getTaxRules] 🔍 Filters received:', filters)
    
    // Construir query params
    const params = new URLSearchParams()
    if (filters?.tax_year) params.append('tax_year', filters.tax_year.toString())
    if (filters?.is_active !== undefined) {
      console.log('[getTaxRules] ✅ Adding is_active filter:', filters.is_active)
      params.append('is_active', filters.is_active.toString())
    }
    if (filters?.tax_category) params.append('tax_category', filters.tax_category)
    if (filters?.calculation_type) params.append('calculation_type', filters.calculation_type)
    if (filters?.tax_code) params.append('tax_code', filters.tax_code)
    
    // Add cache-busting timestamp to ensure fresh data after mutations
    params.append('_t', Date.now().toString())
    
    const queryString = params.toString()
    const url = `${API_BASE_URL}/api/tax-rules${queryString ? `?${queryString}` : ''}`
    
    console.log('[getTaxRules] 📤 Fetching from:', url)
    
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
      cache: 'no-store', // Disable Next.js cache to prevent stale data
    })

    console.log('[getTaxRules] 📥 Response:', { status: res.status, ok: res.ok })

    if (!res.ok) {
      console.warn(`[getTaxRules] Failed to fetch tax rules: ${res.status}`)
      return []
    }

    const json: TaxRulesListResponse = await res.json()
    console.log('[getTaxRules] 📦 Data received:', {
      success: json.success,
      count: json.count,
      tax_rules_length: json.tax_rules?.length || 0,
      tax_rules_is_null: json.tax_rules === null,
      tax_year: json.tax_year
    })
    return json.tax_rules || []
  } catch (error) {
    console.error('[getTaxRules] Error fetching tax rules:', error)
    return []
  }
}

/**
 * Buscar um imposto específico por ID
 * @param id - ID do imposto
 */
export const getTaxRuleById = cache(async (id: string): Promise<CompanyTaxRule | null> => {
  try {
    const cookieHeader = await getAuthCookieHeader()
    
    const res = await fetch(`${API_BASE_URL}/api/tax-rules/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
      next: { tags: [`${TAX_RULES_TAG}-${id}`], revalidate: 60 },
    })

    if (!res.ok) {
      console.warn(`[getTaxRuleById] Failed to fetch tax rule: ${res.status}`)
      return null
    }

    const json: TaxRuleResponse = await res.json()
    return json.data || null
  } catch (error) {
    console.error('[getTaxRuleById] Error fetching tax rule:', error)
    return null
  }
})

/**
 * Buscar faixas de um imposto progressivo
 * @param taxRuleId - ID do imposto
 */
export const getTaxBrackets = cache(async (taxRuleId: string) => {
  try {
    const cookieHeader = await getAuthCookieHeader()
    
    const res = await fetch(`${API_BASE_URL}/api/tax-rules/${taxRuleId}/brackets`, {
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
      next: { tags: [`${TAX_RULES_TAG}-${taxRuleId}-brackets`], revalidate: 60 },
    })

    if (!res.ok) {
      console.warn(`[getTaxBrackets] Failed to fetch tax brackets: ${res.status}`)
      return []
    }

    const json: TaxBracketsResponse = await res.json()
    return json.data || []
  } catch (error) {
    console.error('[getTaxBrackets] Error fetching tax brackets:', error)
    return []
  }
})

// ============================================================================
// WRITE Operations (Mutations)
// ============================================================================

/**
 * Criar um novo imposto
 */
export async function createTaxRule(input: CreateTaxRuleInput): Promise<TaxRuleActionResult> {
  try {
    const cookieHeader = await getAuthCookieHeader()
    
    // Limpar campos undefined antes de enviar
    const cleanedInput = Object.fromEntries(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      Object.entries(input).filter(([__, v]) => v !== undefined)
    ) as CreateTaxRuleInput
    
    console.log('[createTaxRule] 📤 Sending to backend:', JSON.stringify(cleanedInput, null, 2))
    
    const res = await fetch(`${API_BASE_URL}/api/tax-rules`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
      body: JSON.stringify(cleanedInput),
    })

    const json = await res.json()
    
    console.log('[createTaxRule] 📥 Backend response:', {
      status: res.status,
      ok: res.ok,
      data: json
    })

    if (!res.ok) {
      console.error('[createTaxRule] ❌ Backend error:', json)
      return {
        success: false,
        errors: {
          _form: [json.error || json.message || JSON.stringify(json) || 'Failed to create tax rule'],
        },
      }
    }

    revalidateEntityMutation('TAX_RULES')
    
    return {
      success: true,
      data: json.data,
    }
  } catch (error) {
    console.error('[createTaxRule] Error creating tax rule:', error)
    return {
      success: false,
      errors: {
        _form: ['An unexpected error occurred'],
      },
    }
  }
}

/**
 * Atualizar um imposto existente
 */
export async function updateTaxRule(input: UpdateTaxRuleInput): Promise<TaxRuleActionResult> {
  try {
    const cookieHeader = await getAuthCookieHeader()
    const { id, ...updateData } = input
    
    const res = await fetch(`${API_BASE_URL}/api/tax-rules/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
      body: JSON.stringify(updateData),
    })

    const json = await res.json()

    if (!res.ok) {
      return {
        success: false,
        errors: {
          _form: [json.error || json.message || 'Failed to update tax rule'],
        },
      }
    }

    revalidateEntityMutation('TAX_RULES')
    
    return {
      success: true,
      data: json.data,
    }
  } catch (error) {
    console.error('[updateTaxRule] Error updating tax rule:', error)
    return {
      success: false,
      errors: {
        _form: ['An unexpected error occurred'],
      },
    }
  }
}

/**
 * Deletar um imposto
 */
export async function deleteTaxRule(id: string): Promise<TaxRuleActionResult> {
  try {
    console.log('[deleteTaxRule] Starting delete for ID:', id)
    const cookieHeader = await getAuthCookieHeader()
    
    const url = `${API_BASE_URL}/api/tax-rules/${id}`
    console.log('[deleteTaxRule] Calling DELETE:', url)
    console.log('[deleteTaxRule] Cookie header:', cookieHeader ? 'present' : 'missing')
    
    const res = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
    })

    console.log('[deleteTaxRule] Response status:', res.status)

    if (!res.ok) {
      const json = await res.json()
      console.error('[deleteTaxRule] Error response:', json)
      return {
        success: false,
        errors: {
          _form: [json.error || json.message || 'Failed to delete tax rule'],
        },
      }
    }

    const responseData = await res.json().catch(() => null)
    console.log('[deleteTaxRule] ✅ Success response:', responseData)
    console.log('[deleteTaxRule] 🔄 Revalidating cache...')

    revalidateEntityMutation('TAX_RULES', {
      includeStats: true,
      includeDependencies: true,
      additionalPaths: ['/dashboard/payroll']
    })
    
    console.log('[deleteTaxRule] ✅ Cache revalidated')
    
    return {
      success: true,
    }
  } catch (error) {
    console.error('[deleteTaxRule] Error deleting tax rule:', error)
    return {
      success: false,
      errors: {
        _form: ['An unexpected error occurred'],
      },
    }
  }
}

/**
 * Criar faixas de imposto progressivo
 */
export async function createTaxBrackets(
  taxRuleId: string,
  brackets: CreateTaxBracketInput[]
): Promise<TaxRuleActionResult> {
  try {
    const cookieHeader = await getAuthCookieHeader()
    
    const res = await fetch(`${API_BASE_URL}/api/tax-rules/${taxRuleId}/brackets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
      body: JSON.stringify(brackets),
    })

    const json = await res.json()

    if (!res.ok) {
      return {
        success: false,
        errors: {
          _form: [json.error || json.message || 'Failed to create tax brackets'],
        },
      }
    }

    revalidateEntityMutation('TAX_RULES')
    
    return {
      success: true,
      data: json.data,
    }
  } catch (error) {
    console.error('[createTaxBrackets] Error creating tax brackets:', error)
    return {
      success: false,
      errors: {
        _form: ['An unexpected error occurred'],
      },
    }
  }
}

/**
 * Atualizar uma faixa de imposto específica
 */
export async function updateTaxBracket(
  taxRuleId: string,
  bracketId: string,
  bracketData: Partial<CreateTaxBracketInput>
): Promise<TaxRuleActionResult> {
  try {
    const cookieHeader = await getAuthCookieHeader()
    
    const res = await fetch(`${API_BASE_URL}/api/tax-rules/${taxRuleId}/brackets/${bracketId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
      body: JSON.stringify(bracketData),
    })

    const json = await res.json()

    if (!res.ok) {
      return {
        success: false,
        errors: {
          _form: [json.error || json.message || 'Failed to update tax bracket'],
        },
      }
    }

    revalidateEntityMutation('TAX_RULES')
    
    return {
      success: true,
      data: json.data,
    }
  } catch (error) {
    console.error('[updateTaxBracket] Error updating tax bracket:', error)
    return {
      success: false,
      errors: {
        _form: ['An unexpected error occurred'],
      },
    }
  }
}

/**
 * Deletar uma faixa de imposto
 */
export async function deleteTaxBracket(
  taxRuleId: string,
  bracketId: string
): Promise<TaxRuleActionResult> {
  try {
    const cookieHeader = await getAuthCookieHeader()
    
    const res = await fetch(`${API_BASE_URL}/api/tax-rules/${taxRuleId}/brackets/${bracketId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
    })

    if (!res.ok) {
      const json = await res.json()
      return {
        success: false,
        errors: {
          _form: [json.error || json.message || 'Failed to delete tax bracket'],
        },
      }
    }

    revalidateEntityMutation('TAX_RULES')
    
    return {
      success: true,
    }
  } catch (error) {
    console.error('[deleteTaxBracket] Error deleting tax bracket:', error)
    return {
      success: false,
      errors: {
        _form: ['An unexpected error occurred'],
      },
    }
  }
}

/**
 * Ativar/desativar um imposto
 */
export async function toggleTaxRuleStatus(id: string, isActive: boolean): Promise<TaxRuleActionResult> {
  return updateTaxRule({ id, is_active: isActive })
}
