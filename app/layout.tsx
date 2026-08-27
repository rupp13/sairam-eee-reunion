import type { Metadata } from "next";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import MobileTabBar from "@/components/MobileTabBar";

export const metadata: Metadata = {
  title: "Sai Ram EEE 25 Year Reunion",
  description:
    "A warm reunion website for Sai Ram Engineering College's EEE Department alumni, with event details and RSVP.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-ink text-paper">
        <SiteHeader />
        <main className="flex-1 pb-20 sm:pb-0">{children}</main>
        <SiteFooter />
        <MobileTabBar />
      </body>
    </html>
  );
}
