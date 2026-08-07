import type { Metadata, Viewport } from "next";
import "./globals.css";
import localFont from "next/font/local";

const montserratLocal = localFont({
  src: "./fonts/Montserrat-VariableFont_wght.ttf",
  variable: "--font-montserrat-local",
  display: "swap",
});

const bodyClassName = "min-h-screen flex flex-col bg-background text-foreground";

export const metadata: Metadata = {
  applicationName: "RM Sounds",
  title: "RM Sounds",
  description:
    "RM Sounds — event sound, lighting, LED wall, DJ, wedding, political meeting, concert, roadshow, and event management business.",
  appleWebApp: {
    capable: true,
    title: "RM Sounds",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0B0F19",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${montserratLocal.variable} h-full`} suppressHydrationWarning>
      <body className={bodyClassName}>{children}</body>
    </html>
  );
}
