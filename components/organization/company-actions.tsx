"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import Link from "next/link";
import { Trans } from "@lingui/react/macro";
import { DeactivateCompanyDialog } from "./deactivate-company-dialog";
import type { Company } from "@/lib/types/organization";

interface CompanyActionsProps {
  company: Company;
}

export function CompanyActions({ company }: CompanyActionsProps) {
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);

  return (
    <>
      <div className="mt-8 flex flex-wrap gap-4">
        <Link href={`/dashboard/organization/companies/${company.id}/users`}>
          <Button variant="primaryGradient">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Manage Users
          </Button>
        </Link>

        <Link href={`/dashboard/organization/companies/${company.id}/edit`}>
          <Button variant="outline">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <Trans>Edit Company</Trans>
          </Button>
        </Link>
        
        {company.is_active ? (
          <Button 
            variant="outline"
            onClick={() => setShowDeactivateDialog(true)}
            className="text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-900/10"
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
            <Trans>Deactivate Company</Trans>
          </Button>
        ) : (
          <Button>
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <Trans>Activate Company</Trans>
          </Button>
        )}
      </div>

      <DeactivateCompanyDialog
        companyId={company.id}
        companyName={company.name}
        isOpen={showDeactivateDialog}
        onClose={() => setShowDeactivateDialog(false)}
      />
    </>
  );
}
