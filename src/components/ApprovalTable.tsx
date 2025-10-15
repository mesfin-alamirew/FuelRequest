'use client';

import { useActionState } from 'react';
import { approveRequest, rejectRequest } from '@/lib/actions/admin';

// Define the type for a pending fuel request, including nested data
type PendingRequest = {
  id: number;
  previousOdometer: number;
  currentOdometer: number;
  calculatedDifference: number;
  requestNumber: string;
  vehicle: {
    plate: string;
  };
  focalPerson: {
    name: string;
  };
  quantity: number;
  fuelType: string;
  totalLiters: number;
  createdAt: Date;
  remark: string | null;
};

// Define the type for the action state
type ActionState = {
  message?: string;
  error?: boolean;
};

export default function ApprovalTable({
  requests,
}: {
  requests: PendingRequest[];
}) {
  // Use useActionState to manage state for the approval and rejection actions
  const [approveState, approveAction] = useActionState(
    approveRequest,
    {} as ActionState
  );
  const [rejectState, rejectAction] = useActionState(
    rejectRequest,
    {} as ActionState
  );

  return (
    <div className="w-[90%]">
      {/* Display messages from the server actions */}
      {(approveState?.message || rejectState?.message) && (
        <div
          className={`p-4 rounded-md mb-4 ${
            approveState?.error || rejectState?.error
              ? 'bg-red-100 text-red-700'
              : 'bg-green-100 text-green-700'
          }`}
        >
          {approveState?.message || rejectState?.message}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Request #
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Requested By
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Vehicle Plate
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Fuel Type
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                First OM
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Second OM
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Difference
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Quantity
              </th>
              {/* <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Remark
              </th> */}
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Requested At
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {requests.map((request) => (
              <tr key={request.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {request.requestNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {request.focalPerson.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {request.vehicle.plate}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {request.fuelType}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {request.previousOdometer}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {request.currentOdometer}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {request.calculatedDifference}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {request.quantity}
                </td>
                {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {request.remark || ''}
                </td> */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(request.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex space-x-2">
                    {/* Approve form */}
                    <form action={approveAction}>
                      <input
                        type="hidden"
                        name="requestId"
                        value={request.id}
                      />
                      <button
                        type="submit"
                        className="text-green-600 hover:text-green-900"
                      >
                        Approve
                      </button>
                    </form>

                    {/* Reject form */}
                    <form action={rejectAction}>
                      <input
                        type="hidden"
                        name="requestId"
                        value={request.id}
                      />
                      <button
                        type="submit"
                        className="text-red-600 hover:text-red-900"
                      >
                        Reject
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
