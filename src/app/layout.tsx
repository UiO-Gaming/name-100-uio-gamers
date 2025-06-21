import Providers from "@/components/Providers";
import "@/globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Name 100 UiO Gamers",
  description: "How fast can you name 100 UiO Gamers?",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
