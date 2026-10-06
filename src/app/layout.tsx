import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  metadataBase: new URL("https://vidubuzz.com"),
  title: {
    default: "vidubuzz — Free HD Videos, Models & Channels",
    template: "%s | vidubuzz",
  },
  description:
    "Watch trending HD videos from verified channels and models. New uploads every hour, streamed in adaptive quality.",
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: "vidubuzz",
    url: "/",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh antialiased">
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
