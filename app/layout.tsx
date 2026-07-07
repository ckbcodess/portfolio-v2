import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ransford Gyasi",
  description:
    "Welcome to Ransford's Portfolio – a showcase of creativity, skill, and passion. Explore my work and let's bring ideas to life together.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={geist.variable}>
      <head>
        <link
          rel="preload"
          as="image"
          href="/avatar.webp"
          type="image/webp"
          fetchPriority="high"
        />
      </head>
      <body className="font-sans font-normal antialiased text-foreground bg-background">
        {children}
      </body>
    </html>
  );
}
