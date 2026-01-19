# Sistema de Impostos Dinâmicos - Frontend

## 📋 Visão Geral

Sistema completo de gerenciamento de impostos dinâmicos configuráveis por empresa (multi-tenant).

### ✅ O que foi implementado:

1. **Tipos TypeScript completos** (`lib/types/tax-rules.ts`)
2. **Serviços de API** (`lib/services/tax-rules.ts`)
3. **Validações** (`lib/utils/tax-rules.ts`)
4. **Componentes UI** (`components/tax-rules/`)
5. **RBAC/Permissões** (`lib/rbac/tax-rules-permissions.ts`)
6. **Presets de Impostos** (`lib/utils/tax-presets.ts`)

---

## 🗂️ Estrutura de Arquivos

```
lib/
├── types/
│   └── tax-rules.ts                 # Tipos TypeScript completos
├── services/
│   └── tax-rules.ts                 # CRUD operations com cache
├── utils/
│   ├── tax-rules.ts                 # Validações e cálculos
│   └── tax-presets.ts               # Presets de Moçambique, EUA, Brasil
└── rbac/
    └── tax-rules-permissions.ts     # Verificações de permissões

components/tax-rules/
├── index.ts                         # Exports
├── tax-rules-section.tsx            # Componente principal
├── tax-rules-table.tsx              # Tabela de impostos
├── tax-rule-form-dialog.tsx         # Formulário de criar/editar
├── tax-brackets-form-dialog.tsx     # Formulário de faixas progressivas
└── tax-calculator.tsx               # Calculadora de preview
```

---

## 🚀 Como Usar

### 1. Adicionar à Página

```tsx
// app/dashboard/tax-rules/page.tsx
import { TaxRulesSection } from '@/components/tax-rules'

export default function TaxRulesPage() {
  return <TaxRulesSection />
}
```

### 2. Usar Calculadora de Impostos

```tsx
import { TaxCalculator } from '@/components/tax-rules'
import { getTaxRules } from '@/lib/services/tax-rules'

const taxRules = await getTaxRules({ tax_year: 2026 })

return <TaxCalculator taxRules={taxRules} />
```

### 3. Verificar Permissões

```tsx
import { canManageTaxRules } from '@/lib/rbac/tax-rules-permissions'

const canEdit = canManageTaxRules(user.role)

if (canEdit) {
  // Mostrar botões de edição
}
```

### 4. Usar Presets de Países

```tsx
import { TAX_PRESETS_BY_COUNTRY } from '@/lib/utils/tax-presets'
import { createTaxRule, createTaxBrackets } from '@/lib/services/tax-rules'

// Criar impostos de Moçambique automaticamente
const mozambiqueTaxes = TAX_PRESETS_BY_COUNTRY.mozambique.taxes

for (const { rule, brackets } of mozambiqueTaxes) {
  const result = await createTaxRule(rule)
  
  if (result.success && brackets.length > 0 && result.data) {
    await createTaxBrackets(result.data.id, brackets)
  }
}
```

---

## 🔐 Permissões RBAC

| Role | Ver | Criar | Editar | Deletar |
|------|-----|-------|--------|---------|
| `system_admin` | ✅ | ✅ | ✅ | ✅ |
| `org_admin` | ✅ | ✅ | ✅ | ✅ |
| `hr_manager` | ✅ | ✅ | ✅ | ✅ |
| `payroll_manager` | ✅ | ❌ | ❌ | ❌ |
| `employee` | ✅ | ❌ | ❌ | ❌ |

---

## 📝 Tipos de Impostos Suportados

### 1. Percentual (percentage)
```typescript
{
  calculation_type: 'percentage',
  rate: 0.03, // 3%
  wage_base_limit: 176100.00, // Opcional
}
```

### 2. Valor Fixo (fixed_amount)
```typescript
{
  calculation_type: 'fixed_amount',
  fixed_amount: 100.00,
}
```

### 3. Progressivo (progressive)
```typescript
{
  calculation_type: 'progressive',
  has_brackets: true,
  brackets: [
    { min_income: 0, max_income: 100000, rate: 0.10, ... },
    { min_income: 100000, max_income: null, rate: 0.32, ... },
  ]
}
```

---

## 🌍 Presets Disponíveis

### Moçambique
- INSS Employee (3%)
- INSS Employer (4%)
- IRPS (10%, 15%, 32%)

### Estados Unidos
- Social Security (6.2%)
- Medicare (1.45%)
- Federal Income Tax (7 faixas progressivas)

### Brasil
- INSS Progressivo (7.5% a 14%)
- IRRF (0% a 27.5%)
- FGTS Employer (8%)

---

## 🧪 Validações Implementadas

✅ Campos obrigatórios (tax_code, tax_name, calculation_type)  
✅ Validação de taxa (0% a 100%)  
✅ Validação de datas (effective_date, end_date)  
✅ Validação de ano fiscal  
✅ Validação de faixas progressivas (continuidade, ordenação)  
✅ Pelo menos um tipo de contribuição ativo  

---

## 🔄 Endpoints da API Consumidos

```
GET    /api/v1/tax-rules?tax_year=2026
GET    /api/v1/tax-rules/:id
POST   /api/v1/tax-rules
PUT    /api/v1/tax-rules/:id
DELETE /api/v1/tax-rules/:id

GET    /api/v1/tax-rules/:id/brackets
POST   /api/v1/tax-rules/:id/brackets
PUT    /api/v1/tax-rules/:id/brackets/:bracketId
DELETE /api/v1/tax-rules/:id/brackets/:bracketId
```

---

## 🎨 Componentes UI

### TaxRulesSection
Componente principal com:
- Filtro por ano fiscal
- Tabela de impostos
- Botões de criar/editar/deletar
- Diálogos de confirmação

### TaxRuleFormDialog
Formulário completo com:
- Informações básicas
- Tipo de contribuição
- Configurações de cálculo
- Período de vigência
- Validação em tempo real

### TaxBracketsFormDialog
Gerenciamento de faixas progressivas:
- Adicionar/remover faixas
- Validação de continuidade
- Preview das faixas

### TaxCalculator
Calculadora de impostos:
- Input de salário bruto
- Cálculo automático
- Deduções do empregado
- Contribuições do empregador
- Salário líquido

---

## 🧮 Funções de Cálculo

```typescript
import { calculateAllTaxes } from '@/lib/utils/tax-rules'

const result = calculateAllTaxes(50000, taxRules)

console.log(result)
// {
//   employeeDeductions: 6500,
//   employerContributions: 2000,
//   netSalary: 43500,
//   details: [...]
// }
```

---

## 📦 Cache & Revalidação

Todas as funções READ usam cache do Next.js:
- Tag: `tax-rules`
- Revalidação: 60 segundos
- Invalidação automática após mutações

---

## ✨ Próximos Passos Sugeridos

1. **Criar página de rota** `/app/dashboard/tax-rules/page.tsx`
2. **Adicionar ao menu de navegação**
3. **Testar integração com payroll processing**
4. **Adicionar testes unitários**
5. **Adicionar internacionalização (i18n)**
6. **Implementar import/export de impostos**
7. **Adicionar histórico de alterações**

---

## 📚 Referências

- Documentação completa no comentário inicial
- Tipos em `lib/types/tax-rules.ts`
- Exemplos de uso em `lib/utils/tax-presets.ts`
- RBAC em `lib/rbac/tax-rules-permissions.ts`
