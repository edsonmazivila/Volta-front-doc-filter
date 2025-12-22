'use client';

import { Company, OrganizationStats } from "@/lib/types/organization";
import { CompanySelector } from "./company-selector";
import { useCompanyContext } from "./company-context";
import { useCompanyStats } from "@/lib/hooks/useCompanyStats";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Card, CardHeader } from "@/components/dashboard/card";
import { Button } from "@/components/ui";
import Link from "next/link";
import { Trans } from "@lingui/react/macro";
import { useMemo, useState, useEffect } from "react";
import { ConsolidatedReports } from "./consolidated-reports";
import { 
  getConsolidatedPayrollReport,
  getConsolidatedEmployeesReport,
  getConsolidatedLeaveReport,
  ConsolidatedPayrollReport,
  ConsolidatedEmployeesReport,
  ConsolidatedLeaveReport
} from "@/lib/services/organization-reports";

interface OrganizationDashboardClientProps {
  companies: Company[];
  stats: OrganizationStats;
}

export function OrganizationDashboardClient({
  companies,
  stats: allStats
}: OrganizationDashboardClientProps) {
  const { selectedCompany, setSelectedCompany } = useCompanyContext();
  const { stats: companyStats, isLoading: loadingCompanyStats } = useCompanyStats(selectedCompany);
  
  // Consolidated reports data
  const [consolidatedData, setConsolidatedData] = useState<{
    payroll?: ConsolidatedPayrollReport;
    employees?: ConsolidatedEmployeesReport;
    leave?: ConsolidatedLeaveReport;
  }>({});

  // Fetch consolidated reports when viewing "All Companies"
  useEffect(() => {
    if (selectedCompany === 'all') {
      Promise.all([
        getConsolidatedPayrollReport().catch(() => undefined),
        getConsolidatedEmployeesReport().catch(() => undefined),
        getConsolidatedLeaveReport().catch(() => undefined),
      ]).then(([payroll, employees, leave]) => {
        setConsolidatedData({ payroll, employees, leave });
      });
    }
  }, [selectedCompany]);

  // Filter companies and determine display stats
  const { filteredCompanies, displayStats, isLoadingStats } = useMemo(() => {
    if (selectedCompany === 'all') {
      return {
        filteredCompanies: companies,
        displayStats: allStats,
        isLoadingStats: false
      };
    }

    const selectedCompanyData = companies.find(c => c.id === selectedCompany);
    if (!selectedCompanyData) {
      return {
        filteredCompanies: companies,
        displayStats: allStats,
        isLoadingStats: false
      };
    }

    // Use company-specific stats if available
    const stats = companyStats || {
      employees_count: 0,
      active_employees: 0,
      departments_count: 0,
      total_payroll_mtd: 0
    };

    return {
      filteredCompanies: [selectedCompanyData],
      displayStats: {
        ...stats,
        companies_count: 1
      },
      isLoadingStats: loadingCompanyStats
    };
  }, [selectedCompany, companies, allStats, companyStats, loadingCompanyStats]);

  return (
    <>
      {/* Company Switcher */}
      <div className="mb-6">
        <CompanySelector
          companies={companies}
          currentCompany={selectedCompany}
          onChange={setSelectedCompany}
          showAll={true}
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatsCard
          label={selectedCompany === 'all' ? "Total Companies" : "Company"}
          value={isLoadingStats ? '...' : (selectedCompany === 'all' ? displayStats.companies_count : filteredCompanies[0]?.name || '-')}
        />
        <StatsCard
          label={"Total Employees"}
          value={isLoadingStats ? '...' : displayStats.employees_count}
        />
        <StatsCard
          label={"Active Employees"}
          value={isLoadingStats ? '...' : displayStats.active_employees}
        />
        <StatsCard
          label={"Monthly Payroll"}
          value={isLoadingStats ? '...' : `$${(displayStats.total_payroll_mtd ?? 0).toLocaleString()}`}
        />
      </div>

      {/* Companies Section */}
      <Card>
        <CardHeader
          title={selectedCompany === 'all' ? "All Companies" : "Company Details"}
          action={
            <Link href="/dashboard/organization/companies/new">
              <Button>
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <Trans>New Company</Trans>
              </Button>
            </Link>
          }
        />
        <div className="p-6">
          {filteredCompanies.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-neutral-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                <Trans>No companies yet</Trans>
              </p>
              <Link href="/dashboard/organization/companies/new">
                <Button>
                  <Trans>Create Your First Company</Trans>
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCompanies.map((company) => (
                <Link
                  key={company.id}
                  href={`/dashboard/organization/companies/${company.id}`}
                  className="group"
                >
                  <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-6 hover:shadow-lg transition-all hover:border-blue-500 dark:hover:border-blue-500">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {company.name}
                        </h3>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                          {company.country}
                        </p>
                      </div>
                      <div className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        company.is_active
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-neutral-100 text-neutral-800 dark:bg-neutral-900/20 dark:text-neutral-400'
                      }`}>
                        {company.is_active ? <Trans>Active</Trans> : <Trans>Inactive</Trans>}
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span className="truncate">{company.business_email}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-neutral-200 dark:border-neutral-700">
                      <span className="text-sm text-neutral-500 dark:text-neutral-400">
                        <Trans>View Details</Trans>
                      </span>
                      <svg className="w-5 h-5 text-neutral-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Quick Actions */}
      {selectedCompany === 'all' && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 dark:text-white">
                    <Trans>Manage Users</Trans>
                  </h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    <Trans>Across all companies</Trans>
                  </p>
                </div>
              </div>
              <Link href="/dashboard/employees">
                <Button variant="outline" className="w-full">
                  <Trans>View All Users</Trans>
                </Button>
              </Link>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 dark:text-white">
                    <Trans>Reports</Trans>
                  </h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    <Trans>Organization-wide</Trans>
                  </p>
                </div>
              </div>
              <Link href="/dashboard/reports">
                <Button variant="outline" className="w-full">
                  <Trans>View Reports</Trans>
                </Button>
              </Link>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 dark:text-white">
                    <Trans>Settings</Trans>
                  </h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    <Trans>Organization config</Trans>
                  </p>
                </div>
              </div>
              <Link href="/dashboard/settings">
                <Button variant="outline" className="w-full">
                  <Trans>Manage Settings</Trans>
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
