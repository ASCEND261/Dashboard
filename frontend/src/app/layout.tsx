import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { ThemeProvider } from "@/lib/theme-context";
import Navbar from "@/components/navbar";
import HyperspeedBackground from "@/components/hyperspeed-background";
import MobileBottomNav from "@/components/mobile-bottom-nav";
import BackendKeepAlive from "@/components/backend-keep-alive";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "ASCEND — Every Achievement. One Ascent.",
  description:
    "A trusted SaaS infrastructure for recording, verifying, and measuring team achievements throughout the Tech Sprint Journey.",
  icons: {
    icon: "/logo.svg",
    apple: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.className} bg-[#07080A] text-zinc-100 antialiased min-h-screen flex flex-col selection:bg-blue-600 selection:text-white transition-colors duration-200 relative`}
        suppressHydrationWarning
      >
        {/* Global Hyperspeed Warp Rays Background (matches user reference video) */}
        <HyperspeedBackground />

        <ThemeProvider>
          <AuthProvider>
            <BackendKeepAlive />
            <Navbar />
            {/* pb-20 on mobile to account for bottom nav; lg:pb-0 resets it */}
            <div className="flex-1 flex flex-col relative z-10 pb-20 lg:pb-0">
              {children}
            </div>
            <MobileBottomNav />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
