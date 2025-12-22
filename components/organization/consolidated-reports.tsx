'use client';

import { Trans } from '@lingui/react/macro';
import { t } from '@lingui/core/macro';
import { Card, CardHeader } from '@/components/dashboard/card';
import { useState } from 'react';
import { 
  ConsolidatedPayrollReport,
  ConsolidatedEmployeesReport,
  ConsolidatedLeaveReport 
} from '@/lib/services/organization-reports';
import { Building2, Users, Calendar, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';

interface ConsolidatedReportsProps {
  payrollData?: ConsolidatedPayrollReport;
  employeesData?: ConsolidatedEmployeesReport;
  leaveData?: ConsolidatedLeaveReport;
}

export function ConsolidatedReports({ 
  payrollData, 
  employeesData, 
  leaveData 
}: ConsolidatedReportsProps) {
  const [activeTab, setActiveTab] = useState<'payroll' | 'employees' | 'leave'>('payroll');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">
          <Trans>Consolidated Reports</Trans>
        </h2>
        <p className="text-sm text-muted-foreground">
          <Trans>View aggregated data across all your companies</Trans>
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('payroll')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'payroll'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              <Trans>Payroll</Trans>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('employees')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'employees'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <Trans>Employees</Trans>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('leave')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'leave'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              <Trans>Leave</Trans>
            </div>
          </button>
        </nav>
      </div>

      {/* Content */}
      <div>
        {activeTab === 'payroll' && <PayrollReportView data={payrollData} />}
        {activeTab === 'employees' && <EmployeesReportView data={employeesData} />}
        {activeTab === 'leave' && <LeaveReportView data={leaveData} />}
      </div>
    </div>
  );
}

function PayrollReportView({ data }: { data?: ConsolidatedPayrollReport }) {
  if (!data) {
    return (
      <Card>
        <div className="p-8 text-center text-gray-500">
          <Trans>No payroll data available</Trans>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                <Trans>Total Gross Pay</Trans>
              </p>
              <p className="text-2xl font-bold mt-2">
                ${data.total_gross_pay.toLocaleString()}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                <Trans>Total Net Pay</Trans>
              </p>
              <p className="text-2xl font-bold mt-2">
                ${data.total_net_pay.toLocaleString()}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                <Trans>Total Deductions</Trans>
              </p>
              <p className="text-2xl font-bold mt-2">
                ${data.total_deductions.toLocaleString()}
              </p>
            </div>
            <TrendingDown className="h-8 w-8 text-red-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                <Trans>Employees</Trans>
              </p>
              <p className="text-2xl font-bold mt-2">
                {data.total_employees}
              </p>
            </div>
            <Users className="h-8 w-8 text-purple-500" />
          </div>
        </Card>
      </div>

      {/* By Company Table */}
      <Card>
        <CardHeader title={t`Payroll by Company`} />
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <Trans>Company</Trans>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <Trans>Employees</Trans>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <Trans>Gross Pay</Trans>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <Trans>Net Pay</Trans>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <Trans>Deductions</Trans>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <Trans>Taxes</Trans>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.by_company.map((company) => (
                <tr key={company.company_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">{company.company_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {company.employees_count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${company.gross_pay.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${company.net_pay.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${company.deductions.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${company.taxes.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function EmployeesReportView({ data }: { data?: ConsolidatedEmployeesReport }) {
  if (!data) {
    return (
      <Card>
        <div className="p-8 text-center text-gray-500">
          <Trans>No employee data available</Trans>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                <Trans>Total Employees</Trans>
              </p>
              <p className="text-2xl font-bold mt-2">{data.total_employees}</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                <Trans>Active</Trans>
              </p>
              <p className="text-2xl font-bold mt-2 text-green-600">
                {data.active_employees}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                <Trans>Inactive</Trans>
              </p>
              <p className="text-2xl font-bold mt-2 text-gray-600">
                {data.inactive_employees}
              </p>
            </div>
            <TrendingDown className="h-8 w-8 text-gray-400" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                <Trans>Companies</Trans>
              </p>
              <p className="text-2xl font-bold mt-2">{data.total_companies}</p>
            </div>
            <Building2 className="h-8 w-8 text-purple-500" />
          </div>
        </Card>
      </div>

      {/* By Company Table */}
      <Card>
        <CardHeader title={t`Employees by Company`} />
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <Trans>Company</Trans>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <Trans>Total</Trans>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <Trans>Active</Trans>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <Trans>Inactive</Trans>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <Trans>Departments</Trans>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.by_company.map((company) => (
                <tr key={company.company_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">{company.company_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {company.total_employees}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                    {company.active_employees}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {company.inactive_employees}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {company.departments_count}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function LeaveReportView({ data }: { data?: ConsolidatedLeaveReport }) {
  if (!data) {
    return (
      <Card>
        <div className="p-8 text-center text-gray-500">
          <Trans>No leave data available</Trans>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                <Trans>Total Requests</Trans>
              </p>
              <p className="text-2xl font-bold mt-2">{data.total_requests}</p>
            </div>
            <Calendar className="h-8 w-8 text-blue-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                <Trans>Pending</Trans>
              </p>
              <p className="text-2xl font-bold mt-2 text-yellow-600">
                {data.pending_requests}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-yellow-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                <Trans>Approved</Trans>
              </p>
              <p className="text-2xl font-bold mt-2 text-green-600">
                {data.approved_requests}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                <Trans>Total Days</Trans>
              </p>
              <p className="text-2xl font-bold mt-2">{data.total_days_taken}</p>
            </div>
            <Calendar className="h-8 w-8 text-purple-500" />
          </div>
        </Card>
      </div>

      {/* By Company Table */}
      <Card>
        <CardHeader title={t`Leave Requests by Company`} />
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <Trans>Company</Trans>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <Trans>Total Requests</Trans>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <Trans>Pending</Trans>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <Trans>Approved</Trans>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <Trans>Total Days</Trans>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.by_company.map((company) => (
                <tr key={company.company_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">{company.company_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {company.total_requests}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600">
                    {company.pending_requests}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                    {company.approved_requests}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {company.total_days}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Upcoming Leaves */}
      {data.upcoming_leaves.length > 0 && (
        <Card>
          <CardHeader title={t`Upcoming Leaves`} />
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <Trans>Employee</Trans>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <Trans>Company</Trans>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <Trans>Leave Type</Trans>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <Trans>Start Date</Trans>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <Trans>End Date</Trans>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <Trans>Days</Trans>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.upcoming_leaves.map((leave, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium">
                      {leave.employee_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {leave.company_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                        {leave.leave_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(leave.start_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(leave.end_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {leave.days}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
