import Link from "next/link";

export default function AccessDeniedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6 dark:bg-gray-900">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-error-50 dark:bg-error-500/10">
          <svg className="h-7 w-7 text-error-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">Access denied</h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Your account doesn&apos;t have permission to view this page. If you believe this is a
          mistake, contact a system administrator.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center justify-center rounded-lg bg-brand-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-brand-600"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
