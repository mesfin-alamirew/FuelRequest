// src/app/admin/manage-users/_components/UserManagementTable.tsx
'use client';

import { useActionState, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { toast } from 'react-toastify';
import {
  createUser,
  deleteUser,
  fetchUsers,
  updateUser,
} from '@/lib/actions/admin';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { User, Department, RoleEnum } from '@prisma/client';

import { Table, TableBody, TableCell, TableHeader, TableRow } from './ui/table';
import { useTheme } from '@/providers/ThemeContext';

type UserWithDepartment = User & { department: Department | null };

type UserManagementTableProps = {
  initialUsers: UserWithDepartment[];
  departments: Department[];
};

type FormState = { success?: boolean; error?: string } | null;

// New Edit Form Component
function EditUserForm({
  user,
  departments,
  onCancel,
  onUserUpdated,
}: {
  user: UserWithDepartment;
  departments: Department[];
  onCancel: () => void;
  onUserUpdated: () => Promise<void>;
}) {
  const { theme } = useTheme();
  const [state, formAction] = useActionState<FormState, FormData>(
    async (_previousState, formData) => {
      try {
        await updateUser(user.id, formData);
        toast.success('User updated successfully!', {
          theme: theme === 'dark' ? 'dark' : 'light', // Apply theme dynamically
        });
        await onUserUpdated();
        onCancel();
        return { success: true };
      } catch (error: unknown) {
        let errorMessage = 'Failed to update user.';
        if (error instanceof Error) {
          errorMessage = error.message;
        }
        toast.error(errorMessage, {
          theme: theme === 'dark' ? 'dark' : 'light', // Apply theme dynamically
        });
        return { error: errorMessage };
      }
    },
    null
  );
  const { pending } = useFormStatus();

  return (
    <form action={formAction} className="mt-4 space-y-4 p-4">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
        Edit User: {user.name}
      </h2>
      <Input
        name="name"
        defaultValue={user.name}
        placeholder="Full Name"
        required
        className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
      />
      <Input
        name="email"
        defaultValue={user.email}
        placeholder="Email Address"
        type="email"
        required
        className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
      />
      <div className="relative z-20 bg-transparent">
        <Select
          name="role"
          defaultValue={user.role}
          required
          className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 pr-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
        >
          {Object.values(RoleEnum).map((role) => (
            <option
              key={role}
              value={role}
              className="text-gray-700 dark:bg-gray-900 dark:text-gray-400"
            >
              {role}
            </option>
          ))}
        </Select>
        <span className="pointer-events-none absolute top-1/2 right-4 z-30 -translate-y-1/2 text-gray-500 dark:text-gray-400">
          <svg
            className="stroke-current"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4.79175 7.396L10.0001 12.6043L15.2084 7.396"
              stroke=""
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></path>
          </svg>
        </span>
      </div>
      <div className="relative z-20 bg-transparent">
        <Select
          name="departmentId"
          defaultValue={user.departmentId || ''}
          className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 pr-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
        >
          <option value="">Select Department (Optional)</option>
          {departments.map((dept) => (
            <option
              key={dept.id}
              value={dept.id}
              className="text-gray-700 dark:bg-gray-900 dark:text-gray-400"
            >
              {dept.name}
            </option>
          ))}
        </Select>
        <span className="pointer-events-none absolute top-1/2 right-4 z-30 -translate-y-1/2 text-gray-500 dark:text-gray-400">
          <svg
            className="stroke-current"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4.79175 7.396L10.0001 12.6043L15.2084 7.396"
              stroke=""
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></path>
          </svg>
        </span>
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="shadow-theme-xs inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-medium text-gray-700 ring-1 ring-gray-300 transition hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03]"
          // className={`px-4 py-2 text-sm font-medium rounded-md text-white transition-colors ${
          //   pending ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'
          // }`}
        >
          {pending ? 'Updating...' : 'Update User'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="shadow-theme-xs inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-medium text-gray-700 ring-1 ring-gray-300 transition hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03]"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function AddUserForm({
  departments,
  onUserAdded,
}: {
  departments: Department[];
  onUserAdded: () => Promise<void>;
}) {
  const { theme } = useTheme();
  const [state, formAction] = useFormState<FormState, FormData>(
    async (_previousState, formData) => {
      try {
        await createUser(formData);
        toast.success('User created successfully!', {
          theme: theme === 'dark' ? 'dark' : 'light', // Apply theme dynamically
        });
        await onUserAdded(); // <-- Call parent function to refresh state
        return { success: true };
      } catch (error: unknown) {
        let errorMessage = 'Failed to create user.';
        if (error instanceof Error) {
          errorMessage = error.message;
        }
        toast.error(errorMessage, {
          theme: theme === 'dark' ? 'dark' : 'light', // Apply theme dynamically
        });
        return { error: errorMessage };
      }
    },
    null
  );
  const { pending } = useFormStatus();

  return (
    <form
      action={formAction}
      className="mt-8 space-y-4 border border-gray-200 p-2 rounded-2xl"
    >
      <h2 className="text-xl font-semibold text-gray-800">Add New User</h2>
      <Input name="name" placeholder="Full Name" required />
      <Input name="email" placeholder="Email Address" type="email" required />
      <Select name="role" required>
        <option value="">Select Role</option>
        {Object.values(RoleEnum).map((role) => (
          <option key={role} value={role}>
            {role}
          </option>
        ))}
      </Select>
      <Select name="departmentId">
        <option value="">Select Department (Optional)</option>
        {departments.map((dept) => (
          <option key={dept.id} value={dept.id}>
            {dept.name}
          </option>
        ))}
      </Select>
      <button
        type="submit"
        disabled={pending}
        className="shadow-theme-xs inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-medium text-gray-700 ring-1 ring-gray-300 transition hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03]"
        // className={`px-6 py-2 text-sm font-medium rounded-md text-white transition-colors ${
        //   pending ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'
        // }`}
      >
        {pending ? 'Adding...' : 'Add User'}
      </button>
    </form>
  );
}

export default function UserManagementTable({
  initialUsers,
  departments,
}: UserManagementTableProps) {
  const { theme } = useTheme();
  const [users, setUsers] = useState(initialUsers);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);

  const handleUserAdded = async () => {
    try {
      const updatedUsers = await fetchUsers();
      setUsers(updatedUsers);
    } catch (error) {
      toast.error('Failed to update user list.');
    }
  };

  const handleUserUpdated = handleUserAdded; // Use the same handler for updates

  const handleDeleteUser = async (userId: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(userId);
        toast.success('User deleted successfully!', {
          theme: theme === 'dark' ? 'dark' : 'light', // Apply theme dynamically
        });
        handleUserAdded(); // Refresh list after deletion
      } catch (error) {
        toast.error('Failed to delete user.', {
          theme: theme === 'dark' ? 'dark' : 'light', // Apply theme dynamically
        });
      }
    }
  };

  return (
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
                  Name
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Email
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Role
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
              {users.map((user) => (
                <TableRow
                  key={user.id}
                  className="px-5 py-4 sm:px-6 text-start"
                >
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {user.name}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {user.email}
                  </TableCell>

                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {user.role}
                  </TableCell>

                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <div className="flex gap-4">
                      <button
                        onClick={() => setEditingUserId(user.id)}
                        className="text-blue-600 hover:text-blue-900 cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-900 cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      {editingUserId && (
        <EditUserForm
          user={users.find((u) => u.id === editingUserId)!}
          departments={departments}
          onCancel={() => setEditingUserId(null)}
          onUserUpdated={handleUserUpdated}
        />
      )}
    </div>
  );
}
