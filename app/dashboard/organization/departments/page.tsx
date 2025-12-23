import { getOrganizationLeaves } from '@/lib/services/organization-data';
import { getAllCompanies } from '@/lib/services/companies';
import { Card } from '@/components/dashboard/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default async function OrganizationLeavesPage({
  searchParams
}: {
  searchParams: Promise<{ company?: string; status?: string }>;
}) {
  const params = await searchParams;
  const companyId = params.company;
  const status = params.status;

  const [leavesResult, companiesResult] = await Promise.all([
    getOrganizationLeaves({ company_id: companyId, status }),
    getAllCompanies()
  ]);

  const leaves = leavesResult.data;
  const companies = companiesResult.data;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-500';
      case 'SUBMITTED': return 'bg-blue-500';
      case 'REJECTED': return 'bg-red-500';
      case 'DRAFT': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">All Leave Requests</h1>
      </div>

      {/* Summary Card */}
      <Card>
        <p className="text-sm text-muted-foreground">Total Leave Requests</p>
        <div className="text-2xl font-bold mt-2">{leaves.length}</div>
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
              <option value="DRAFT">Draft</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
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
              <TableHead>Leave Type</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead className="text-right">Days</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaves.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No leave requests available
                </TableCell>
              </TableRow>
            ) : (
              leaves.map((leave) => (
                <TableRow key={leave.id}>
                  <TableCell className="font-medium">{leave.company_name}</TableCell>
                  <TableCell>{leave.employee_name}</TableCell>
                  <TableCell>{leave.leave_type}</TableCell>
                  <TableCell>{new Date(leave.start_date).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(leave.end_date).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">{leave.total_days}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(leave.status)}>
                      {leave.status}
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
