# 📘 Exemplos Práticos - Sistema de Impostos Dinâmicos

## Exemplo 1: Importar Impostos de Moçambique

```tsx
import { TaxPresetsImportDialog } from '@/components/tax-rules'

function MyComponent() {
  const [showImport, setShowImport] = useState(false)
  
  return (
    <>
      <Button onClick={() => setShowImport(true)}>
        Importar Impostos
      </Button>
      
      <TaxPresetsImportDialog
        open={showImport}
        onOpenChange={setShowImport}
        onSuccess={() => console.log('Impostos importados!')}
      />
    </>
  )
}
```

---

## Exemplo 2: Calcular Salário Líquido

```typescript
import { getTaxRules } from '@/lib/services/tax-rules'
import { calculateAllTaxes } from '@/lib/utils/tax-rules'

async function calculateNetSalary(grossSalary: number) {
  // Buscar impostos do ano atual
  const taxRules = await getTaxRules({ 
    tax_year: 2026, 
    is_active: true 
  })
  
  // Calcular todos os impostos
  const result = calculateAllTaxes(grossSalary, taxRules)
  
  console.log('Salário Bruto:', result.grossSalary)
  console.log('Deduções:', result.employeeDeductions)
  console.log('Salário Líquido:', result.netSalary)
  
  return result
}

// Exemplo: Salário de 50,000 MZN
calculateNetSalary(50000)
// Output:
// Salário Bruto: 50000
// Deduções: 6500 (INSS 3% + IRPS)
// Salário Líquido: 43500
```

---

## Exemplo 3: Criar Imposto Percentual

```typescript
import { createTaxRule } from '@/lib/services/tax-rules'

async function createINSS() {
  const result = await createTaxRule({
    tax_code: 'INSS_EMPLOYEE',
    tax_name: 'INSS Employee Contribution',
    tax_category: 'social_security',
    is_employee_contribution: true,
    is_employer_contribution: false,
    calculation_type: 'percentage',
    rate: 0.03, // 3%
    wage_base_limit: 176100.00,
    priority: 100,
    tax_year: 2026,
    effective_date: '2026-01-01',
    has_brackets: false,
    is_active: true,
  })
  
  if (result.success) {
    console.log('INSS criado:', result.data)
  }
}
```

---

## Exemplo 4: Criar Imposto Progressivo (IRPS)

```typescript
import { createTaxRule, createTaxBrackets } from '@/lib/services/tax-rules'

async function createIRPS() {
  // 1. Criar a regra de imposto
  const ruleResult = await createTaxRule({
    tax_code: 'IRPS',
    tax_name: 'IRPS - Personal Income Tax',
    tax_category: 'income_tax',
    is_employee_contribution: true,
    is_employer_contribution: false,
    calculation_type: 'progressive',
    has_brackets: true,
    priority: 200,
    tax_year: 2026,
    effective_date: '2026-01-01',
    is_active: true,
  })
  
  if (!ruleResult.success || !ruleResult.data) {
    console.error('Erro ao criar IRPS')
    return
  }
  
  // 2. Criar as faixas progressivas
  const bracketsResult = await createTaxBrackets(ruleResult.data.id, [
    {
      bracket_order: 1,
      min_income: 0,
      max_income: 100000,
      rate: 0.10, // 10%
      base_tax_amount: 0,
    },
    {
      bracket_order: 2,
      min_income: 100000,
      max_income: 200000,
      rate: 0.15, // 15%
      base_tax_amount: 10000, // 100,000 * 0.10
    },
    {
      bracket_order: 3,
      min_income: 200000,
      max_income: null, // Sem limite
      rate: 0.32, // 32%
      base_tax_amount: 25000, // 10,000 + (100,000 * 0.15)
    },
  ])
  
  if (bracketsResult.success) {
    console.log('IRPS com faixas criado com sucesso!')
  }
}
```

---

## Exemplo 5: Listar e Filtrar Impostos

```typescript
import { getTaxRules } from '@/lib/services/tax-rules'

async function listActiveTaxes() {
  // Listar todos os impostos ativos de 2026
  const allTaxes = await getTaxRules({ 
    tax_year: 2026, 
    is_active: true 
  })
  
  // Filtrar apenas impostos de segurança social
  const socialSecurity = allTaxes.filter(
    tax => tax.tax_category === 'social_security'
  )
  
  // Filtrar apenas impostos do empregado
  const employeeTaxes = allTaxes.filter(
    tax => tax.is_employee_contribution
  )
  
  console.log('Total de impostos:', allTaxes.length)
  console.log('Segurança Social:', socialSecurity.length)
  console.log('Do Empregado:', employeeTaxes.length)
}
```

---

## Exemplo 6: Verificar Permissões

```typescript
import { useSession } from '@/components/auth/session-context'
import { canManageTaxRules, canViewTaxRules } from '@/lib/rbac/tax-rules-permissions'

function TaxRulesButton() {
  const { session } = useSession()
  const userRole = session?.user?.role || 'employee'
  
  const canView = canViewTaxRules(userRole)
  const canManage = canManageTaxRules(userRole)
  
  if (!canView) {
    return null // Usuário não pode nem ver
  }
  
  return (
    <div>
      <Button>Ver Impostos</Button>
      {canManage && (
        <Button>Editar Impostos</Button>
      )}
    </div>
  )
}
```

---

## Exemplo 7: Calcular IRPS Progressivo

