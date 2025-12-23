import { Header } from "@/components/dashboard/header";
import { requireUser } from "@/lib/auth/dal";
import { getLocaleAndInitialize } from "@/lib/i18n/server";
import { redirect } from "next/navigation";
import { getCompanyById } from "@/lib/services/companies";
import { EditCompanyForm } from "@/components/organization/edit-company-form";
import { t } from "@lingui/core/macro";

export default async function EditCompanyPage({ params }: { params: Promise<{ id: string }> }) {
  await getLocaleAndInitialize();
  const user = await requireUser();
  
  const { id } = await params;

  // Only organization_admin can edit companies
  if (user.role !== 'organization_admin' && user.role !== 'platform_owner') {
    redirect('/dashboard');
  }

  const company = await getCompanyById(id).catch(() => null);

  if (!company) {
    redirect('/dashboard/organization');
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <Header title={t`Edit Company`} />
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <EditCompanyForm company={company} />
      </main>
    </div>
  );
}
