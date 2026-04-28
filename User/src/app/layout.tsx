import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { AuthProvider } from "@/components/layout/AuthProvider";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/layout/CartDrawer";

const playfair = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const dmSans = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "LUXE — Premium E-Commerce",
  description:
    "Discover curated premium products with a luxury shopping experience. Free shipping, easy returns, and exclusive collections.",
  keywords: ["ecommerce", "luxury", "premium", "shopping", "fashion", "electronics"],
  openGraph: {
    title: "LUXE — Premium E-Commerce",
    description: "Discover curated premium products with a luxury shopping experience.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable}`} suppressHydrationWarning data-scroll-behavior="smooth">
      <body suppressHydrationWarning className="min-h-screen flex flex-col antialiased" cz-shortcut-listen="true">
        <ThemeProvider>
          <AuthProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <CartDrawer />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