```typescript
import { calculateProgressiveTax } from '@/lib/utils/tax-rules'

const irpsBrackets = [
  { min_income: 0, max_income: 100000, rate: 0.10, base_tax_amount: 0 },
  { min_income: 100000, max_income: 200000, rate: 0.15, base_tax_amount: 10000 },
  { min_income: 200000, max_income: null, rate: 0.32, base_tax_amount: 25000 },
]

// Salário de 150,000 MZN (cai na segunda faixa)
const tax1 = calculateProgressiveTax(150000, irpsBrackets)
console.log('IRPS para 150k:', tax1) // 17,500 MZN

// Salário de 300,000 MZN (cai na terceira faixa)
const tax2 = calculateProgressiveTax(300000, irpsBrackets)
console.log('IRPS para 300k:', tax2) // 57,000 MZN

// Cálculo manual da segunda faixa:
// Base: 10,000 (imposto das faixas anteriores)
// Adicional: (150,000 - 100,000) * 0.15 = 7,500
// Total: 10,000 + 7,500 = 17,500 ✅
```

---

## Exemplo 8: Usar Componente de Calculadora

```tsx
import { getTaxRules } from '@/lib/services/tax-rules'
import { TaxCalculator } from '@/components/tax-rules'

export default async function PayrollPage() {
  const taxRules = await getTaxRules({ tax_year: 2026 })
  
  return (
    <div>
      <h1>Simulador de Salário</h1>
      <TaxCalculator taxRules={taxRules} />
    </div>
  )
}
```

---

## Exemplo 9: Validar Antes de Criar

```typescript
import { validateTaxRule } from '@/lib/utils/tax-rules'
import { createTaxRule } from '@/lib/services/tax-rules'

async function createTaxWithValidation(data: CreateTaxRuleInput) {
  // Validar no cliente antes de enviar
  const errors = validateTaxRule(data)
  
  if (errors.length > 0) {
    console.error('Erros de validação:', errors)
    return { success: false, errors }
  }
  
  // Enviar ao servidor
  return await createTaxRule(data)
}
```

---

## Exemplo 10: Desativar Imposto Antigo e Criar Novo

```typescript
import { toggleTaxRuleStatus, createTaxRule } from '@/lib/services/tax-rules'

async function updateTaxForNewYear(oldTaxId: string) {
  // 1. Desativar imposto do ano anterior
  await toggleTaxRuleStatus(oldTaxId, false)
  
  // 2. Criar novo imposto para 2027 com taxa atualizada
  await createTaxRule({
    tax_code: 'INSS_EMPLOYEE',
    tax_name: 'INSS Employee Contribution',
    calculation_type: 'percentage',
    rate: 0.035, // Nova taxa de 3.5%
    tax_year: 2027,
    effective_date: '2027-01-01',
    // ... outros campos
  })
}
```

---

## Exemplo 11: Exportar Dados de Impostos

```typescript
import { getTaxRules } from '@/lib/services/tax-rules'

async function exportTaxRulesToCSV() {
  const taxRules = await getTaxRules({ tax_year: 2026 })
  
  const csv = [
    ['Tax Code', 'Tax Name', 'Type', 'Rate', 'Active'].join(','),
    ...taxRules.map(tax => [
      tax.tax_code,
      tax.tax_name,
      tax.calculation_type,
      tax.rate || tax.fixed_amount || 'progressive',
      tax.is_active ? 'Yes' : 'No'
    ].join(','))
  ].join('\n')
  
  // Download CSV
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'tax-rules-2026.csv'
  a.click()
}
```

---

## Exemplo 12: Preview de Payslip com Impostos

```tsx
import { calculateAllTaxes, formatCurrency } from '@/lib/utils/tax-rules'

function PayslipPreview({ grossSalary, taxRules }) {
  const calculation = calculateAllTaxes(grossSalary, taxRules)
  
  return (
    <div className="border rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Payslip Preview</h2>
      
      <div className="space-y-2">
        <div className="flex justify-between">
          <span>Gross Salary:</span>
          <span className="font-bold">{formatCurrency(grossSalary)}</span>
        </div>
        
        <div className="border-t pt-2">
          <p className="font-medium mb-2">Deductions:</p>
          {calculation.details
            .filter(d => d.isEmployeeContribution)
            .map((detail, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span>{detail.taxName}:</span>
                <span className="text-red-600">
                  -{formatCurrency(detail.amount)}
                </span>
              </div>
            ))
          }
        </div>
        
        <div className="border-t pt-2 mt-2">
          <div className="flex justify-between text-lg font-bold">
            <span>Net Salary:</span>
            <span className="text-green-600">
              {formatCurrency(calculation.netSalary)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
```

---

## 🎯 Casos de Uso Comuns

### 1. Setup Inicial de Empresa
```typescript
// Importar impostos de Moçambique para nova empresa
await importMozambiqueTaxes()
```

### 2. Processar Payroll
```typescript
// Calcular todos os impostos para cada empregado
employees.forEach(emp => {
  const result = calculateAllTaxes(emp.gross_salary, taxRules)
  emp.net_salary = result.netSalary
})
```

### 3. Relatório Fiscal Anual
```typescript
// Buscar todos os impostos do ano
const taxRules = await getTaxRules({ tax_year: 2026 })
const report = generateTaxReport(taxRules)
```

### 4. Simulador de Cenários
```typescript
// Comparar diferentes salários
[30000, 50000, 100000, 200000].forEach(salary => {
  const result = calculateAllTaxes(salary, taxRules)
  console.log(`${salary}: ${result.netSalary}`)
})
```

---

Todos esses exemplos estão prontos para uso e demonstram as principais funcionalidades do sistema!
