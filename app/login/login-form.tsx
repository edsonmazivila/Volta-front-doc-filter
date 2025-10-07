"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  AuthForm,
  EmailField,
  PasswordField,
} from "@/components/auth/auth-form";
import { loginAction } from "@/lib/auth/actions";
import { loginSchema } from "@/lib/auth/types";
import Link from "next/link";

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  // Get success message from search params
  const successMessage = searchParams.get("message");

  return (
    <>
      {successMessage && (
        <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
          <p className="text-sm text-green-400">{successMessage}</p>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      <AuthForm
        title="Welcome back"
        subtitle="Sign in to your account to continue"
        onSubmit={async () => {
          /* handled by action */
        }}
        action={async (formData) => {
          setError(null);
          const result = await loginAction(undefined, formData);
          if ("errors" in result) {
            const formErrors = (
              result.errors as Record<string, string[] | undefined>
            )._form;
            if (formErrors && formErrors.length) {
              setError(formErrors[0]);
              return;
            }
          }
          // Force full page reload to dashboard so server picks up new session cookie
          window.location.href = '/dashboard';
        }}
        schema={loginSchema}
        submitText="Sign in"
      >
        <EmailField />
        <PasswordField />
        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-blue-400 hover:text-blue-300 underline"
          >
            Forgot your password?
          </Link>
        </div>
      </AuthForm>
    </>
  );
}
