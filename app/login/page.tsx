import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { verifySession } from "@/lib/auth/dal";
import { LoginForm } from "./login-form";

export default async function LoginPage() {

  const session = await verifySession();
  const user = session?.user;
  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-dvh app-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
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
