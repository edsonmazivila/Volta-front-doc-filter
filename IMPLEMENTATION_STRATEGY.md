# Estratégia de Implementação - Multi-Tenant System

**Data:** 18 de Dezembro de 2025  
**Versão:** 1.0  
**Branch Base:** fix/my-documents-upload-preview  
**Objetivo:** Implementação progressiva do sistema multi-tenant com Organizations

---

## 📋 Índice

1. [Visão Geral da Estratégia](#visão-geral-da-estratégia)
2. [Fluxo Antigo vs Novo](#fluxo-antigo-vs-novo)
3. [Fase 1: Organizations & Multi-Company](#fase-1-organizations--multi-company)
4. [Fase 2: Platform Owner](#fase-2-platform-owner)
5. [Fase 3: Melhorias & Refinamentos](#fase-3-melhorias--refinamentos)
6. [Arquitetura de Componentes](#arquitetura-de-componentes)
7. [Plano de Migração](#plano-de-migração)

---

## 🎯 Visão Geral da Estratégia

### Princípios de Implementação

✅ **Incremental:** Implementar em fases pequenas e testáveis  
✅ **Backward Compatible:** Não quebrar funcionalidades existentes  
✅ **User-Centric:** Focar primeiro no fluxo do Organization Admin  
✅ **Data Integrity:** Garantir isolamento multi-tenant desde o início  

### Sequência de Implementação

```
FASE 1: Organizations & Multi-Company (4-5 semanas)
   └─> Organization Registration Flow
   └─> Organization Dashboard
   └─> Multi-Company Management
   └─> Company Switcher/Selector
   └─> Isolamento de Dados

FASE 2: Platform Owner (2-3 semanas)
   └─> Bootstrap Platform Owner
   └─> Approval Workflow
   └─> Platform Dashboard

FASE 3: Melhorias & Refinamentos (2 semanas)
   └─> Relatórios Consolidados
   └─> Analytics
   └─> Optimizações
```

---

## 🔄 Fluxo Antigo vs Novo

### ❌ Fluxo ANTIGO (Single Company)

```
User Registration
    ↓
1. Preenche dados pessoais
2. Preenche dados da company
3. Sistema cria:
   - Company (1 única)
   - User (system_admin)
    ↓
Login Imediato
    ↓
Dashboard da Company
```

**Limitações:**
- Apenas 1 company por conta
- Sem hierarquia de organização
- Sem aprovação/validação
- Role "system_admin" criada automaticamente

---

### ✅ Fluxo NOVO (Multi-Tenant com Organizations)

```
Organization Registration
    ↓
1. Preenche dados do Admin
2. Preenche dados da ORGANIZATION
3. Preenche dados da PRIMEIRA company
4. Sistema cria:
   - Organization (status: pending, is_active: false)
   - Company (primeira da organização)
   - User (role: organization_admin)
    ↓
Aguarda Aprovação do Platform Owner
    ↓
Platform Owner aprova
    ↓
Organization Admin faz login
    ↓
Dashboard da Organization
    ↓
Pode criar MÚLTIPLAS companies
    ↓
Cada company funciona de forma isolada
```

**Vantagens:**
- Suporta múltiplas companies por organização
- Organization Admin vê TODAS as companies
- System Admin vê apenas a SUA company
- Workflow de aprovação
- Isolamento total de dados

---

## 📅 FASE 1: Organizations & Multi-Company

**Duração Estimada:** 4-5 semanas  
**Prioridade:** P0 (Crítico)  
**Objetivo:** Implementar o fluxo completo de Organization Admin com multi-company

### 1.1 Organization Registration Flow (Semana 1)

#### Mudanças no Registo

**Endpoint:** `POST /api/auth/register-account`

**Antes:**
```json
{
  "admin": {...},
  "company": {...}  // Cria 1 company
}
```

**Depois:**
```json
{
  "admin": {
    "full_name": "John Doe",
    "email": "john@acme.com",
    "password": "SecurePass123!"
  },
  "organization": {
    "name": "Acme Corporation"  // NOVO: Nome da organização
  },
  "company": {
    "name": "Acme Corp",        // Primeira company da org
    "business_email": "info@acme.com",
    "country": "US"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "organization": {
      "id": "org-uuid",
      "name": "Acme Corporation",
      "is_active": false,
      "approval_status": "pending"
    },
    "company": {
      "id": "company-uuid",
      "name": "Acme Corp",
      "organization_id": "org-uuid"
    },
    "user": {
      "id": "user-uuid",
      "email": "john@acme.com",
      "role": "organization_admin",  // ✅ NOVO: era "system_admin"
      "organization_id": "org-uuid",
      "company_id": "company-uuid"
    }
  },
  "message": "Organization registered. Awaiting approval."
}
```

#### UI Components a Criar

**1. Signup Form (Atualizar)**

```tsx
// app/signup/signup-form.tsx

interface SignupFormData {
  // Admin Info
  full_name: string;
  email: string;
  password: string;
  confirm_password: string;
  
  // Organization Info (NOVO)
  organization_name: string;
  
  // Company Info (primeira company)
  company_name: string;
  business_email: string;
  country: string;
}

const SignupForm: React.FC = () => {
  return (
    <form onSubmit={handleSubmit}>
      {/* Seção 1: Admin Information */}
      <FormSection title="Administrator Information">
        <Input name="full_name" label="Full Name" required />
        <Input name="email" label="Email" type="email" required />
        <PasswordInput name="password" label="Password" required />
        <PasswordInput name="confirm_password" label="Confirm Password" required />
      </FormSection>

      {/* Seção 2: Organization Information (NOVO) */}
      <FormSection title="Organization Information">
        <Input 
          name="organization_name" 
          label="Organization Name" 
          placeholder="e.g., Acme Corporation"
          required 
        />
        <HelpText>
          Your organization can have multiple companies. 
          You'll be able to add more companies after registration.
        </HelpText>
      </FormSection>

      {/* Seção 3: First Company Information */}
      <FormSection title="First Company Information">
        <Input 
          name="company_name" 
          label="Company Name" 
          placeholder="e.g., Acme Corp"
          required 
        />
        <Input 
          name="business_email" 
          label="Business Email" 
          type="email" 
          required 
        />
        <Select 
          name="country" 
          label="Country" 
          options={countryOptions} 
          required 
        />
      </FormSection>

      <Button type="submit">Register Organization</Button>
    </form>
  );
};
```

**2. Registration Success Page (Novo)**

```tsx
// app/signup/registration-success/page.tsx

const RegistrationSuccessPage: React.FC = () => {
  return (
    <div className="registration-success">
      <SuccessIcon />
      <h1>Registration Successful!</h1>
      
      <Alert variant="info">
        <h3>What happens next?</h3>
        <ol>
          <li>
            <strong>Awaiting Approval</strong>
            <p>Your organization is pending approval from a Platform Owner.</p>
          </li>
          <li>
            <strong>Email Notification</strong>
            <p>You will receive an email once your organization is approved.</p>
          </li>
          <li>
            <strong>Access Granted</strong>
            <p>After approval, you can log in and start managing your companies.</p>
          </li>
        </ol>
      </Alert>

      <div className="what-you-registered">
        <h4>What you registered:</h4>
        <DataList>
          <DataItem label="Organization" value={organizationName} />
          <DataItem label="First Company" value={companyName} />
          <DataItem label="Admin Email" value={adminEmail} />
        </DataList>
      </div>

      <Button onClick={() => navigate('/login')}>
        Go to Login
      </Button>
    </div>
  );
};
```

**Tasks - Semana 1:**
- [ ] Atualizar `app/signup/signup-form.tsx` com seção de Organization
- [ ] Criar `app/signup/registration-success/page.tsx`
- [ ] Atualizar API call em `lib/services/auth.ts` para novo formato
- [ ] Adicionar validação de organização
- [ ] Testar fluxo de registo completo

---

### 1.2 Organization Dashboard (Semana 2)

#### Layout Principal

```
┌─────────────────────────────────────────────────┐
│ 🏢 Acme Corporation                             │
│ Status: ⏳ Pending Approval                     │
├─────────────────────────────────────────────────┤
│                                                 │
│  [IF APPROVED]                                  │
│  📊 Organization Overview                       │
│  ┌──────────────┬──────────────┬──────────────┐│
│  │ Companies    │ Employees    │ Payroll MTD  ││
│  │     2        │     45       │  $125,000    ││
│  └──────────────┴──────────────┴──────────────┘│
│                                                 │
│  🏢 Your Companies          [+ Add Company]     │
│  ┌──────────────────────────────────────────┐  │
│  │ 📍 Acme Corp (US)                        │  │
│  │ 25 employees · 3 departments             │  │
│  │ [View Dashboard] [Manage]                │  │
│  ├──────────────────────────────────────────┤  │
│  │ 📍 Acme Subsidiary (UK)                  │  │
│  │ 20 employees · 2 departments             │  │
│  │ [View Dashboard] [Manage]                │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  [IF PENDING]                                   │
│  ⚠️ Organization Pending Approval               │
│  Your organization is awaiting approval.        │
│  Limited access until approved.                 │
│                                                 │
└─────────────────────────────────────────────────┘
```

#### Componentes a Criar

**1. Organization Dashboard (Novo)**

```tsx
// app/dashboard/organization/page.tsx

interface OrganizationDashboardProps {
  user: User; // organization_admin
}

const OrganizationDashboard: React.FC<{ user }> = ({ user }) => {
  const { data: organization } = useQuery('/api/organizations/me');
  const { data: companies } = useQuery('/api/companies');
  const { data: stats } = useQuery('/api/reports/organization/stats');

  // Se organization está pending
  if (organization.approval_status === 'pending') {
    return <PendingApprovalView organization={organization} />;
  }

  return (
    <div className="organization-dashboard">
      <OrganizationHeader 
        name={organization.name}
        tier={organization.tier}
        status={organization.approval_status}
      />

      <OrganizationKPIs 
        companiesCount={companies.count}
        totalEmployees={stats.total_employees}
        monthlyPayroll={stats.monthly_payroll}
      />

      <CompaniesSection 
        companies={companies.data}
        onAddCompany={() => setShowAddCompanyModal(true)}
      />
    </div>
  );
};
```

**2. Pending Approval View**

```tsx
// components/organization/pending-approval-view.tsx

const PendingApprovalView: React.FC<{ organization }> = ({ organization }) => {
  return (
    <div className="pending-approval-view">
      <Alert variant="warning" icon={<ClockIcon />}>
        <h3>Organization Pending Approval</h3>
        <p>
          Your organization <strong>{organization.name}</strong> has been 
          registered and is awaiting approval from a Platform Owner.
        </p>
        <p className="text-muted">
          Registered on {formatDate(organization.created_at)}
        </p>
      </Alert>

      <Card>
        <h4>What you can do while waiting:</h4>
        <FeatureList>
          <Feature enabled>View your organization details</Feature>
          <Feature enabled>Edit your profile</Feature>
          <Feature enabled>Browse documentation</Feature>
          <Feature disabled>Create companies</Feature>
          <Feature disabled>Add users</Feature>
          <Feature disabled>Process payroll</Feature>
        </FeatureList>
      </Card>

      <div className="actions">
        <Button variant="secondary" onClick={() => navigate('/profile')}>
          Edit Profile
        </Button>
        <Button variant="outline" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </div>
  );
};
```

**3. Companies Section**

```tsx
// components/organization/companies-section.tsx

const CompaniesSection: React.FC<{ companies, onAddCompany }> = ({ 
  companies, 
  onAddCompany 
}) => {
  const navigate = useNavigate();

  return (
    <section className="companies-section">
      <div className="section-header">
        <h2>Your Companies ({companies.length})</h2>
        <Button onClick={onAddCompany}>
          <PlusIcon /> Add Company
        </Button>
      </div>

      <div className="companies-grid">
        {companies.map(company => (
          <CompanyCard 
            key={company.id}
            company={company}
            onViewDashboard={() => navigate(`/company/${company.id}/dashboard`)}
            onManage={() => navigate(`/company/${company.id}/settings`)}
          />
        ))}
      </div>

      {companies.length === 0 && (
        <EmptyState
          icon={<BuildingIcon />}
          title="No companies yet"
          description="Create your first company to get started"
          action={<Button onClick={onAddCompany}>Create Company</Button>}
        />
      )}
    </section>
  );
};
```

**4. Company Card**

```tsx
// components/organization/company-card.tsx

interface CompanyCardProps {
  company: {
    id: string;
    name: string;
    country: string;
    is_active: boolean;
    employees_count: number;
    departments_count: number;
  };
  onViewDashboard: () => void;
  onManage: () => void;
}

const CompanyCard: React.FC<CompanyCardProps> = ({ 
  company, 
  onViewDashboard, 
  onManage 
}) => {
  return (
    <Card className="company-card">
      <div className="company-header">
        <div className="company-icon">
          <BuildingIcon />
        </div>
        <div className="company-info">
          <h3>{company.name}</h3>
          <p className="country">
            <FlagIcon country={company.country} />
            {company.country}
          </p>
        </div>
        <StatusBadge active={company.is_active} />
      </div>

      <div className="company-stats">
        <Stat label="Employees" value={company.employees_count} />
        <Stat label="Departments" value={company.departments_count} />
      </div>

      <div className="company-actions">
        <Button variant="primary" onClick={onViewDashboard}>
          View Dashboard
        </Button>
        <Button variant="outline" onClick={onManage}>
          Manage
        </Button>
      </div>
    </Card>
  );
};
```

**Tasks - Semana 2:**
- [ ] Criar `app/dashboard/organization/page.tsx`
- [ ] Criar `components/organization/pending-approval-view.tsx`
- [ ] Criar `components/organization/companies-section.tsx`
- [ ] Criar `components/organization/company-card.tsx`
- [ ] Criar `components/organization/organization-header.tsx`
- [ ] Implementar `GET /api/organizations/me` endpoint call
- [ ] Implementar `GET /api/companies` endpoint call (retorna companies da org)

---

### 1.3 Multi-Company Management (Semana 3)

#### Create Company Flow

**Modal: Add New Company**

```tsx
// components/organization/add-company-modal.tsx

interface AddCompanyFormData {
  name: string;
  business_email: string;
  country: string;
  tax_id?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    postal_code: string;
  };
}

const AddCompanyModal: React.FC<{ isOpen, onClose, onSuccess }> = ({ 
  isOpen, 
  onClose, 
  onSuccess 
}) => {
  const { mutate: createCompany, isLoading } = useMutation(
    (data: AddCompanyFormData) => api.post('/api/companies', data),
    {
      onSuccess: (response) => {
        toast.success(`Company "${response.data.name}" created successfully!`);
        queryClient.invalidateQueries('/api/companies');
        onSuccess();
        onClose();
      },
      onError: (error) => {
        toast.error(error.message);
      }
    }
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalHeader>
        <h2>Add New Company</h2>
        <p className="text-muted">
          Create a new company within your organization
        </p>
      </ModalHeader>

      <ModalBody>
        <form onSubmit={handleSubmit(createCompany)}>
          {/* Basic Information */}
          <FormSection title="Basic Information">
            <Input 
              name="name" 
              label="Company Name" 
              placeholder="e.g., Acme Subsidiary"
              required 
            />
            <Input 
              name="business_email" 
              label="Business Email" 
              type="email"
              placeholder="info@company.com"
              required 
            />
            <Select 
              name="country" 
              label="Country" 
              options={countryOptions} 
              required 
            />
          </FormSection>

          {/* Optional Information */}
          <FormSection title="Additional Information (Optional)">
            <Input 
              name="tax_id" 
              label="Tax ID" 
              placeholder="12-3456789"
            />
          </FormSection>

          {/* Address (Optional) */}
          <FormSection title="Address (Optional)">
            <Input name="address.street" label="Street" />
            <div className="grid grid-cols-2 gap-4">
              <Input name="address.city" label="City" />
              <Input name="address.state" label="State/Province" />
            </div>
            <Input name="address.postal_code" label="Postal Code" />
          </FormSection>
        </form>
      </ModalBody>

      <ModalFooter>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button 
          variant="primary" 
          onClick={handleSubmit} 
          isLoading={isLoading}
        >
          Create Company
        </Button>
      </ModalFooter>
    </Modal>
  );
};
```

**Tasks - Semana 3:**
- [ ] Criar `components/organization/add-company-modal.tsx`
- [ ] Criar `lib/services/companies.ts` com CRUD operations
- [ ] Implementar validação de formulário
- [ ] Adicionar toast notifications
- [ ] Testar criação de múltiplas companies
- [ ] Validar que companies ficam associadas à organization correta

---

### 1.4 Company Switcher & Isolated Views (Semana 4)

#### Conceito: Organization Admin vê TUDO, System Admin vê APENAS a sua company

**Company Switcher Component**

```tsx
// components/organization/company-switcher.tsx

interface CompanySwitcherProps {
  currentCompanyId: string | 'all';
  companies: Company[];
  onChange: (companyId: string | 'all') => void;
  showAllOption?: boolean; // true para organization_admin
}

const CompanySwitcher: React.FC<CompanySwitcherProps> = ({ 
  currentCompanyId, 
  companies, 
  onChange,
  showAllOption = false 
}) => {
  return (
    <Select 
      value={currentCompanyId}
      onChange={(e) => onChange(e.target.value)}
      className="company-switcher"
    >
      {showAllOption && (
        <option value="all">All Companies</option>
      )}
      
      {companies.map(company => (
        <option key={company.id} value={company.id}>
          {company.name} ({company.country})
        </option>
      ))}
    </Select>
  );
};
```

**Usage Example:**

```tsx
// app/dashboard/employees/page.tsx

const EmployeesPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedCompany, setSelectedCompany] = useState<string | 'all'>(
    user.role === 'organization_admin' ? 'all' : user.company_id
  );

  // Para organization_admin: se 'all', mostra de todas as companies
  // Para system_admin: sempre filtra pela sua company
  const { data: employees } = useQuery(
    ['/api/users', { company_id: selectedCompany !== 'all' ? selectedCompany : undefined }]
  );

  return (
    <div className="employees-page">
      <PageHeader>
        <h1>Employees</h1>
        
        {user.role === 'organization_admin' && (
          <CompanySwitcher 
            currentCompanyId={selectedCompany}
            companies={user.companies}
            onChange={setSelectedCompany}
            showAllOption={true}
          />
        )}
      </PageHeader>

      <EmployeesTable 
        employees={employees.data}
        showCompanyColumn={selectedCompany === 'all'}
      />
    </div>
  );
};
```

#### Routing Strategy

**Organization Admin Routes:**
```
/dashboard/organization              → Organization Dashboard
/dashboard/organization/companies    → Manage Companies
/dashboard/organization/reports      → Consolidated Reports

/company/:companyId/dashboard        → Specific Company Dashboard
/company/:companyId/employees        → Employees da company
/company/:companyId/payroll          → Payroll da company
/company/:companyId/settings         → Settings da company
```

**System Admin Routes (sem mudanças):**
```
/dashboard                           → Company Dashboard (sua company)
/dashboard/employees                 → Employees (sua company)
/dashboard/payroll                   → Payroll (sua company)
/dashboard/settings                  → Settings (sua company)
```

**Route Guards:**

```tsx
// lib/auth/route-guards.tsx

export const OrganizationAdminRoute: React.FC<{ children }> = ({ children }) => {
  const { user } = useAuth();
  
  if (user.role !== 'organization_admin') {
    return <Navigate to="/dashboard" />;
  }
  
  return <>{children}</>;
};

export const CompanyRoute: React.FC<{ children, companyId }> = ({ children, companyId }) => {
  const { user } = useAuth();
  
  // Organization Admin: pode ver qualquer company da org
  if (user.role === 'organization_admin') {
    // Validar que company pertence à org (feito pelo backend via RLS)
    return <>{children}</>;
  }
  
  // System Admin: só pode ver a SUA company
  if (user.role === 'system_admin' && user.company_id !== companyId) {
    return <Navigate to="/dashboard" />;
  }
  
  return <>{children}</>;
};
```

**Tasks - Semana 4:**
- [ ] Criar `components/organization/company-switcher.tsx`
- [ ] Implementar route guards
- [ ] Atualizar sidebar para mostrar opções baseadas em role
- [ ] Criar rotas específicas para organization views
- [ ] Testar isolamento: system_admin NÃO deve ver outras companies
- [ ] Testar visibilidade: organization_admin DEVE ver todas as companies

---

### 1.5 Isolamento Multi-Tenant & Testing (Semana 5)

#### Garantir Isolamento de Dados

**Context Provider:**

```tsx
// lib/auth/session-context.tsx

interface SessionContextValue {
  user: User | null;
  organization: Organization | null;
  currentCompany: Company | null;
  companies: Company[];
  isLoading: boolean;
  canAccessCompany: (companyId: string) => boolean;
  canAccessAllCompanies: () => boolean;
}

export const SessionProvider: React.FC<{ children }> = ({ children }) => {
  const { data: session, isLoading } = useQuery('/api/auth/session');

  const canAccessCompany = (companyId: string): boolean => {
    if (!session?.user) return false;
    
    // Platform Owner: acesso a tudo
    if (session.user.role === 'platform_owner') return true;
    
    // Organization Admin: acesso a companies da sua org
    if (session.user.role === 'organization_admin') {
      return session.companies.some(c => c.id === companyId);
    }
    
    // System Admin e abaixo: apenas sua company
    return session.user.company_id === companyId;
  };

  const canAccessAllCompanies = (): boolean => {
    if (!session?.user) return false;
    return ['platform_owner', 'organization_admin'].includes(session.user.role);
  };

  return (
    <SessionContext.Provider value={{
      user: session?.user || null,
      organization: session?.organization || null,
      currentCompany: session?.currentCompany || null,
      companies: session?.companies || [],
      isLoading,
      canAccessCompany,
      canAccessAllCompanies
    }}>
      {children}
    </SessionContext.Provider>
  );
};
```

#### Testes de Isolamento

```tsx
// __tests__/multi-tenant-isolation.test.tsx

describe('Multi-Tenant Isolation', () => {
  describe('Organization Admin', () => {
    it('should see all companies in their organization', async () => {
      // Login como Organization Admin da Acme
      await loginAs('admin@acme.com', 'password');
      
      // Deve ver ambas as companies
      const companies = await screen.findAllByRole('article');
      expect(companies).toHaveLength(2);
      expect(screen.getByText('Acme Corp')).toBeInTheDocument();
      expect(screen.getByText('Acme Subsidiary')).toBeInTheDocument();
    });

    it('should NOT see companies from other organizations', async () => {
      await loginAs('admin@acme.com', 'password');
      
      // NÃO deve ver companies da Beta
      expect(screen.queryByText('Beta Inc')).not.toBeInTheDocument();
    });

    it('should be able to create company in their organization', async () => {
      await loginAs('admin@acme.com', 'password');
      
      await userEvent.click(screen.getByText('+ Add Company'));
      await userEvent.type(screen.getByLabelText('Company Name'), 'Acme EMEA');
      await userEvent.selectOptions(screen.getByLabelText('Country'), 'UK');
      await userEvent.click(screen.getByText('Create Company'));
      
      await waitFor(() => {
        expect(screen.getByText('Acme EMEA')).toBeInTheDocument();
      });
    });
  });

  describe('System Admin', () => {
    it('should only see their own company', async () => {
      // Login como System Admin da Acme Corp
      await loginAs('sysadmin@acme.com', 'password');
      
      // Deve ver apenas Acme Corp (não Acme Subsidiary)
      expect(screen.getByText('Acme Corp')).toBeInTheDocument();
      expect(screen.queryByText('Acme Subsidiary')).not.toBeInTheDocument();
    });

    it('should NOT be able to access other companies routes', async () => {
      await loginAs('sysadmin@acme.com', 'password');
      
      // Tentar acessar rota de outra company
      navigate('/company/other-company-id/dashboard');
      
      // Deve redirecionar para dashboard próprio
      await waitFor(() => {
        expect(window.location.pathname).toBe('/dashboard');
      });
    });

    it('should NOT see company switcher', async () => {
      await loginAs('sysadmin@acme.com', 'password');
      
      expect(screen.queryByRole('combobox', { name: /company/i })).not.toBeInTheDocument();
    });
  });

  describe('Cross-Organization Isolation', () => {
    it('Acme admin should not see Beta data', async () => {
      await loginAs('admin@acme.com', 'password');
      navigate('/dashboard/employees');
      
      const employees = await screen.findAllByRole('row');
      
      // Nenhum employee deve ser da Beta
      employees.forEach(row => {
        expect(row).not.toHaveTextContent('beta.com');
      });
    });

    it('Beta admin should not see Acme data', async () => {
      await loginAs('admin@beta.com', 'password');
      navigate('/dashboard/employees');
      
      const employees = await screen.findAllByRole('row');
      
      // Nenhum employee deve ser da Acme
      employees.forEach(row => {
        expect(row).not.toHaveTextContent('acme.com');
      });
    });
  });
});
```

**Tasks - Semana 5:**
- [ ] Implementar `SessionProvider` com validações de acesso
- [ ] Criar hook `useSession()` para componentes
- [ ] Escrever testes de isolamento (mínimo 10 cenários)
- [ ] Testar manualmente com 2 organizations diferentes
- [ ] Validar que RLS do backend está funcionando
- [ ] Documentar casos de teste aprovados

---

## 📅 FASE 2: Platform Owner

**Duração Estimada:** 2-3 semanas  
**Prioridade:** P1 (Alta)  
**Pré-requisito:** Fase 1 completa e testada

### 2.1 Bootstrap Platform Owner (Semana 6)

#### Endpoint Único de Bootstrap

**Importante:** Endpoint funciona apenas UMA VEZ (primeira execução)

```tsx
// app/platform/bootstrap/page.tsx

const BootstrapPlatformOwnerPage: React.FC = () => {
  const [isBootstrapped, setIsBootstrapped] = useState(false);
  const { mutate: bootstrap, isLoading, error } = useMutation(
    (data: BootstrapData) => api.post('/api/auth/bootstrap-platform-owner', data)
  );

  useEffect(() => {
    // Verificar se já existe Platform Owner
    api.get('/api/platform/status').then(response => {
      setIsBootstrapped(response.data.has_platform_owner);
    });
  }, []);

  if (isBootstrapped) {
    return (
      <div className="bootstrap-complete">
        <Alert variant="info">
          Platform Owner already exists. This endpoint is disabled.
        </Alert>
        <Button onClick={() => navigate('/login')}>Go to Login</Button>
      </div>
    );
  }

  return (
    <div className="bootstrap-page">
      <h1>Bootstrap Platform Owner</h1>
      <Alert variant="warning">
        ⚠️ This action can only be performed ONCE. 
        Create the first Platform Owner account carefully.
      </Alert>

      <form onSubmit={handleSubmit(bootstrap)}>
        <Input name="full_name" label="Full Name" required />
        <Input name="email" label="Email" type="email" required />
        <PasswordInput name="password" label="Password" required />
        <PasswordInput name="confirm_password" label="Confirm Password" required />
        
        <Button type="submit" isLoading={isLoading}>
          Create Platform Owner
        </Button>
      </form>
    </div>
  );
};
```

**Tasks - Semana 6:**
- [ ] Criar `app/platform/bootstrap/page.tsx`
- [ ] Implementar chamada `POST /api/auth/bootstrap-platform-owner`
- [ ] Adicionar validação de "já bootstrapped"
- [ ] Criar página de sucesso
- [ ] Testar fluxo completo

---

### 2.2 Platform Dashboard (Semana 7)

#### Dashboard Principal

```tsx
// app/platform/dashboard/page.tsx

const PlatformDashboard: React.FC = () => {
  const { data: stats } = useQuery('/api/platform/stats');
  const { data: pendingOrgs } = useQuery('/api/platform/organizations/pending');
  const { data: allOrgs } = useQuery('/api/platform/organizations');

  return (
    <div className="platform-dashboard">
      <PageHeader>
        <h1>Platform Administration</h1>
        <p>Global view of all organizations</p>
      </PageHeader>

      {/* KPIs */}
      <KPIGrid>
        <KPICard 
          title="Total Organizations"
          value={stats.total_organizations}
          trend={stats.org_growth}
        />
        <KPICard 
          title="Pending Approvals"
          value={stats.pending_approvals}
          variant="warning"
          action={() => navigate('/platform/approvals')}
        />
        <KPICard 
          title="Total Companies"
          value={stats.total_companies}
        />
        <KPICard 
          title="Total Users"
          value={stats.total_users}
        />
      </KPIGrid>

      {/* Pending Approvals Section */}
      {pendingOrgs.count > 0 && (
        <PendingApprovalsSection organizations={pendingOrgs.data} />
      )}

      {/* All Organizations Table */}
      <AllOrganizationsSection organizations={allOrgs.data} />
    </div>
  );
};
```

#### Pending Approvals Section

```tsx
// components/platform/pending-approvals-section.tsx

const PendingApprovalsSection: React.FC<{ organizations }> = ({ organizations }) => {
  const [approvingOrg, setApprovingOrg] = useState<string | null>(null);
  const [rejectingOrg, setRejectingOrg] = useState<string | null>(null);

  return (
    <section className="pending-approvals">
      <SectionHeader>
        <h2>Pending Approvals ({organizations.length})</h2>
      </SectionHeader>

      <div className="pending-list">
        {organizations.map(org => (
          <PendingOrgCard 
            key={org.id}
            organization={org}
            onApprove={() => setApprovingOrg(org.id)}
            onReject={() => setRejectingOrg(org.id)}
          />
        ))}
      </div>

      {approvingOrg && (
        <ApproveOrganizationModal 
          organizationId={approvingOrg}
          onClose={() => setApprovingOrg(null)}
        />
      )}

      {rejectingOrg && (
        <RejectOrganizationModal 
          organizationId={rejectingOrg}
          onClose={() => setRejectingOrg(null)}
        />
      )}
    </section>
  );
};
```

**Tasks - Semana 7:**
- [ ] Criar `app/platform/dashboard/page.tsx`
- [ ] Criar `components/platform/pending-approvals-section.tsx`
- [ ] Criar `components/platform/kpi-grid.tsx`
- [ ] Implementar chamadas aos endpoints do platform
- [ ] Testar visualização de dados

---

### 2.3 Approval Workflow (Semana 8)

#### Approve Organization Modal

```tsx
// components/platform/approve-organization-modal.tsx

const ApproveOrganizationModal: React.FC<{ organizationId, onClose }> = ({ 
  organizationId, 
  onClose 
}) => {
  const queryClient = useQueryClient();
  const { data: org } = useQuery(`/api/platform/organizations/${organizationId}`);
  
  const { mutate: approve, isLoading } = useMutation(
    (data: ApprovalData) => 
      api.post(`/api/platform/organizations/${organizationId}/approve`, data),
    {
      onSuccess: () => {
        toast.success(`Organization "${org.name}" approved successfully!`);
        queryClient.invalidateQueries('/api/platform/organizations');
        onClose();
      }
    }
  );

  return (
    <Modal isOpen onClose={onClose}>
      <ModalHeader>
        <h2>Approve Organization</h2>
      </ModalHeader>

      <ModalBody>
        <Alert variant="info">
          You are about to approve <strong>{org.name}</strong>.
          The organization admin will be notified and gain full access.
        </Alert>

        <form onSubmit={handleSubmit(approve)}>
          <Select 
            name="tier" 
            label="Organization Tier" 
            required
            options={[
              { value: 'standard', label: 'Standard' },
              { value: 'premium', label: 'Premium' },
              { value: 'enterprise', label: 'Enterprise' }
            ]}
          />

          <Textarea 
            name="notes" 
            label="Approval Notes (Optional)"
            placeholder="Add any notes about this approval..."
            rows={3}
          />
        </form>

        <OrganizationDetails organization={org} />
      </ModalBody>

      <ModalFooter>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button 
          variant="primary" 
          onClick={handleSubmit} 
          isLoading={isLoading}
        >
          Confirm Approval
        </Button>
      </ModalFooter>
    </Modal>
  );
};
```

#### Reject Organization Modal

```tsx
// components/platform/reject-organization-modal.tsx

const RejectOrganizationModal: React.FC<{ organizationId, onClose }> = ({ 
  organizationId, 
  onClose 
}) => {
  const queryClient = useQueryClient();
  const { data: org } = useQuery(`/api/platform/organizations/${organizationId}`);
  
  const { mutate: reject, isLoading } = useMutation(
    (data: RejectionData) => 
      api.post(`/api/platform/organizations/${organizationId}/reject`, data),
    {
      onSuccess: () => {
        toast.success(`Organization "${org.name}" rejected.`);
        queryClient.invalidateQueries('/api/platform/organizations');
        onClose();
      }
    }
  );

  return (
    <Modal isOpen onClose={onClose}>
      <ModalHeader>
        <h2>Reject Organization</h2>
      </ModalHeader>

      <ModalBody>
        <Alert variant="warning">
          ⚠️ You are about to reject <strong>{org.name}</strong>.
          The organization admin will be notified.
        </Alert>

        <form onSubmit={handleSubmit(reject)}>
          <Textarea 
            name="notes" 
            label="Rejection Reason (Required)"
            placeholder="Explain why this organization is being rejected..."
            rows={4}
            required
          />
        </form>

        <OrganizationDetails organization={org} />
      </ModalBody>

      <ModalFooter>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button 
          variant="danger" 
          onClick={handleSubmit} 
          isLoading={isLoading}
        >
          Confirm Rejection
        </Button>
      </ModalFooter>
    </Modal>
  );
};
```

**Tasks - Semana 8:**
- [ ] Criar `components/platform/approve-organization-modal.tsx`
- [ ] Criar `components/platform/reject-organization-modal.tsx`
- [ ] Implementar `POST /api/platform/organizations/:id/approve`
- [ ] Implementar `POST /api/platform/organizations/:id/reject`
- [ ] Adicionar notificações (toast)
- [ ] Testar fluxo completo de aprovação/rejeição

---

## 📅 FASE 3: Melhorias & Refinamentos

**Duração Estimada:** 2 semanas  
**Prioridade:** P2 (Média)  
**Pré-requisito:** Fases 1 e 2 completas

### 3.1 Relatórios Consolidados (Semana 9)

#### Organization-wide Reports

```tsx
// app/dashboard/organization/reports/page.tsx

const OrganizationReportsPage: React.FC = () => {
  const [reportType, setReportType] = useState<'payroll' | 'employees' | 'leave'>('payroll');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  return (
    <div className="organization-reports">
      <PageHeader>
        <h1>Organization Reports</h1>
        <p>Consolidated data from all companies</p>
      </PageHeader>

      <ReportFilters 
        reportType={reportType}
        onReportTypeChange={setReportType}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
      />

      {reportType === 'payroll' && (
        <ConsolidatedPayrollReport dateRange={dateRange} />
      )}

      {reportType === 'employees' && (
        <ConsolidatedEmployeesReport />
      )}

      {reportType === 'leave' && (
        <ConsolidatedLeaveReport dateRange={dateRange} />
      )}
    </div>
  );
};
```

**Tasks - Semana 9:**
- [ ] Criar página de relatórios consolidados
- [ ] Implementar filtros de data/tipo
- [ ] Criar componentes de relatórios (Payroll, Employees, Leave)
- [ ] Adicionar exportação para Excel/PDF
- [ ] Testar com múltiplas companies

---

### 3.2 Analytics & Optimizações (Semana 10)

#### Analytics Dashboard

```tsx
// app/dashboard/organization/analytics/page.tsx

const OrganizationAnalyticsPage: React.FC = () => {
  const { data: analytics } = useQuery('/api/reports/organization/analytics');

  return (
    <div className="organization-analytics">
      <PageHeader>
        <h1>Organization Analytics</h1>
      </PageHeader>

      <div className="analytics-grid">
        <Chart 
          type="line" 
          title="Employee Growth" 
          data={analytics.employee_growth}
        />
        <Chart 
          type="bar" 
          title="Payroll by Company" 
          data={analytics.payroll_by_company}
        />
        <Chart 
          type="pie" 
          title="Employees by Department" 
          data={analytics.employees_by_department}
        />
        <Chart 
          type="line" 
          title="Leave Trends" 
          data={analytics.leave_trends}
        />
      </div>
    </div>
  );
};
```

**Optimizações:**
- [ ] Implementar caching de queries (React Query)
- [ ] Lazy loading de components
- [ ] Optimistic updates
- [ ] Skeleton loaders
- [ ] Infinite scroll em listas grandes

**Tasks - Semana 10:**
- [ ] Criar dashboard de analytics
- [ ] Implementar gráficos (Chart.js ou Recharts)
- [ ] Adicionar optimizações de performance
- [ ] Code splitting
- [ ] Testes de performance

---

## 🏗️ Arquitetura de Componentes

### Estrutura de Pastas Proposta

```
components/
  organization/
    organization-header.tsx
    organization-kpis.tsx
    companies-section.tsx
    company-card.tsx
    company-switcher.tsx
    add-company-modal.tsx
    pending-approval-view.tsx
    organization-details.tsx
    
  platform/
    platform-dashboard.tsx
    pending-approvals-section.tsx
    pending-org-card.tsx
    approve-organization-modal.tsx
    reject-organization-modal.tsx
    all-organizations-table.tsx
    organization-stats.tsx
    kpi-grid.tsx
    kpi-card.tsx
    
  common/
    status-badge.tsx
    tier-badge.tsx
    role-badge.tsx
    empty-state.tsx
    loading-skeleton.tsx
    
lib/
  services/
    organizations.ts
    companies.ts
    platform.ts
    
  hooks/
    useSession.ts
    useOrganization.ts
    useCompanies.ts
    usePlatformStats.ts
    
  auth/
    session-context.tsx
    route-guards.tsx
    permissions.ts
```

### Shared Types

```typescript
// lib/types/organization.ts

export interface Organization {
  id: string;
  name: string;
  is_active: boolean;
  tier: 'standard' | 'premium' | 'enterprise';
  approval_status: 'pending' | 'approved' | 'rejected';
  approval_notes?: string;
  approved_by?: string;
  approved_at?: Date;
  created_at: Date;
  updated_at: Date;
  
  // Agregações
  companies_count?: number;
  users_count?: number;
  active_users_count?: number;
}

export interface Company {
  id: string;
  organization_id: string;
  name: string;
  country: string;
  business_email: string;
  is_active: boolean;
  created_at: Date;
  
  // Agregações
  employees_count?: number;
  active_employees?: number;
  departments_count?: number;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  organization_id: string | null;
  company_id: string | null;
  is_active: boolean;
  can_login: boolean;
}

export type UserRole = 
  | 'platform_owner'
  | 'organization_admin'
  | 'system_admin'
  | 'hr_manager'
  | 'payroll_manager'
  | 'operational_manager'
  | 'employee';
```

---

## 📦 Plano de Migração

### Estratégia de Migração de Dados Existentes (se aplicável)

**Se já existem companies no sistema:**

1. **Criar Organizations para companies existentes:**
```sql
-- Script de migração (backend)
INSERT INTO organizations (id, name, is_active, tier, approval_status)
SELECT 
  gen_random_uuid(),
  name || ' Organization',
  true,
  'standard',
  'approved'
FROM companies
WHERE organization_id IS NULL;

UPDATE companies 
SET organization_id = (SELECT id FROM organizations WHERE name = companies.name || ' Organization')
WHERE organization_id IS NULL;
```

2. **Converter system_admins para organization_admins:**
```sql
UPDATE users
SET role = 'organization_admin'
WHERE role = 'system_admin' 
  AND id IN (
    -- Apenas o admin principal de cada company
    SELECT DISTINCT ON (company_id) id
    FROM users
    WHERE role = 'system_admin'
    ORDER BY company_id, created_at ASC
  );
```

---

## ✅ Checklist de Implementação

### FASE 1: Organizations & Multi-Company
- [ ] **Semana 1:** Organization Registration Flow
  - [ ] Atualizar signup form
  - [ ] Criar registration success page
  - [ ] Testar registo end-to-end
  
- [ ] **Semana 2:** Organization Dashboard
  - [ ] Criar organization dashboard
  - [ ] Criar pending approval view
  - [ ] Criar companies section
  - [ ] Criar company cards
  
- [ ] **Semana 3:** Multi-Company Management
  - [ ] Criar add company modal
  - [ ] Implementar CRUD companies
  - [ ] Testar criação de múltiplas companies
  
- [ ] **Semana 4:** Company Switcher & Routing
  - [ ] Criar company switcher
  - [ ] Implementar route guards
  - [ ] Criar rotas organization-specific
  - [ ] Testar isolamento de rotas
  
- [ ] **Semana 5:** Testing & Isolation
  - [ ] Criar session context
  - [ ] Escrever testes de isolamento
  - [ ] Testar manualmente com 2+ orgs
  - [ ] Validar RLS backend

### FASE 2: Platform Owner
- [ ] **Semana 6:** Bootstrap
  - [ ] Criar bootstrap page
  - [ ] Implementar bootstrap flow
  
- [ ] **Semana 7:** Platform Dashboard
  - [ ] Criar platform dashboard
  - [ ] Implementar KPIs
  - [ ] Criar pending approvals section
  
- [ ] **Semana 8:** Approval Workflow
  - [ ] Criar approve modal
  - [ ] Criar reject modal
  - [ ] Testar aprovação/rejeição

### FASE 3: Melhorias
- [ ] **Semana 9:** Relatórios Consolidados
- [ ] **Semana 10:** Analytics & Optimizações

---

## 📊 Métricas de Sucesso

### Critérios de Aceitação - Fase 1

✅ Organization Admin consegue:
- Registar nova organization com primeira company
- Ver status de aprovação (pending/approved)
- Criar múltiplas companies
- Ver todas as companies da sua org
- Não ver companies de outras orgs

✅ System Admin consegue:
- Ver apenas a SUA company
- Não consegue criar companies
- Não vê company switcher

✅ Isolamento Multi-Tenant:
- Dados de diferentes orgs são completamente isolados
- Testes de isolamento passam 100%
- RLS funciona corretamente

### Critérios de Aceitação - Fase 2

✅ Platform Owner consegue:
- Bootstrap (primeira vez)
- Ver todas as organizations
- Ver pending approvals
- Aprovar/rejeitar organizations
- Ver estatísticas globais

✅ Workflow de Aprovação:
- Organization criada fica pending
- Organization Admin não consegue ações admin até aprovação
- Email de aprovação é enviado (se implementado)

---

## 🚀 Próximos Passos

1. **Revisão deste documento** com a equipa
2. **Aprovação da estratégia** em fases
3. **Setup do ambiente de desenvolvimento**
4. **Início da Fase 1 - Semana 1**

---

**Documento criado em:** 18 de Dezembro de 2025  
**Autor:** Development Team  
**Status:** Pronto para Implementação 🚀
