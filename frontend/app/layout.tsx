import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ClipForge",
  description: "Find strong moments and turn them into vertical video clips.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
