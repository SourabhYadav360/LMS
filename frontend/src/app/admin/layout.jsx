import DashboardLayout from "@/components/layout/DashboardLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function AdminLayout({ children }) {
  return (
    <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
      <DashboardLayout>{children}</DashboardLayout>
    </ProtectedRoute>
  );
}