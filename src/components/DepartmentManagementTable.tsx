// src/app/admin/manage-departments/_components/DepartmentManagementTable.tsx
'use client';

import { useActionState, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { toast } from 'react-toastify';
import {
  createDepartment,
  deleteDepartment,
  fetchDepartments,
  updateDepartment,
} from '@/lib/actions/admin';
import { Input } from '@/components/ui/Input';
import type { Department } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

type DepartmentManagementTableProps = {
  initialDepartments: Department[];
};

type FormState = { success?: boolean; error?: string } | null;

// New Edit Form Component
function EditDepartmentForm({
  department,
  onCancel,
  onDepartmentUpdated,
}: {
  department: Department;
  onCancel: () => void;
  onDepartmentUpdated: () => Promise<void>;
}) {
  const [state, formAction] = useActionState<FormState, FormData>(
    async (_previousState, formData) => {
      try {
        await updateDepartment(department.id, formData);
        toast.success('Department updated successfully!');
        await onDepartmentUpdated();
        onCancel();
        return { success: true };
      } catch (error: unknown) {
        let errorMessage = 'Failed to update department.';
        if (error instanceof Error) {
          errorMessage = error.message;
        }
        toast.error(errorMessage);
        return { error: errorMessage };
      }
    },
    null
  );
  const { pending } = useFormStatus();

  return (
    <form action={formAction} className="mt-4 space-y-4">
      <h3 className="text-lg font-semibold">
        Edit Department: {department.name}
      </h3>
      <Input
        name="name"
        defaultValue={department.name}
        placeholder="Department Name"
        required
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className={`px-4 py-2 text-sm font-medium rounded-md text-white transition-colors ${
            pending ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {pending ? 'Updating...' : 'Update Department'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function AddDepartmentForm({
  onDepartmentAdded,
}: {
  onDepartmentAdded: () => Promise<void>;
}) {
  const [state, formAction] = useActionState<FormState, FormData>(
    async (_previousState, formData) => {
      try {
        await createDepartment(formData);
        toast.success('Department created successfully!');
        await onDepartmentAdded(); // <-- Call parent function to refresh state
        return { success: true };
      } catch (error: unknown) {
        let errorMessage = 'Failed to create department.';
        if (error instanceof Error) {
          errorMessage = error.message;
        }
        toast.error(errorMessage);
        return { error: errorMessage };
      }
    },
    null
  );
  const { pending } = useFormStatus();

  return (
    <form
      action={formAction}
      className="mt-8 space-y-4 border p-2 border-gray-200 rounded-2xl"
    >
      <h2 className="text-xl font-semibold text-gray-800">
        Add New Department
      </h2>
      <Input name="name" placeholder="Department Name" required />
      <button
        type="submit"
        disabled={pending}
        className={`px-6 py-2 text-sm font-medium rounded-md text-white transition-colors ${
          pending ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'
        }`}
      >
        {pending ? 'Adding...' : 'Add Department'}
      </button>
    </form>
  );
}

export default function DepartmentManagementTable({
  initialDepartments,
}: DepartmentManagementTableProps) {
  const [departments, setDepartments] = useState(initialDepartments);
  const [editingDeptId, setEditingDeptId] = useState<number | null>(null);

  const handleDepartmentAdded = async () => {
    try {
      const updatedDepartments = await fetchDepartments();
      setDepartments(updatedDepartments);
    } catch (error) {
      toast.error('Failed to update department list.');
    }
  };

  const handleDepartmentUpdated = handleDepartmentAdded;

  const handleDeleteDepartment = async (deptId: number) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      try {
        await deleteDepartment(deptId);
        toast.success('Department deleted successfully!');
        handleDepartmentAdded();
      } catch (error) {
        toast.error('Failed to delete department.');
      }
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <AddDepartmentForm onDepartmentAdded={handleDepartmentAdded} />

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            {/* Table headers */}
            <tbody className="bg-white divide-y divide-gray-200">
              {departments.map((dept) => (
                <tr key={dept.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{dept.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => setEditingDeptId(dept.id)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteDepartment(dept.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {editingDeptId && (
        <EditDepartmentForm
          department={departments.find((d) => d.id === editingDeptId)!}
          onCancel={() => setEditingDeptId(null)}
          onDepartmentUpdated={handleDepartmentUpdated}
        />
      )}
    </div>
  );
}

// // src/app/admin/manage-departments/_components/DepartmentManagementTable.tsx
// 'use client';

// import { useState } from 'react';
// import { useFormState, useFormStatus } from 'react-dom';
// import { toast } from 'react-toastify';
// import {
//   createDepartment,
//   deleteDepartment,
//   fetchDepartments,
// } from '@/app/actions/admin';
// import { Input } from '@/components/ui/Input';
// import type { Department } from '@prisma/client';

// type DepartmentManagementTableProps = {
//   initialDepartments: Department[];
// };

// type FormState = { success?: boolean; error?: string } | null;

// function AddDepartmentForm({
//   onDepartmentAdded,
// }: {
//   onDepartmentAdded: () => Promise<void>;
// }) {
//   const [state, formAction] = useFormState<FormState, FormData>(
//     async (_previousState, formData) => {
//       try {
//         await createDepartment(formData);
//         toast.success('Department created successfully!');
//         await onDepartmentAdded(); // <-- Call parent function to refresh state
//         return { success: true };
//       } catch (error: unknown) {
//         let errorMessage = 'Failed to create department.';
//         if (error instanceof Error) {
//           errorMessage = error.message;
//         }
//         toast.error(errorMessage);
//         return { error: errorMessage };
//       }
//     },
//     null
//   );
//   const { pending } = useFormStatus();

//   return (
//     <form action={formAction} className="mt-8 space-y-4">
//       <h2 className="text-xl font-semibold text-gray-800">
//         Add New Department
//       </h2>
//       <Input name="name" placeholder="Department Name" required />
//       <button
//         type="submit"
//         disabled={pending}
//         className={`px-6 py-2 text-sm font-medium rounded-md text-white transition-colors ${
//           pending ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'
//         }`}
//       >
//         {pending ? 'Adding...' : 'Add Department'}
//       </button>
//     </form>
//   );
// }

// export default function DepartmentManagementTable({
//   initialDepartments,
// }: DepartmentManagementTableProps) {
//   const [departments, setDepartments] = useState(initialDepartments);

//   const handleDepartmentAdded = async () => {
//     try {
//       const updatedDepartments = await fetchDepartments();
//       setDepartments(updatedDepartments);
//     } catch (error) {
//       console.error('Failed to re-fetch departments:', error);
//       toast.error('Failed to update department list.');
//     }
//   };
//   return (
//     <div>
//       <div className="bg-white p-6 rounded-lg shadow-md">
//         <div className="overflow-x-auto">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Department Name
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {departments.map((dept) => (
//                 <tr key={dept.id}>
//                   <td className="px-6 py-4 whitespace-nowrap">{dept.name}</td>
//                   <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
//                     <button
//                       onClick={() => {
//                         /* handle edit */
//                       }}
//                       className="text-indigo-600 hover:text-indigo-900 mr-4"
//                     >
//                       Edit
//                     </button>
//                     <form
//                       action={() => deleteDepartment(dept.id)}
//                       className="inline"
//                     >
//                       <button
//                         type="submit"
//                         className="text-red-600 hover:text-red-900"
//                       >
//                         Delete
//                       </button>
//                     </form>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//       <AddDepartmentForm onDepartmentAdded={handleDepartmentAdded} />
//     </div>
//   );
// }
