import Layout from '@/components/Layout';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // <AuthenticatedTemplate>
    <Layout>{children}</Layout>
    // </AuthenticatedTemplate>
  );
}
