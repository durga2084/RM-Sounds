import "./client.css";

import { Metadata } from "next";

import ClientShell from "@/components/public/ClientShell";
import RegisterPWA from "@/components/public/RegisterPWA";

export const metadata: Metadata = {
  manifest: "/manifest-client.webmanifest",
};

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <RegisterPWA manifestHref="/manifest-client.webmanifest" />
      <ClientShell>{children}</ClientShell>
    </>
  );
}
