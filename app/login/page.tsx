import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { verifySession } from "@/lib/auth/dal";
import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ session_expired?: string; error?: string; redirect?: string }>
}) {
  const params = await searchParams;
  const session = await verifySession();
  const user = session?.user;
  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-dvh app-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {params.session_expired && (
          <div className="mb-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <p className="text-sm text-yellow-400">
              Your session has expired. Please log in again.
            </p>
          </div>
        )}
        {params.error === 'auth_check_failed' && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-sm text-red-400">
              Authentication check failed. Please log in again.
            </p>
          </div>
        )}
        <Suspense fallback={<div>Loading...</div>}>
          <LoginForm />
        </Suspense>

        <div className="mt-6 text-center">
          <p className="text-sm text-neutral-400">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="text-blue-400 hover:text-blue-300 font-medium underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
