'use client';

import { useState, useEffect } from 'react';
import { getCompanyStats } from '@/lib/services/companies';

interface CompanyStats {
  employees_count: number;
  active_employees: number;
  departments_count: number;
  pending_timesheets: number;
  active_leave_requests: number;
  total_payroll_mtd?: number; // Optional since not returned by company stats
}

export function useCompanyStats(companyId: string | 'all') {
  const [stats, setStats] = useState<CompanyStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (companyId === 'all') {
      // Don't fetch for "all" - use organization-wide stats instead
      setStats(null);
      return;
    }

    const fetchStats = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await getCompanyStats(companyId);
        setStats({ ...data, total_payroll_mtd: 0 }); // Add missing field with default value
      } catch (err) {
        console.error('[useCompanyStats] Failed to fetch:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch company stats');
        setStats(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [companyId]);

  return { stats, isLoading, error };
}
