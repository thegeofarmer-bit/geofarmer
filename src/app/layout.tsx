import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Suspense } from "react";
import { AssistantLauncher } from "@/components/assistant/assistant-launcher";
import { BottomNav, BottomNavView, Sidebar, SidebarView } from "@/components/layout/nav";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const mono = JetBrains_Mono({ variable: "--font-mono-face", subsets: ["latin"], weight: ["500", "700"] });

export const metadata: Metadata = {
  title: { default: "GeoFarmer", template: "%s · GeoFarmer" },
  description:
    "Crop suitability and rotation decision support for Ejura-Sekyedumase farms, built on NASA and SoilGrids data.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4efe4" },
    { media: "(prefers-color-scheme: dark)", color: "#15120e" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable} antialiased`}>
      <body className="min-h-dvh font-sans">
        <div className="flex min-h-dvh">
          <Suspense fallback={<SidebarView pathname="" />}>
            <Sidebar />
          </Suspense>
          <main className="min-w-0 flex-1 pb-28 lg:pb-0">{children}</main>
        </div>
        <Suspense fallback={<BottomNavView pathname="" />}>
          <BottomNav />
        </Suspense>
        <Suspense fallback={null}>
          <AssistantLauncher />
        </Suspense>
      </body>
    </html>
  );
}
