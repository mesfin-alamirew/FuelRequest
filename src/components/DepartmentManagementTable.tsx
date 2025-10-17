// src/app/admin/manage-departments/_components/DepartmentManagementTable.tsx
'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { toast } from 'react-toastify';
import {
  createDepartment,
  deleteDepartment,
  fetchDepartments,
  updateDepartment,
} from '@/lib/actions/admin';
import { Input } from '@/components/ui/Input';
import type { Department } from '@prisma/client';

import { Table, TableBody, TableCell, TableHeader, TableRow } from './ui/table';

type DepartmentManagementTableProps = {
  departments: Department[];
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
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
        Add New Department
      </h2>

      <Input
        name="name"
        placeholder="Department Name"
        required
        className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-14 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
      />
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
  departments,
}: DepartmentManagementTableProps) {
  const [editingDeptId, setEditingDeptId] = useState<number | null>(null);
  console.log('AA', departments.length);
  const handleDepartmentAdded = async () => {
    try {
      const updatedDepartments = await fetchDepartments();
      // setDepartments(updatedDepartments);
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
    <>
      <AddDepartmentForm onDepartmentAdded={handleDepartmentAdded} />
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[1102px]">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    ID
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Name
                  </TableCell>

                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {departments.map((dept) => (
                  <TableRow key={dept.id}>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {dept.id}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {dept.name}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
    </>
  );
}
