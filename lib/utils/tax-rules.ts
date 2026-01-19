import type { CompanyTaxRule, CreateTaxRuleInput, TaxRuleStatus } from '@/lib/types/tax-rules'

// ============================================================================
// Validação de Regras de Imposto
// ============================================================================

/**
 * Validar dados de criação/atualização de imposto
 * @returns Array de mensagens de erro (vazio se válido)
 */
export function validateTaxRule(rule: Partial<CreateTaxRuleInput>): string[] {
  const errors: string[] = []

  // Campos obrigatórios
  if (!rule.tax_code) {
    errors.push('Tax code is required')
  }

  if (!rule.tax_name) {
    errors.push('Tax name is required')
  }

  if (!rule.calculation_type) {
    errors.push('Calculation type is required')
  }

  // Validações específicas por tipo de cálculo
  if (rule.calculation_type === 'percentage') {
    if (rule.rate === undefined || rule.rate === null) {
      errors.push('Rate is required for percentage-based taxes')
    } else if (rule.rate < 0 || rule.rate > 100) {
      errors.push('Rate must be between 0 and 100')
    }
  }

  if (rule.calculation_type === 'fixed_amount') {
    if (rule.fixed_amount === undefined || rule.fixed_amount === null) {
      errors.push('Fixed amount is required for fixed amount taxes')
    } else if (rule.fixed_amount < 0) {
      errors.push('Fixed amount cannot be negative')
    }
  }

  // Validar wage_base_limit
  if (rule.wage_base_limit !== undefined && rule.wage_base_limit !== null && rule.wage_base_limit < 0) {
    errors.push('Wage base limit cannot be negative')
  }

  // Validar minimum_threshold
  if (rule.minimum_threshold !== undefined && rule.minimum_threshold !== null && rule.minimum_threshold < 0) {
    errors.push('Minimum threshold cannot be negative')
  }

  // Validar tax_year
  if (!rule.tax_year || rule.tax_year < 2000 || rule.tax_year > 2100) {
    errors.push('Invalid tax year')
  }

  // Validar effective_date
  if (!rule.effective_date) {
    errors.push('Effective date is required')
  } else {
    const effectiveDate = new Date(rule.effective_date)
    if (isNaN(effectiveDate.getTime())) {
      errors.push('Invalid effective date format')
    }
  }

  // Validar end_date (se fornecido)
  if (rule.end_date) {
    const endDate = new Date(rule.end_date)
    if (isNaN(endDate.getTime())) {
      errors.push('Invalid end date format')
    } else if (rule.effective_date) {
      const effectiveDate = new Date(rule.effective_date)
      if (endDate <= effectiveDate) {
        errors.push('End date must be after effective date')
      }
    }
  }

  // Validar priority
  if (rule.priority !== undefined && rule.priority < 0) {
    errors.push('Priority cannot be negative')
  }

  // Validar contribuições
  if (
    rule.is_employee_contribution === false &&
    rule.is_employer_contribution === false
  ) {
    errors.push('At least one contribution type must be enabled (employee or employer)')
  }

  return errors
}

/**
 * Validar faixas de imposto progressivo
 */
export function validateTaxBrackets(brackets: Array<{
  bracket_order: number
  min_income: number
  max_income?: number | null
  rate: number
  base_tax_amount: number
}>): string[] {
  const errors: string[] = []

  if (!brackets || brackets.length === 0) {
    errors.push('Progressive taxes must have at least one bracket')
    return errors
  }

  // Validar cada faixa
  brackets.forEach((bracket, index) => {
    const prefix = `Bracket ${index + 1}:`

    if (bracket.min_income < 0) {
      errors.push(`${prefix} Minimum income cannot be negative`)
    }

    if (bracket.max_income !== null && bracket.max_income !== undefined) {
      if (bracket.max_income <= bracket.min_income) {
        errors.push(`${prefix} Maximum income must be greater than minimum income`)
      }
    }

    if (bracket.rate < 0 || bracket.rate > 1) {
      errors.push(`${prefix} Rate must be between 0 and 1 (0% to 100%)`)
    }

    if (bracket.base_tax_amount < 0) {
      errors.push(`${prefix} Base tax amount cannot be negative`)
    }

    if (bracket.bracket_order < 1) {
      errors.push(`${prefix} Bracket order must be at least 1`)
    }
  })

  // Validar ordenação e continuidade
  const sortedBrackets = [...brackets].sort((a, b) => a.bracket_order - b.bracket_order)
  
  for (let i = 0; i < sortedBrackets.length; i++) {
    const current = sortedBrackets[i]
    const next = sortedBrackets[i + 1]

    // Verificar se a ordem é sequencial
    if (current.bracket_order !== i + 1) {
      errors.push(`Bracket orders must be sequential starting from 1`)
      break
    }

    // Verificar continuidade entre faixas
    if (next) {
      if (current.max_income === null || current.max_income === undefined) {
        errors.push(`Bracket ${i + 1}: Only the last bracket can have unlimited max income`)
      } else if (current.max_income !== next.min_income) {
        errors.push(`Brackets ${i + 1} and ${i + 2}: Must be contiguous (max of ${i + 1} must equal min of ${i + 2})`)
      }
    }
  }

  return errors
}

