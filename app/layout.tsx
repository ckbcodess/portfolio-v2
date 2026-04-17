import type { Metadata } from "next";
import { Google_Sans_Flex, Geist } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeColorProvider } from "@/components/theme-color-provider";
import TransitionProvider from "@/components/TransitionProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SoundProvider } from "@/components/SoundProvider";
import { cn } from "@/lib/utils";
import ClickFeedback from "@/components/ClickFeedback";


const googleSans = Google_Sans_Flex({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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
    <html lang="en" suppressHydrationWarning className={googleSans.variable}>
      <body className="font-sans antialiased text-foreground bg-background">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ThemeColorProvider>
            <SoundProvider>
              <TooltipProvider delay={300}>
                <ClickFeedback />
                <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-[999999] bg-background px-4 py-2 rounded-lg border border-border">
                  Skip to content
                </a>
                <TransitionProvider>
                  <div id="main-content" className="outline-none" tabIndex={-1}>
                    {children}
                  </div>
                </TransitionProvider>
              </TooltipProvider>
            </SoundProvider>
          </ThemeColorProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
