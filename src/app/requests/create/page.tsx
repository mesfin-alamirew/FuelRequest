// src/app/requests/create/page.tsx

import { fetchDrivers } from '@/lib/actions/requests';
import CreateRequestForm from '@/components/CreateRequestForm';
import Layout from '@/components/Layout';

export default async function CreateRequestPage() {
  const drivers = await fetchDrivers(); // <-- Fetch drivers on the server

  return (
    <Layout>
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6">Create Fuel Request</h1>
        <CreateRequestForm drivers={drivers} />
      </div>
    </Layout>
  );
}
