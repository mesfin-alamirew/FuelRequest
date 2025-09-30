// src/app/admin/manage-departments/page.tsx
import Layout from '@/components/Layout';
import { fetchDepartments } from '@/lib/actions/admin';
import DepartmentManagementTable from '@/components/DepartmentManagementTable';

export default async function ManageDepartmentsPage() {
  const departments = await fetchDepartments();
  return (
    <div className="flex flex-col p-8">
      <h1 className="text-2xl font-bold">Manage Departments</h1>
      <DepartmentManagementTable initialDepartments={departments} />
    </div>
  );
}
