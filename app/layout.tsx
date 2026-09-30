import type { Metadata } from "next";
import "./globals.css";
import { DiscreetOverlay } from "@/components/DiscreetOverlay";

export const metadata: Metadata = {
  title: "kinkcartz",
  description: "Adults-only shop for bondage gear, pleasure devices, and fetish wear.",
  robots: { index: false, follow: false }, // flip on once age-verification + compliance is finalized
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-ink text-zinc-100 antialiased">
        {children}
        <DiscreetOverlay />
      </body>
    </html>
  );
}
