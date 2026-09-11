import DashboardLayout from "@/components/layout/DashboardLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function MemberLayout({ children }) {
  return (
    <ProtectedRoute allowedRoles={["MEMBER"]}>
      <DashboardLayout>{children}</DashboardLayout>
    </ProtectedRoute>
  );
}