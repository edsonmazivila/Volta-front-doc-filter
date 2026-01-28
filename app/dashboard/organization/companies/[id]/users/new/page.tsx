import { Header } from "@/components/dashboard/header";
import { requireUser } from "@/lib/auth/dal";
import { getLocaleAndInitialize } from "@/lib/i18n/server";
import { redirect } from "next/navigation";
import { getCompanyById } from "@/lib/services/companies";
import { t } from "@lingui/core/macro";
import { NewUserForm } from "@/components/organization/new-user-form";

export default async function NewUserPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ role?: string }>;
}) {
  await getLocaleAndInitialize();
  const user = await requireUser();

  // Only organization_admin can create users
  if (user.role !== "organization_admin" && user.role !== "platform_owner") {
    redirect("/dashboard");
  }

  const { id } = await params;
  const { role } = await searchParams;

  const company = await getCompanyById(id).catch(() => null);

  if (!company) {
    redirect("/dashboard/organization");
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <Header title={t`New User - ${company.name}`} />
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <NewUserForm
          companyId={id}
          companyName={company.name}
          defaultRole={role}
        />
      </main>
    </div>
  );
}
