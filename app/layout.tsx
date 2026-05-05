import "./globals.css";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "AussieBasket — Save on groceries",
  description: "Upload your supermarket receipt and find cheaper prices at nearby Aussie stores.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-AU">
      <body className="min-h-screen">
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 pb-24 pt-6">{children}</main>
      </body>
    </html>
  );
}
