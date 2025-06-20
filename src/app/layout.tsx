import "@/globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Name 2 Norwegians",
  description: "How fast can you name 2 Norwegian people?",
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
