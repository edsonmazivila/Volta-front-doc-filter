import { Header } from "@/components/dashboard/header";
import { requireUser } from "@/lib/auth/dal";
import { getLocaleAndInitialize } from "@/lib/i18n/server";
import { redirect } from "next/navigation";
import { getAllOrganizationUsers } from "@/lib/services/users";
import { t } from "@lingui/core/macro";
import { EditUserForm } from "@/components/organization/edit-user-form";

export default async function EditUserPage({ 
  params 
}: { 
  params: Promise<{ id: string; userId: string }>;
}) {
  await getLocaleAndInitialize();
  const user = await requireUser();
  
  const { id: companyId, userId } = await params;

  // Only organization_admin can edit users
  if (user.role !== 'organization_admin' && user.role !== 'platform_owner') {
    redirect('/dashboard');
  }

  // Fetch all organization users and find the target user
  // We use getAllOrganizationUsers because getUserById has RLS restrictions
  console.log(`[EditUserPage] Fetching all organization users to find user: ${userId}`);
  const allUsers = await getAllOrganizationUsers().catch((error) => {
    console.error(`[EditUserPage] Failed to fetch organization users:`, error);
    return [];
  });

  const targetUser = allUsers.find(u => u.id === userId);

  if (!targetUser) {
    console.log(`[EditUserPage] User ${userId} not found in organization, redirecting...`);
    redirect(`/dashboard/organization/companies/${companyId}/users`);
  }
  
  console.log(`[EditUserPage] User found:`, targetUser.full_name, targetUser.role);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <Header title={t`Edit User - ${targetUser.full_name}`} />
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <EditUserForm 
          userId={userId}
          companyId={companyId}
          user={targetUser}
        />
      </main>
    </div>
  );
}
