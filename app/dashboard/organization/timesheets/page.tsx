import { getOrganizationTimesheets } from '@/lib/services/organization-data';
import { getAllCompanies } from '@/lib/services/companies';
import { Card } from '@/components/dashboard/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default async function OrganizationTimesheetsPage({
  searchParams
}: {
  searchParams: Promise<{ company?: string; status?: string }>;
}) {
  const params = await searchParams;
  const companyId = params.company;
  const status = params.status;

  const [timesheetsResult, companiesResult] = await Promise.all([
    getOrganizationTimesheets({ company_id: companyId, status }),
    getAllCompanies()
  ]);

  const timesheets = timesheetsResult.data;
  const companies = companiesResult.data;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500';
      case 'submitted': return 'bg-blue-500';
      case 'rejected': return 'bg-red-500';
      case 'draft': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">All Timesheets</h1>
      </div>

      {/* Summary Card */}
      <Card>
        <p className="text-sm text-muted-foreground">Total Timesheets</p>
        <div className="text-2xl font-bold mt-2">{timesheets.length}</div>
      </Card>

      {/* Filters */}
      <Card>
        <div className="flex gap-4">
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
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Status</label>
            <select className="w-full px-3 py-2 border rounded-lg" defaultValue={status || 'all'}>
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Period</TableHead>
                <TableHead className="text-right">Regular Hours</TableHead>
                <TableHead className="text-right">Overtime</TableHead>
                <TableHead className="text-right">Total Hours</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {timesheets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No timesheet data available
                  </TableCell>
                </TableRow>
              ) : (
                timesheets.map((timesheet) => (
                  <TableRow key={timesheet.id}>
                    <TableCell className="font-medium">{timesheet.company_name}</TableCell>
                    <TableCell>{timesheet.employee_name}</TableCell>
                    <TableCell>
                      {new Date(timesheet.pay_period_start).toLocaleDateString()} - {new Date(timesheet.pay_period_end).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">{timesheet.regular_hours.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{timesheet.overtime_hours.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{timesheet.total_hours.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(timesheet.status)}>
                        {timesheet.status}
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
