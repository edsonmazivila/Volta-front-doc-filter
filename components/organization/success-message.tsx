"use client";

interface SuccessMessageProps {
  searchParams: { success?: string; name?: string };
}

export function SuccessMessage({ searchParams }: SuccessMessageProps) {
  const { success, name } = searchParams;

  if (!success) return null;

  const messages: Record<string, string> = {
    company_created: `Company "${name}" created successfully!`,
    company_updated: `Company updated successfully!`,
    company_deactivated: `Company "${name}" deactivated successfully!`,
    company_activated: `Company "${name}" activated successfully!`,
  };

  const message = messages[success];

  if (!message) return null;

  return (
    <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center gap-3">
      <svg className="w-5 h-5 text-green-600 dark:text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p className="text-sm text-green-700 dark:text-green-400">{message}</p>
    </div>
  );
}