// ============================================================================
// Cálculo de Status
// ============================================================================

/**
 * Calcular o status de uma regra de imposto
 */
export function getTaxRuleStatus(rule: CompanyTaxRule): TaxRuleStatus {
  const now = new Date()
  const effectiveDate = new Date(rule.effective_date)
  const endDate = rule.end_date ? new Date(rule.end_date) : null

  if (!rule.is_active) {
    return 'inactive'
  }

  if (endDate && endDate < now) {
    return 'expired'
  }

  if (effectiveDate > now) {
    return 'pending'
  }

  return 'active'
}

// ============================================================================
// Utilitários de Formatação
// ============================================================================

/**
 * Formatar taxa como porcentagem
 */
export function formatRate(rate: number): string {
  // Backend já retorna rate como 0-100 (ex: 3 = 3%), não precisa multiplicar
  return `${rate.toFixed(2)}%`
}

/**
 * Formatar valor monetário
 */
export function formatCurrency(amount: number, currency = 'MZN'): string {
  return new Intl.NumberFormat('pt-MZ', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

/**
 * Formatar faixa de renda
 */
export function formatIncomeBracket(minIncome: number, maxIncome?: number | null, currency = 'MZN'): string {
  const min = formatCurrency(minIncome, currency)
  if (maxIncome === null || maxIncome === undefined) {
    return `${min} and above`
  }
  const max = formatCurrency(maxIncome, currency)
  return `${min} - ${max}`
}

// ============================================================================
// Cálculo de Impostos (Preview)
// ============================================================================

/**
 * Calcular imposto percentual
 */
export function calculatePercentageTax(
  grossSalary: number,
  rate: number,
  wageBaseLimit?: number | null,
  minimumThreshold?: number | null
): number {
  // Verificar threshold mínimo
  if (minimumThreshold && grossSalary < minimumThreshold) {
    return 0
  }

  // Aplicar teto máximo
  const taxableAmount = wageBaseLimit
    ? Math.min(grossSalary, wageBaseLimit)
    : grossSalary

  return taxableAmount * rate
}

/**
 * Calcular imposto progressivo
 */
export function calculateProgressiveTax(
  grossSalary: number,
  brackets: Array<{
    min_income: number
    max_income?: number | null
    rate: number
    base_tax_amount: number
  }>
): number {
  // Encontrar a faixa correta
  const applicableBracket = brackets.find(bracket => {
    if (bracket.max_income === null || bracket.max_income === undefined) {
      return grossSalary >= bracket.min_income
    }
    return grossSalary >= bracket.min_income && grossSalary < bracket.max_income
  })

  if (!applicableBracket) {
    return 0
  }

  // Calcular imposto: base acumulada + (salário - min da faixa) * taxa da faixa
  const taxableInBracket = grossSalary - applicableBracket.min_income
  return applicableBracket.base_tax_amount + (taxableInBracket * applicableBracket.rate)
}

/**
 * Calcular imposto fixo
 */
export function calculateFixedTax(
  grossSalary: number,
  fixedAmount: number,
  minimumThreshold?: number | null
): number {
  if (minimumThreshold && grossSalary < minimumThreshold) {
    return 0
  }
  return fixedAmount
}

/**
 * Calcular todos os impostos de um salário
 */
export function calculateAllTaxes(
  grossSalary: number,
  taxRules: CompanyTaxRule[]
): {
  employeeDeductions: number
  employerContributions: number
  netSalary: number
  details: Array<{
    taxCode: string
    taxName: string
    amount: number
    isEmployeeContribution: boolean
    isEmployerContribution: boolean
  }>
} {
  // Ordenar por prioridade
  const sortedRules = [...taxRules]
    .filter(rule => rule.is_active)
    .sort((a, b) => a.priority - b.priority)

  let employeeDeductions = 0
  let employerContributions = 0
  const details: Array<{
    taxCode: string
    taxName: string
    amount: number
    isEmployeeContribution: boolean
    isEmployerContribution: boolean
  }> = []

  for (const rule of sortedRules) {
    let amount = 0

    // Calcular baseado no tipo
    switch (rule.calculation_type) {
      case 'percentage':
        amount = calculatePercentageTax(
          grossSalary,
          rule.rate || 0,
          rule.wage_base_limit,
          rule.minimum_threshold
        )
        break

      case 'progressive':
        if (rule.brackets && rule.brackets.length > 0) {
          amount = calculateProgressiveTax(grossSalary, rule.brackets)
        }
        break

      case 'fixed_amount':
        amount = calculateFixedTax(
          grossSalary,
          rule.fixed_amount || 0,
          rule.minimum_threshold
        )
        break
    }

    // Somar nos totais apropriados
    if (rule.is_employee_contribution) {
      employeeDeductions += amount
    }
    if (rule.is_employer_contribution) {
      employerContributions += amount
    }

    details.push({
      taxCode: rule.tax_code,
      taxName: rule.tax_name,
      amount,
      isEmployeeContribution: rule.is_employee_contribution,
      isEmployerContribution: rule.is_employer_contribution,
    })
  }

  const netSalary = grossSalary - employeeDeductions

  return {
    employeeDeductions,
    employerContributions,
    netSalary,
    details,
  }
}
