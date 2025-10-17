// src/app/admin/manage-departments/page.tsx

import { fetchDepartments } from '@/lib/actions/admin';
import DepartmentManagementTable from '@/components/DepartmentManagementTable';
import ComponentCard from '@/components/ComponentCard';
import PageBreadcrumb from '@/components/PageBreadCrumb';

export default async function ManageDepartmentsPage() {
  const departments = await fetchDepartments();
  return (
    <div>
      <PageBreadcrumb pageTitle="Manage Departments" />
      <div className="space-y-6">
        <ComponentCard title="Departments' list ">
          <DepartmentManagementTable departments={departments} />
        </ComponentCard>
      </div>
    </div>
  );
}
