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
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";
import { msg } from "@lingui/core/macro";

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const { i18n } = useLingui();

  // Get success message from search params
  const successMessage = searchParams.get("message");

  return (
    <>
      {successMessage && (
        <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
          <p className="text-sm text-green-700 dark:text-green-400">{successMessage}</p>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      <AuthForm
        title={i18n._(msg`Welcome back`)}
        subtitle={i18n._(msg`Sign in to your account to continue`)}
        onSubmit={async (data) => {
          console.log('[LOGIN FORM] Starting submit with data:', { email: data.email });
          setError(null);
          const formData = new FormData();
          formData.append('email', data.email);
          formData.append('password', data.password);
          
          console.log('[LOGIN FORM] Calling loginAction...');
          const result = await loginAction(undefined, formData);
          console.log('[LOGIN FORM] Result:', result);
          
          if ("errors" in result) {
            const formErrors = (
              result.errors as Record<string, string[] | undefined>
            )._form;
            if (formErrors?.length) {
              console.log('[LOGIN FORM] Setting error:', formErrors[0]);
              setError(formErrors[0]);
              return;
            }
          }
          
          console.log('[LOGIN FORM] Success! Redirecting to dashboard...');
          // Force full page reload to dashboard so server picks up new session cookie
          window.location.href = '/dashboard';
        }}
        schema={loginSchema}
        submitText={i18n._(msg`Sign in`)}
      >
        <EmailField />
        <PasswordField />
        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-primary hover:opacity-80 underline"
          >
            <Trans>Forgot your password?</Trans>
          </Link>
        </div>
      </AuthForm>
    </>
  );
}
