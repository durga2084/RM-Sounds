"use client";

import Navbar from "./Navbar";
import FloatingButtons from "./FloatingButtons";
import MobileBottomNav from "./MobileBottomNav";

export default function ClientShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <FloatingButtons />
      <main className="flex-1">{children}</main>
      <MobileBottomNav />
    </>
  );
}
