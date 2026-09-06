import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Labelwise - know what is inside",
  description: "Search packaged foods and understand their nutrition."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

