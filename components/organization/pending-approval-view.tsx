'use client';

export function PendingApprovalView() {
  return (
    <div className="flex items-center justify-center p-4 min-h-[80vh]">
      <div className="max-w-2xl w-full">
        {/* Main Card */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-lg overflow-hidden">{/* Header with Icon */}
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-6">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Awaiting Approval
                </h1>
                <p className="text-white/90 text-sm mt-1">
                  Your organization registration is being reviewed
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Status Message */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <h3 className="text-sm font-semibold text-yellow-900 dark:text-yellow-300 mb-1">
                    Organization Pending Approval
                  </h3>
                  <p className="text-sm text-yellow-800 dark:text-yellow-400">
                    Your organization is awaiting approval from a Platform Owner. You have read-only access until approval is granted.
                  </p>
                </div>
              </div>
            </div>

            {/* What's Next */}
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3">
                What happens next?
              </h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                    <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">1</span>
                  </div>
                  <div className="pt-1">
                    <h3 className="text-sm font-medium text-neutral-900 dark:text-white">
                      Platform Owner Review
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-0.5">
                      A Platform Owner will review your organization registration request
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                    <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">2</span>
                  </div>
                  <div className="pt-1">
                    <h3 className="text-sm font-medium text-neutral-900 dark:text-white">
                      Approval Decision
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-0.5">
                      You&apos;ll receive an email notification once your organization is approved or if additional information is needed
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                    <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">3</span>
                  </div>
                  <div className="pt-1">
                    <h3 className="text-sm font-medium text-neutral-900 dark:text-white">
                      Full Access
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-0.5">
                      Once approved, you&apos;ll gain full administrative access to create companies, manage users, and configure your organization
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Current Limitations */}
            <div className="bg-neutral-50 dark:bg-neutral-900 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-2">
                Current Limitations
              </h3>
              <ul className="space-y-1.5 text-sm text-neutral-600 dark:text-neutral-400">
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                  <span>Cannot create or manage companies</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                  <span>Cannot create or invite users</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                  <span>Cannot access administrative functions</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                  <span>Read-only access to organization information</span>
                </li>
              </ul>
            </div>

            {/* Help Section */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
                Need Help?
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-400">
                If you have questions about your registration status or need to update information, please contact our support team.
              </p>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-4 text-center">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Approval typically takes 1-2 business days
          </p>
        </div>
      </div>
    </div>
  );
}
