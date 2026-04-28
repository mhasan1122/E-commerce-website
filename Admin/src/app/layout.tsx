import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const dmsans = DM_Sans({ subsets: ["latin"], variable: "--font-dmsans" });

export const metadata: Metadata = {
  title: "Antigravity Admin | E-commerce Suite",
  description: "High-end role-based admin panel for e-commerce management.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning className={`${dmsans.variable} antialiased min-h-screen bg-surface selection:bg-mint/30`} cz-shortcut-listen="true">
        {children}
      </body>
    </html>
  );
}
