"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { Card, CardHeader } from "@/components/dashboard/card";
import { Trans } from "@lingui/react/macro";
import { useLingui } from "@lingui/react";
import { msg } from "@lingui/core/macro";
import { createCompanyAction } from "@/lib/actions/companies";
import type { CreateCompanyData } from "@/lib/services/companies";

export function NewCompanyForm() {
  const router = useRouter();
  const { i18n } = useLingui();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOptional, setShowOptional] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    
    const payload: CreateCompanyData = {
      name: formData.get('name') as string,
      business_email: formData.get('business_email') as string,
      country: formData.get('country') as string,
    };

    // Add optional fields if provided
    const legal_name = formData.get('legal_name') as string;
    const tax_id = formData.get('tax_id') as string;
    const address_line1 = formData.get('address_line1') as string;
    const city = formData.get('city') as string;
    const state = formData.get('state') as string;
    const postal_code = formData.get('postal_code') as string;
    const phone = formData.get('phone') as string;
    const website = formData.get('website') as string;

    if (legal_name) payload.legal_name = legal_name;
    if (tax_id) payload.tax_id = tax_id;
    if (address_line1) payload.address_line1 = address_line1;
    if (city) payload.city = city;
    if (state) payload.state = state;
    if (postal_code) payload.postal_code = postal_code;
    if (phone) payload.phone = phone;
    if (website) payload.website = website;

    try {
      const result = await createCompanyAction(payload);
      
      if (!result.success || !result.data) {
        setError(result.error || i18n._(msg`Failed to create company`));
        setIsSubmitting(false);
        return;
      }
      
      router.push(`/dashboard/organization?success=company_created&name=${encodeURIComponent(result.data.name)}`);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : i18n._(msg`Failed to create company`);
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader 
        title={i18n._(msg`Add New Company`)}
        action={
          <Button
            variant="outline"
            onClick={() => router.back()}
          >
            <Trans>Cancel</Trans>
          </Button>
        }
      />
      <p className="px-6 pt-2 text-neutral-600 dark:text-neutral-400">
        <Trans>Create a new company within your organization</Trans>
      </p>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {error && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Required Fields */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">
            <Trans>Company Information</Trans>
          </h3>

          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              <Trans>Company Name</Trans> <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder={i18n._(msg`Acme Inc.`)}
            />
          </div>

          <div>
            <label htmlFor="business_email" className="block text-sm font-medium mb-2">
              <Trans>Business Email</Trans> <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="business_email"
              name="business_email"
              required
              className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder={i18n._(msg`contact@company.com`)}
            />
          </div>

          <div>
            <label htmlFor="country" className="block text-sm font-medium mb-2">
              <Trans>Country</Trans> <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="country"
              name="country"
              required
              maxLength={2}
              pattern="[A-Z]{2}"
              className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="US"
              style={{ textTransform: 'uppercase' }}
            />
            <p className="text-xs text-neutral-500 mt-1">
              <Trans>2-letter country code (e.g., US, UK, PT)</Trans>
            </p>
          </div>
        </div>

        {/* Optional Fields */}
        <details open={showOptional} onToggle={(e) => setShowOptional((e.target as HTMLDetailsElement).open)}>
          <summary className="cursor-pointer text-primary font-medium flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            <Trans>Additional Information (Optional)</Trans>
          </summary>

          <div className="mt-4 space-y-4 pl-7">
            <div>
              <label htmlFor="legal_name" className="block text-sm font-medium mb-2">
                <Trans>Legal Name</Trans>
              </label>
              <input
                type="text"
                id="legal_name"
                name="legal_name"
                className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="tax_id" className="block text-sm font-medium mb-2">
                <Trans>Tax ID / VAT Number</Trans>
              </label>
              <input
                type="text"
                id="tax_id"
                name="tax_id"
                className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="address_line1" className="block text-sm font-medium mb-2">
                <Trans>Address</Trans>
              </label>
              <input
                type="text"
                id="address_line1"
                name="address_line1"
                className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="city" className="block text-sm font-medium mb-2">
                  <Trans>City</Trans>
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="state" className="block text-sm font-medium mb-2">
                  <Trans>State/Province</Trans>
                </label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="postal_code" className="block text-sm font-medium mb-2">
                  <Trans>Postal Code</Trans>
                </label>
                <input
                  type="text"
                  id="postal_code"
                  name="postal_code"
                  className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium mb-2">
                <Trans>Phone Number</Trans>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="website" className="block text-sm font-medium mb-2">
                <Trans>Website</Trans>
              </label>
              <input
                type="url"
                id="website"
                name="website"
                className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="https://company.com"
              />
            </div>
          </div>
        </details>

        <div className="flex gap-4 pt-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? <Trans>Creating Company...</Trans> : <Trans>Create Company</Trans>}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            <Trans>Cancel</Trans>
          </Button>
        </div>
      </form>
    </Card>
  );
}
