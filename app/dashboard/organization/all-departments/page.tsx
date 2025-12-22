import { getOrganizationDepartments, OrganizationDepartment } from '@/lib/services/organization-data';
import { getAllCompanies } from '@/lib/services/companies';
import { Card } from '@/components/dashboard/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Users } from 'lucide-react';

export default async function OrganizationDepartmentsPage({
  searchParams
}: {
  searchParams: Promise<{ company?: string }>;
}) {
  const params = await searchParams;
  const companyId = params.company;

  const [departmentsResult, companiesResult] = await Promise.all([
    getOrganizationDepartments({ company_id: companyId }),
    getAllCompanies()
  ]);

  const departments = departmentsResult.data;
  const companies = companiesResult.data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">All Departments</h1>
      </div>

      {/* Summary Card */}
      <Card>
        <p className="text-sm text-muted-foreground">Total Departments</p>
        <div className="text-2xl font-bold mt-2">{departments.length}</div>
      </Card>

      {/* Filter */}
      <Card>
        <div className="flex-1">
          <label className="text-sm font-medium mb-2 block">Company</label>
          <select className="w-full px-3 py-2 border rounded-lg" defaultValue={companyId || 'all'}>
            <option value="all">All Companies</option>
            {companies.map(company => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Departments Grid */}
      {departments.length === 0 ? (
        <Card>
          <p className="text-center text-muted-foreground">
            No departments available
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {departments.map((dept) => (
            <Card key={dept.id}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold">{dept.name}</h3>
                <Badge variant={dept.is_active ? 'default' : 'secondary'}>
                  {dept.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  <span>{dept.company_name}</span>
                </div>
                {dept.code && (
                  <div className="text-sm">
                    <span className="font-medium">Code:</span> {dept.code}
                  </div>
                )}
                {dept.manager_name && (
                  <div className="text-sm">
                    <span className="font-medium">Manager:</span> {dept.manager_name}
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4" />
                  <span className="font-medium">{dept.employees_count}</span>
                  <span className="text-muted-foreground">employees</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
