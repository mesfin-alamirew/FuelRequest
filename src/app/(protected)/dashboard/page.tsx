// src/app/dashboard/page.tsx
import PageBreadcrumb from '@/components/PageBreadCrumb';
import { getAuthSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  // Await the function call to get the session object
  const session = await getAuthSession();

  // Now 'session' is either an object or null
  if (!session) {
    redirect('/');
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Blank Page" />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="mx-auto w-full max-w-[630px] text-center">
          <h3 className="mb-4 font-semibold text-gray-800 text-theme-xl dark:text-white/90 sm:text-2xl">
            Place for different charts
          </h3>
        </div>
      </div>
    </div>
  );
}
