import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Easy Car - Car Rental Platform",
  description: "Multi-tenant car rental platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}


