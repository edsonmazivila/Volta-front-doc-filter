import { getOrganizationPayrolls } from '@/lib/services/organization-data';
import { getAllCompanies } from '@/lib/services/companies';
import { Card } from '@/components/dashboard/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { PayrollFilters } from '@/components/organization/payroll-filters';

export default async function OrganizationPayrollsPage({
  searchParams
}: {
  searchParams: Promise<{ company?: string; status?: string }>;
}) {
  const params = await searchParams;
  const companyId = params.company;
  const status = params.status;

  const [payrollsResult, companiesResult] = await Promise.all([
    getOrganizationPayrolls({ company_id: companyId, status }),
    getAllCompanies()
  ]);

  const payrolls = payrollsResult.data;
  const companies = companiesResult.data;

  // Calculate summary
  const totalGross = payrolls.reduce((sum, p) => sum + (p.gross_amount || 0), 0);
  const totalNet = payrolls.reduce((sum, p) => sum + (p.net_amount || 0), 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-500';
      case 'processed': return 'bg-blue-500';
      case 'draft': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">All Payrolls</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-sm text-muted-foreground">Total Payrolls</p>
          <div className="text-2xl font-bold mt-2">{payrolls.length}</div>
        </Card>
        <Card>
          <p className="text-sm text-muted-foreground">Total Gross Amount</p>
          <div className="text-2xl font-bold mt-2">{formatCurrency(totalGross)}</div>
        </Card>
        <Card>
          <p className="text-sm text-muted-foreground">Total Net Amount</p>
          <div className="text-2xl font-bold mt-2">{formatCurrency(totalNet)}</div>
        </Card>
      </div>

      {/* Filters */}
      <PayrollFilters companies={companies} />

      {/* Table */}
      <Card>
        <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Pay Date</TableHead>
                <TableHead className="text-right">Employees</TableHead>
                <TableHead className="text-right">Gross Amount</TableHead>
                <TableHead className="text-right">Net Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payrolls.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No payroll data available
                  </TableCell>
                </TableRow>
              ) : (
                payrolls.map((payroll) => (
                  <TableRow key={payroll.id}>
                    <TableCell className="font-medium">{payroll.company_name}</TableCell>
                    <TableCell>
                      {new Date(payroll.pay_period_start).toLocaleDateString()} - {new Date(payroll.pay_period_end).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {payroll.pay_date ? new Date(payroll.pay_date).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell className="text-right">{payroll.total_employees}</TableCell>
                    <TableCell className="text-right">{formatCurrency(payroll.gross_amount)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(payroll.net_amount)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(payroll.status)}>
                        {payroll.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
      </Card>
    </div>
  );
}
