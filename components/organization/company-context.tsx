'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface CompanyContextType {
  selectedCompany: string | 'all';
  setSelectedCompany: (companyId: string | 'all') => void;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export function CompanyProvider({ children }: { children: ReactNode }) {
  const [selectedCompany, setSelectedCompanyState] = useState<string | 'all'>('all');
  const [isMounted, setIsMounted] = useState(false);

  // Persist selection in localStorage (client-side only)
  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('selectedCompany');
      if (saved) {
        setSelectedCompanyState(saved);
      }
    }
  }, []);

  const setSelectedCompany = (companyId: string | 'all') => {
    setSelectedCompanyState(companyId);
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedCompany', companyId);
    }
  };

  return (
    <CompanyContext.Provider value={{ selectedCompany, setSelectedCompany }}>
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompanyContext() {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error('useCompanyContext must be used within a CompanyProvider');
  }
  return context;
}
