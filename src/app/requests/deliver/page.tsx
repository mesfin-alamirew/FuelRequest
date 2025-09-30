// src/app/requests/deliver/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { fetchPendingRequests, deliverCoupon } from '@/lib/actions/store';
import { Input } from '@/components/ui/Input';
import { toast } from 'react-toastify';
import { useFormState, useFormStatus } from 'react-dom';
import { Skeleton } from '@/components/ui/Skeleton';

// 1. Define the Request type based on Prisma's generated types
// You may need to adjust the import path and type name based on your schema.
// This example uses a hypothetical type name.
type PendingRequest = Awaited<ReturnType<typeof fetchPendingRequests>>[number];
// The server action now only takes requestId and couponNumber.
// The deliveredById is retrieved securely on the server side.
type FormState = {
  success?: boolean;
  error?: string;
} | null;
function DeliverForm({ requestId }: { requestId: number }) {
  // 2. Type the state and the action handler
  const [state, formAction] = useFormState<FormState, FormData>(
    async (_previousState: FormState, formData: FormData) => {
      const couponNumber = formData.get('couponNumber') as string;

      try {
        await deliverCoupon(requestId, couponNumber);
        toast.success(`Coupon ${couponNumber} delivered successfully!`);
        return { success: true };
      } catch (error: unknown) {
        let errorMessage = 'An unexpected error occurred.';
        if (error instanceof Error) {
          errorMessage = error.message;
        }
        toast.error(errorMessage);
        return { error: errorMessage };
      }
    },
    null // The initial state is null, which is valid for our `FormState` union type
  );

  const { pending } = useFormStatus();

  return (
    <form action={formAction} className="flex items-center">
      <Input
        type="text"
        name="couponNumber"
        placeholder="Coupon No."
        required
        className="mr-2 w-32 inline-block"
      />
      <button
        type="submit"
        disabled={pending}
        className={`px-4 py-2 text-sm font-medium rounded-md text-white transition-colors ${
          pending ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'
        }`}
      >
        {pending ? 'Delivering...' : 'Deliver'}
      </button>
    </form>
  );
}

// The main page component
export default function DeliverCouponPage() {
  // 2. Explicitly type the state with the `PendingRequest` array
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRequests() {
      try {
        const requests = await fetchPendingRequests();
        setPendingRequests(requests); // Now TypeScript knows this is okay
      } catch (error) {
        toast.error('Failed to load pending requests.');
      } finally {
        setLoading(false);
      }
    }
    loadRequests();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="space-y-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-40 w-full" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6">Deliver Coupons</h1>
        {pendingRequests.length === 0 ? (
          <p>No pending requests.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Request No.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Driver
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Odometer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingRequests.map((request) => (
                  <tr key={request.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {request.requestNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {request.driver.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {request.vehicle.plate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {request.currentOdometer}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {request.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <DeliverForm requestId={request.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
