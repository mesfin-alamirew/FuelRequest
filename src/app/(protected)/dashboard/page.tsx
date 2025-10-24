// src/app/dashboard/page.tsx
import PageBreadcrumb from '@/components/PageBreadCrumb';
import { getAuthSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import TinyBarChart from './TinyBarChart';

export default async function DashboardPage() {
  // Await the function call to get the session object
  const session = await getAuthSession();

  // Now 'session' is either an object or null
  if (!session) {
    redirect('/');
  }

  return (
    <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <article className="flex items-center gap-5 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/3">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-xl bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-white/90">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                fill="none"
                className="h-7 w-7"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M14 24.59v-.004m0-11.718v11.718m-4.935-8.22v-5.758m9.87-4.933-9.868 4.933M23.591 8.28c.178.277.277.603.277.944v9.554a1.75 1.75 0 0 1-.967 1.565l-8.118 4.058a1.75 1.75 0 0 1-.783.185M23.591 8.28l-8.808 4.404a1.75 1.75 0 0 1-1.565 0L4.41 8.28m19.181 0a1.75 1.75 0 0 0-.69-.621L14.783 3.6a1.75 1.75 0 0 0-1.565 0L5.101 7.66c-.287.144-.524.36-.69.62m0 0a1.75 1.75 0 0 0-.277.945v9.554c0 .663.374 1.269.967 1.565l8.117 4.058c.246.124.514.185.782.185"
                ></path>
              </svg>
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
                12,384
              </h3>
              <p className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
                Pending Requests
                <span className="bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500 inline-flex items-center justify-center gap-1 rounded-full px-2.5 py-0.5 text-sm font-medium">
                  +20%
                </span>
              </p>
            </div>
          </article>
          <article className="flex items-center gap-5 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/3">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-xl bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-white/90">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                fill="none"
                className="h-7 w-7"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M14 24.59v-.004m0-11.718v11.718m-4.935-8.22v-5.758m9.87-4.933-9.868 4.933M23.591 8.28c.178.277.277.603.277.944v9.554a1.75 1.75 0 0 1-.967 1.565l-8.118 4.058a1.75 1.75 0 0 1-.783.185M23.591 8.28l-8.808 4.404a1.75 1.75 0 0 1-1.565 0L4.41 8.28m19.181 0a1.75 1.75 0 0 0-.69-.621L14.783 3.6a1.75 1.75 0 0 0-1.565 0L5.101 7.66c-.287.144-.524.36-.69.62m0 0a1.75 1.75 0 0 0-.277.945v9.554c0 .663.374 1.269.967 1.565l8.117 4.058c.246.124.514.185.782.185"
                ></path>
              </svg>
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
                12,384
              </h3>
              <p className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
                All Requests
                <span className="bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500 inline-flex items-center justify-center gap-1 rounded-full px-2.5 py-0.5 text-sm font-medium">
                  +20%
                </span>
              </p>
            </div>
          </article>
          <article className="flex items-center gap-5 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/3">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-xl bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-white/90">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="29"
                height="28"
                fill="none"
                className="w-7 h-7"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M7.041 4.667h8.75c.966 0 1.75.783 1.75 1.75v14m0 0V8.33h2.863a1.75 1.75 0 0 1 1.45.77l2.97 4.392q.14.207.216.444m-7.499 6.48h.008m-.008 0h-5.982m-8.018 0h2.634m18.95 0v-5.944q-.001-.276-.085-.536m.96 6.48h-3.066m-10.06 0h4.675m-.008-6.48h7.5M5.29 9.042h5.25m0 4.375h-7m14.008 7a2.701 2.701 0 0 1 5.385 0m-5.385 0a2.7 2.7 0 1 0 5.385 0m-11.375 0q.009.106.009.215a2.7 2.7 0 1 1-5.393-.215m5.384 0a2.701 2.701 0 0 0-5.384 0"
                ></path>
              </svg>
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
                728
              </h3>
              <p className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
                Vehicles
                <span className="bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500 inline-flex items-center justify-center gap-1 rounded-full px-2.5 py-0.5 text-sm font-medium">
                  +20%
                </span>
              </p>
            </div>
          </article>
          <article className="flex items-center gap-5 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/3">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-xl bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-white/90">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="29"
                height="28"
                fill="none"
                className="w-7 h-7"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M5.625 9.333H3M4.75 14H3m.875 4.667H3m6.902 3.645h13.105a1.75 1.75 0 0 0 1.74-1.567L26.13 7.62a1.75 1.75 0 0 0-1.74-1.934H11.284a1.75 1.75 0 0 0-1.74 1.567L8.161 20.378a1.75 1.75 0 0 0 1.74 1.934m6.56-16.624h3.117l-.875 5.82h-3.117z"
                ></path>
              </svg>
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
                12,384
              </h3>
              <p className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
                Drivers
                <span className="bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500 inline-flex items-center justify-center gap-1 rounded-full px-2.5 py-0.5 text-sm font-medium">
                  +20%
                </span>
              </p>
            </div>
          </article>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mt-10">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/3">
            <div className="flex items-center justify-between gap-5">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                  Delivery Statistics
                </h3>
                <p className="dark:text-gray-40 text-sm text-gray-500">
                  Total number of deliveries 70.5K
                </p>
              </div>
            </div>
            <div className="h-[265px] w-full">
              <TinyBarChart />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
