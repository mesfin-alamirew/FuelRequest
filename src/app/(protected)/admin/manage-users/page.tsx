// src/app/admin/manage-users/page.tsx

import { fetchUsers } from '@/lib/actions/admin';
import UserManagementTable from '@/components/UserManagementTable';

import { fetchDepartments } from '@/lib/actions/admin';
import PageBreadcrumb from '@/components/PageBreadCrumb';
import ComponentCard from '@/components/ComponentCard';

export default async function ManageUsersPage({
  searchParams,
}: {
  searchParams?: { query?: string };
}) {
  const query = searchParams?.query || '';
  const users = await fetchUsers(query); // Pass query to fetchUsers
  const departments = await fetchDepartments();
  return (
    <div>
      <PageBreadcrumb pageTitle="Manage Users" />
      <div className="space-y-6">
        <ComponentCard title="Users' list ">
          <UserManagementTable initialUsers={users} departments={departments} />
        </ComponentCard>
      </div>
    </div>
  );
}
