import type { Role } from '@/lib/rbac/types'

/**
 * Verifica se o usuário pode gerenciar impostos
 * Apenas system_admin, org_admin e hr_manager podem gerenciar
 */
export function canManageTaxRules(userRole: Role | string): boolean {
  const managerRoles = ['system_admin', 'organization_admin', 'org_admin', 'hr_manager']
  return managerRoles.includes(userRole)
}

/**
 * Verifica se o usuário pode visualizar impostos
 * Todos os roles podem visualizar (read-only para employees)
 */
export function canViewTaxRules(): boolean {
  return true // Todos podem visualizar
}

/**
 * Verifica se o usuário pode ver impostos de todas as companies
 * Apenas system_admin tem essa permissão
 */
export function canViewAllCompaniesTaxRules(userRole: Role | string): boolean {
  return userRole === 'system_admin'
}

/**
 * Verifica se o usuário pode criar impostos
 */
export function canCreateTaxRule(userRole: Role | string): boolean {
  return canManageTaxRules(userRole)
}

/**
 * Verifica se o usuário pode editar impostos
 */
export function canUpdateTaxRule(userRole: Role | string): boolean {
  return canManageTaxRules(userRole)
}

/**
 * Verifica se o usuário pode deletar impostos
 */
export function canDeleteTaxRule(userRole: Role | string): boolean {
  return canManageTaxRules(userRole)
}

/**
 * Verifica se o usuário pode ativar/desativar impostos
 */
export function canToggleTaxRuleStatus(userRole: Role | string): boolean {
  return canManageTaxRules(userRole)
}

/**
 * Verifica se o usuário pode gerenciar faixas de impostos progressivos
 */
export function canManageTaxBrackets(userRole: Role | string): boolean {
  return canManageTaxRules(userRole)
}
