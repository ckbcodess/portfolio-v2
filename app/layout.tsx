import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const openRunde = localFont({
  src: [
    {
      path: "./fonts/OpenRunde-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/OpenRunde-Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/OpenRunde-Semibold.otf",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/OpenRunde-Bold.otf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-sans",
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
    <html lang="en" suppressHydrationWarning className={openRunde.variable}>
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
