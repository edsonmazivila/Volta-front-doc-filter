'use client';

import { Company } from "@/lib/types/organization";
import { Trans } from "@lingui/react/macro";
import { useState, useRef, useEffect } from "react";

interface CompanySelectorProps {
  companies: Company[];
  currentCompany: string | 'all'; // company ID or 'all'
  onChange: (companyId: string | 'all') => void;
  showAll?: boolean; // Organization Admin can see "All Companies"
}

export function CompanySelector({ 
  companies, 
  currentCompany, 
  onChange,
  showAll = false 
}: CompanySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const selectedCompany = companies.find(c => c.id === currentCompany);
  const displayName = currentCompany === 'all' 
    ? 'All Companies' 
    : selectedCompany?.name || 'Select Company';

  const handleSelect = (companyId: string | 'all') => {
    onChange(companyId);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors min-w-[240px]"
      >
        {/* Building Icon */}
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
          <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>

        {/* Company Name */}
        <div className="flex-1 text-left">
          <div className="text-xs text-neutral-500 dark:text-neutral-400">
            <Trans>Company</Trans>
          </div>
          <div className="text-sm font-medium text-neutral-900 dark:text-white truncate">
            {displayName}
          </div>
        </div>

        {/* Chevron */}
        <svg 
          className={`w-4 h-4 text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg z-50 max-h-[400px] overflow-y-auto">
          {/* All Companies Option (Organization Admin only) */}
          {showAll && (
            <>
              <button
                onClick={() => handleSelect('all')}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors ${
                  currentCompany === 'all' ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium text-neutral-900 dark:text-white">
                    <Trans>All Companies</Trans>
                  </div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400">
                    <Trans>Aggregated view</Trans> • {companies.length} {companies.length === 1 ? 'company' : 'companies'}
                  </div>
                </div>
                {currentCompany === 'all' && (
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
              <div className="border-t border-neutral-200 dark:border-neutral-700 my-1" />
            </>
          )}

          {/* Company List */}
          {companies.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <svg className="w-12 h-12 text-neutral-300 dark:text-neutral-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                <Trans>No companies available</Trans>
              </p>
            </div>
          ) : (
            companies.map((company) => (
              <button
                key={company.id}
                onClick={() => handleSelect(company.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors ${
                  currentCompany === company.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium text-neutral-900 dark:text-white">
                    {company.name}
                  </div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400">
                    {company.country}
                    {!company.is_active && (
                      <span className="ml-2 px-1.5 py-0.5 bg-neutral-200 dark:bg-neutral-700 rounded text-xs">
                        <Trans>Inactive</Trans>
                      </span>
                    )}
                  </div>
                </div>
                {currentCompany === company.id && (
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
