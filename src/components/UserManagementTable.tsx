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
  const [state, formAction] = useActionState<FormState, FormData>(
    async (_previousState, formData) => {
      try {
        await updateUser(user.id, formData);
        toast.success('User updated successfully!');
        await onUserUpdated();
        onCancel();
        return { success: true };
      } catch (error: unknown) {
        let errorMessage = 'Failed to update user.';
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
      <h3 className="text-lg font-semibold">Edit User: {user.name}</h3>
      <Input
        name="name"
        defaultValue={user.name}
        placeholder="Full Name"
        required
      />
      <Input
        name="email"
        defaultValue={user.email}
        placeholder="Email Address"
        type="email"
        required
      />
      <Select name="role" defaultValue={user.role} required>
        {Object.values(RoleEnum).map((role) => (
          <option key={role} value={role}>
            {role}
          </option>
        ))}
      </Select>
      <Select name="departmentId" defaultValue={user.departmentId || ''}>
        <option value="">Select Department (Optional)</option>
        {departments.map((dept) => (
          <option key={dept.id} value={dept.id}>
            {dept.name}
          </option>
        ))}
      </Select>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className={`px-4 py-2 text-sm font-medium rounded-md text-white transition-colors ${
            pending ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {pending ? 'Updating...' : 'Update User'}
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

function AddUserForm({
  departments,
  onUserAdded,
}: {
  departments: Department[];
  onUserAdded: () => Promise<void>;
}) {
  const [state, formAction] = useFormState<FormState, FormData>(
    async (_previousState, formData) => {
      try {
        await createUser(formData);
        toast.success('User created successfully!');
        await onUserAdded(); // <-- Call parent function to refresh state
        return { success: true };
      } catch (error: unknown) {
        let errorMessage = 'Failed to create user.';
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
        className={`px-6 py-2 text-sm font-medium rounded-md text-white transition-colors ${
          pending ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'
        }`}
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
        toast.success('User deleted successfully!');
        handleUserAdded(); // Refresh list after deletion
      } catch (error) {
        toast.error('Failed to delete user.');
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
                    <button
                      onClick={() => setEditingUserId(user.id)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
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

// // src/app/admin/manage-users/components/UserManagementTable.tsx
// 'use client';

// import { useState } from 'react';
// import { useFormState, useFormStatus } from 'react-dom';
// import { toast } from 'react-toastify';
// import { createUser, deleteUser, fetchUsers } from '@/app/actions/admin';
// import { Input } from '@/components/ui/Input';
// import { Select } from '@/components/ui/Select';
// import type { User, Department } from '@prisma/client';
// import { RoleEnum } from '@prisma/client'; // <-- FIX: Change `import type` to `import`

// type UserManagementTableProps = {
//   initialUsers: (User & { department: Department | null })[];
//   departments: Department[];
// };

// type FormState = { success?: boolean; error?: string } | null;

// function AddUserForm({
//   departments,
//   onUserAdded,
// }: {
//   departments: Department[];
//   onUserAdded: () => Promise<void>;
// }) {
//   const [state, formAction] = useFormState<FormState, FormData>(
//     async (_previousState, formData) => {
//       try {
//         await createUser(formData);
//         toast.success('User created successfully!');
//         await onUserAdded(); // <-- Call parent function to refresh state
//         return { success: true };
//       } catch (error: unknown) {
//         let errorMessage = 'Failed to create user.';
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
//       <h2 className="text-xl font-semibold text-gray-800">Add New User</h2>
//       <Input name="name" placeholder="Full Name" required />
//       <Input name="email" placeholder="Email Address" type="email" required />
//       <Select name="role" required>
//         <option value="">Select Role</option>
//         {Object.values(RoleEnum).map((role) => (
//           <option key={role} value={role}>
//             {role}
//           </option>
//         ))}
//       </Select>
//       <Select name="departmentId">
//         <option value="">Select Department (Optional)</option>
//         {departments.map((dept) => (
//           <option key={dept.id} value={dept.id}>
//             {dept.name}
//           </option>
//         ))}
//       </Select>
//       <button
//         type="submit"
//         disabled={pending}
//         className={`px-6 py-2 text-sm font-medium rounded-md text-white transition-colors ${
//           pending ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'
//         }`}
//       >
//         {pending ? 'Adding...' : 'Add User'}
//       </button>
//     </form>
//   );
// }

// export default function UserManagementTable({
//   initialUsers,
//   departments,
// }: UserManagementTableProps) {
//   const [users, setUsers] = useState(initialUsers);

//   const handleUserAdded = async () => {
//     try {
//       const updatedUsers = await fetchUsers();
//       setUsers(updatedUsers);
//     } catch (error) {
//       console.error('Failed to re-fetch users:', error);
//       toast.error('Failed to update user list.');
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
//                   Name
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Email
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Role
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Department
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {users.map((user) => (
//                 <tr key={user.id}>
//                   <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
//                   <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
//                   <td className="px-6 py-4 whitespace-nowrap">{user.role}</td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     {user.department?.name || 'N/A'}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
//                     <button
//                       onClick={() => {
//                         /* handle edit */
//                       }}
//                       className="text-indigo-600 hover:text-indigo-900 mr-4"
//                     >
//                       Edit
//                     </button>
//                     <form action={() => deleteUser(user.id)} className="inline">
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
//       <AddUserForm departments={departments} onUserAdded={handleUserAdded} />
//     </div>
//   );
// }
