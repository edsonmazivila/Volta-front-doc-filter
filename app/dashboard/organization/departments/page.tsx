import { getOrganizationDepartments } from '@/lib/services/organization-data';
import { getAllCompanies } from '@/lib/services/companies';
import { Card } from '@/components/dashboard/card';
import { OrganizationDepartmentManagement } from '@/components/departments/organization-department-management';

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

  // Calculate stats
  const totalDepartments = departments.length;
  const activeDepartments = departments.filter(d => d.is_active).length;
  const inactiveDepartments = departments.filter(d => !d.is_active).length;
  const withManager = departments.filter(d => d.manager_name).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Departments</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <p className="text-sm text-muted-foreground">Total Departments</p>
          <div className="text-2xl font-bold mt-2">{totalDepartments}</div>
        </Card>
        <Card>
          <p className="text-sm text-muted-foreground">Active</p>
          <div className="text-2xl font-bold mt-2 text-green-600">{activeDepartments}</div>
        </Card>
        <Card>
          <p className="text-sm text-muted-foreground">Inactive</p>
          <div className="text-2xl font-bold mt-2 text-red-600">{inactiveDepartments}</div>
        </Card>
        <Card>
          <p className="text-sm text-muted-foreground">With Manager</p>
          <div className="text-2xl font-bold mt-2 text-blue-600">{withManager}</div>
        </Card>
      </div>

      {/* Department Management Component */}
      <OrganizationDepartmentManagement 
        departments={departments}
        companies={companies}
        initialCompanyFilter={companyId}
      />
    </div>
  );
}
