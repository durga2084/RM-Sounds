import { Metadata } from "next";
import RegisterPWA from "@/components/public/RegisterPWA";
import PushNotificationButton from "@/components/public/PushNotificationButton";
import AdminLayoutShell from "../../components/admin/AdminLayoutShell";
import AdminAuthRedirect from "@/components/admin/AdminAuthRedirect";

export const metadata: Metadata = {
  manifest: "/manifest-admin.webmanifest",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AdminAuthRedirect />
      <RegisterPWA manifestHref="/manifest-admin.webmanifest" />
      <AdminLayoutShell>{children}</AdminLayoutShell>
      <PushNotificationButton role="Admin" />
    </>
  );
}
