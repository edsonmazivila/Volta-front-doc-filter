/**
 * Tax Rules Types - Sistema de Impostos Dinâmico
 * Suporta impostos configuráveis por company (multi-tenant)
 * Compatível com impostos de Moçambique, EUA, Brasil, etc.
 */

// ============================================================================
// Enums & Constants
// ============================================================================

/**
 * Tipo de cálculo do imposto
 */
export type TaxCalculationType =
  | 'percentage'      // Ex: INSS 3% sobre salário
  | 'fixed_amount'    // Ex: Taxa fixa de 100 MZN
  | 'progressive'     // Ex: IRPS com faixas progressivas
  | 'custom'          // Customizado (futuro)

/**
 * Categoria do imposto
 */
export type TaxCategory =
  | 'social_security'   // INSS, Social Security
  | 'income_tax'        // IRPS, Federal Income Tax
  | 'payroll_tax'       // Outras taxas de folha de pagamento
  | 'other'             // Outras categorias

/**
 * Status do imposto (calculado)
 */
export type TaxRuleStatus =
  | 'active'      // is_active = true e dentro da vigência
  | 'inactive'    // is_active = false
  | 'expired'     // end_date < hoje
  | 'pending'     // effective_date > hoje

// ============================================================================
// Core Types
// ============================================================================

/**
 * Faixa de imposto progressivo (bracket)
 */
export interface TaxRuleBracket {
  id: string
  tax_rule_id: string
  bracket_order: number           // 1, 2, 3... (ordem de aplicação)
  min_income: number              // Renda mínima da faixa (ex: 0)
  max_income?: number | null      // Renda máxima (null = sem limite superior)
  rate: number                    // Taxa da faixa (0.10 = 10%)
  base_tax_amount: number         // Imposto base acumulado das faixas anteriores
  created_at?: string
  updated_at?: string
}

/**
 * Regra de imposto da empresa
 */
export interface CompanyTaxRule {
  // Identificação
  id: string                      // UUID
  company_id: string              // UUID (auto-preenchido pelo RLS)
  
  // Detalhes do imposto
  tax_code: string                // "INSS_EMPLOYEE", "IRPS", "FIT", etc.
  tax_name: string                // "INSS Employee Contribution"
  tax_category?: TaxCategory      // Categoria do imposto
  description?: string            // Descrição opcional
  
  // Quem paga?
  is_employee_contribution: boolean  // Desconta do salário do empregado?
  is_employer_contribution: boolean  // Empresa paga (custo adicional)?
  
  // Tipo de cálculo
  calculation_type: TaxCalculationType
  
  // Para impostos percentuais ou fixos
  rate?: number | null            // 0.03 = 3% (para percentage)
  fixed_amount?: number | null    // Valor fixo (para fixed_amount)
  wage_base_limit?: number | null // Teto máximo de salário tributável
  minimum_threshold?: number | null // Salário mínimo para aplicar o imposto
  
  // Para impostos progressivos
  has_brackets: boolean           // Tem faixas progressivas?
  brackets?: TaxRuleBracket[]     // Array de faixas (se has_brackets = true)
  
  // Configuração
  priority: number                // Ordem de execução (menor = primeiro)
  tax_year: number                // Ano fiscal (ex: 2026)
  effective_date: string          // Data de início da vigência (ISO)
  end_date?: string | null        // Data de término (null = sem fim)
  is_active: boolean              // Ativo?
  
  // Metadados
  created_at: string
  updated_at: string
  created_by?: string
  updated_by?: string
}

/**
 * Resposta da API ao listar impostos
 */
export interface TaxRulesListResponse {
  success: boolean
  tax_rules: CompanyTaxRule[]
  count: number
  tax_year: number
}

/**
 * Resposta da API ao criar/atualizar imposto
 */
export interface TaxRuleResponse {
  success: boolean
  data: CompanyTaxRule
}

/**
 * Resposta da API ao criar brackets
 */
export interface TaxBracketsResponse {
  success: boolean
  data: TaxRuleBracket[]
}

// ============================================================================
// Form & Input Types
// ============================================================================

/**
 * Dados para criar um novo imposto
 */
export interface CreateTaxRuleInput {
  tax_code: string
  tax_name: string
  tax_category?: TaxCategory
  description?: string
  is_employee_contribution: boolean
  is_employer_contribution: boolean
  calculation_type: TaxCalculationType
  rate?: number
  fixed_amount?: number
  wage_base_limit?: number
  minimum_threshold?: number
  priority: number
  tax_year: number
  effective_date: string
  end_date?: string
  is_active?: boolean
}

/**
 * Dados para atualizar um imposto
 */
export interface UpdateTaxRuleInput extends Partial<CreateTaxRuleInput> {
  id: string
}

/**
 * Dados para criar uma faixa de imposto
 */
export interface CreateTaxBracketInput {
  bracket_order: number
  min_income: number
  max_income?: number | null
  rate: number
  base_tax_amount: number
}

// ============================================================================
// Filter & Query Types
// ============================================================================

/**
 * Filtros para listar impostos
 */
export interface TaxRulesFilter {
  tax_year?: number
  is_active?: boolean
  tax_category?: TaxCategory
  calculation_type?: TaxCalculationType
  tax_code?: string
}

// ============================================================================
// Calculation Types
// ============================================================================

/**
 * Resultado do cálculo de um imposto
 */
export interface TaxCalculationResult {
  tax_rule_id: string
  tax_code: string
  tax_name: string
  taxable_amount: number          // Valor sobre o qual o imposto foi calculado
  tax_amount: number              // Valor do imposto calculado
  effective_rate: number          // Taxa efetiva aplicada
  bracket_used?: number           // Faixa utilizada (se progressivo)
}

/**
 * Resumo de todos os impostos calculados
 */
export interface TaxCalculationSummary {
  gross_salary: number
  employee_deductions: TaxCalculationResult[]
  employer_contributions: TaxCalculationResult[]
  total_employee_tax: number
  total_employer_cost: number
  net_salary: number
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * ActionResult genérico para operações
 */
export interface TaxRuleActionResult {
  success?: boolean
  data?: CompanyTaxRule | TaxRuleBracket[]
  errors?: {
    _form?: string[]
    [key: string]: string[] | undefined
  }
}
