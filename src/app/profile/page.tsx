// src/app/profile/page.tsx
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col items-center justify-center p-24">
        <h1 className="text-4xl font-bold">
          Welcome to your protected profile!
        </h1>
        <p className="mt-4">
          This page is only visible to authenticated users.
        </p>
      </div>
    </ProtectedRoute>
  );
}
