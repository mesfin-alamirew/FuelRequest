// src/app/admin/manage-users/page.tsx
import Layout from '@/components/Layout';
import { fetchUsers } from '@/lib/actions/admin';
import UserManagementTable from '@/components/UserManagementTable';
import Search from '@/components/Search';
import { fetchDepartments } from '@/lib/actions/admin';

export default async function ManageUsersPage({
  searchParams,
}: {
  searchParams?: { query?: string };
}) {
  const query = searchParams?.query || '';
  const users = await fetchUsers(query); // Pass query to fetchUsers
  const departments = await fetchDepartments();
  return (
    <div className="flex flex-col gap-2 p-8">
      <h1 className="text-3xl font-bold mb-8">Manage Users</h1>
      <Search placeholder="Search users..." />
      <UserManagementTable initialUsers={users} departments={departments} />
    </div>
  );
}
