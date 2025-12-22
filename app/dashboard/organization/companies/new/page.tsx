import { Header } from "@/components/dashboard/header";
import { requireUser } from "@/lib/auth/dal";
import { getLocaleAndInitialize } from "@/lib/i18n/server";
import { redirect } from "next/navigation";
import { NewCompanyForm } from "@/components/organization/new-company-form";
import { t } from "@lingui/core/macro";

export default async function NewCompanyPage() {
  await getLocaleAndInitialize();
  const user = await requireUser();

  // Only organization_admin can create companies
  if (user.role !== 'organization_admin' && user.role !== 'platform_owner') {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <Header title={t`New Company`} />
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <NewCompanyForm />
      </main>
    </div>
  );
}
