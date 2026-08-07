import { Metadata } from "next";
import RegisterPWA from "@/components/public/RegisterPWA";
import AdminLayoutShell from "../../components/admin/AdminLayoutShell";
import AdminAuthRedirect from "@/components/admin/AdminAuthRedirect";

// 1. Next.js reads this server-side to inject the manifest into the HTML <head>
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
      {/* 2. Handles service worker registration client-side */}
      <RegisterPWA manifestHref="/manifest-admin.webmanifest" />

      {/* 3. Wraps the children and handles layout routing state */}
      <AdminLayoutShell>{children}</AdminLayoutShell>
    </>
  );
}
