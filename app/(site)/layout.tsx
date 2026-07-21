import { ThemeProvider } from "@/components/theme-provider";
import { ThemeColorProvider } from "@/components/theme-color-provider";
import TransitionProvider from "@/components/TransitionProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SoundProvider } from "@/components/SoundProvider";
import ClickFeedback from "@/components/ClickFeedback";
import { getArchiveRows, getInfoSheet } from "@/lib/content";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [archiveRows, infoSheet] = await Promise.all([
    getArchiveRows(),
    getInfoSheet(),
  ]);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem={true}>
      <ThemeColorProvider>
        <SoundProvider>
          <TooltipProvider delay={300}>
            <ClickFeedback />
            <TransitionProvider archiveRows={archiveRows} infoSheet={infoSheet}>
              <div id="main-content" className="outline-none" tabIndex={-1}>
                {children}
              </div>
            </TransitionProvider>
          </TooltipProvider>
        </SoundProvider>
      </ThemeColorProvider>
    </ThemeProvider>
  );
}
