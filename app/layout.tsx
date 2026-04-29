import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeColorProvider } from "@/components/theme-color-provider";
import TransitionProvider from "@/components/TransitionProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SoundProvider } from "@/components/SoundProvider";
import ClickFeedback from "@/components/ClickFeedback";


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
      <body className="font-sans font-medium antialiased text-foreground bg-background">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <ThemeColorProvider>
            <SoundProvider>
              <TooltipProvider delay={300}>
                <ClickFeedback />
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
