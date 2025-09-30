// src/app/dashboard/page.tsx
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
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      {/* Access the properties on the resolved 'session' object */}
      <h1 className="text-4xl font-bold">A PLACE FOR CHARTS</h1>
      {/* <h1 className="text-4xl font-bold">Welcome, {session.name}!</h1> */}
      {/* <p className="mt-4">Your email is: {session.email}</p> */}
    </div>
  );
}
