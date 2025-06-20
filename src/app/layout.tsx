import "@/globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Name 100 Norwegians",
  description: "How fast can you name 100 Norwegian people?",
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
