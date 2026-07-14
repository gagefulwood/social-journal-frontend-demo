import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { AppShell } from "@/components/layout/AppShell";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Social Journal",
  description:
    "A private place to remember the people and moments that matter.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col xl:h-full xl:min-h-0">
        <AppShell>{children}</AppShell>
        <Toaster />
      </body>
    </html>
  );
}
