"use client";

import Image from "next/image";
import Header from "@/components/Header";
import TransitionLink from "@/components/TransitionLink";
import CaseStudySidebar from "@/components/CaseStudySidebar";
import MobileCaseStudyNav from "@/components/MobileCaseStudyNav";
import { CaseStudyContent } from "@/content/case-studies/types";
import { Badge } from "@/components/badge";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Lock, ArrowRight, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface CaseStudyPageProps {
  caseStudy: CaseStudyContent;
}

export default function CaseStudyPage({ caseStudy }: CaseStudyPageProps) {
  const [mounted, setMounted] = useState(false);
  const [password, setPassword] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check session storage to see if they've already unlocked it this session
    const authorized = sessionStorage.getItem(`authorized-${caseStudy.slug}`);
    if (authorized === "true") {
      setIsAuthorized(true);
    }
  }, [caseStudy.slug]);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    // THE PASSWORD: change this to whatever you want
    if (password === "gcb2024") {
      setIsAuthorized(true);
      setShowError(false);
      sessionStorage.setItem(`authorized-${caseStudy.slug}`, "true");
    } else {
      setShowError(true);
      setPassword("");
    }
  };

  const sidebarLinks = caseStudy.sections.reduce((acc, curr) => {
    const existing = acc.find((item) => item.label === curr.label);

    if (existing) {
      existing.targetIds.push(curr.id);
    } else {
      acc.push({ id: curr.id, label: curr.label, targetIds: [curr.id] });
    }

    return acc;
  }, [] as { id: string; label: string; targetIds: string[] }[]);

  sidebarLinks.unshift({ id: "intro", label: "Intro", targetIds: ["intro"] });

  const { theme } = useTheme();

  const getBadgeVariant = () => {
    if (!mounted) return "default";

    // If a theme is explicitly selected, let's favor that "team" color
    if (theme === "green") return "green";
    if (theme === "light") return "blue";
    if (theme === "dark" && !caseStudy.badgeVariant) return "indigo";

    // Otherwise, use the case study's specific brand color if available
    if (caseStudy.badgeVariant) return caseStudy.badgeVariant as any;

    return "default";
  };

  const badgeVariant = getBadgeVariant();

  if (caseStudy.isLocked && !isAuthorized) {
    return (
      <div className="min-h-screen bg-background w-full flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <Header variant="case-study" title="Protected Content" backLink="/" />
        
        {/* Background decorative element */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-card/30 backdrop-blur-xl border border-border p-8 rounded-3xl shadow-2xl relative z-10 flex flex-col items-center text-center"
        >
          <div className="w-16 h-16 bg-muted/50 rounded-2xl flex items-center justify-center mb-6 border border-white/5">
            <Lock className="text-foreground/80" size={28} />
          </div>
          
          <h1 className="text-2xl font-semibold text-foreground mb-2">NDA Protected</h1>
          <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
            The content of <strong>{caseStudy.title}</strong> is restricted. Please enter the access password provided to you.
          </p>

          <form onSubmit={handleUnlock} className="w-full">
            <div className="relative mb-4 group">
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (showError) setShowError(false);
                }}
                autoFocus
                className={`w-full h-12 bg-muted/40 hover:bg-muted/60 focus:bg-muted/80 border ${showError ? 'border-destructive' : 'border-border focus:border-primary'} rounded-xl px-4 outline-none transition-all placeholder:text-muted-foreground/50 text-foreground font-sans`}
              />
              <motion.button
                type="submit"
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.95 }}
                className="absolute right-2 top-2 h-8 w-8 bg-foreground rounded-lg flex items-center justify-center text-background shadow-lg transition-transform"
              >
                <ArrowRight size={16} />
              </motion.button>
            </div>

            <AnimatePresence>
              {showError && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 text-destructive text-xs font-medium pl-1 overflow-hidden"
                >
                  <ShieldAlert size={12} />
                  Invalid access password
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          <div className="mt-10 pt-6 border-t border-border/5 w-full">
              <TransitionLink href="/" label="Go back to Home" className="text-xs text-muted-foreground hover:text-foreground transition-colors tracking-widest font-medium">
                Back to home
              </TransitionLink>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background w-full relative">
      <Header variant="case-study" title={caseStudy.title} backLink="/" />


      <CaseStudySidebar links={sidebarLinks} />
      <MobileCaseStudyNav links={sidebarLinks} />

      <div className="fixed bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent pointer-events-none z-[60]" />

      <div id="smooth-wrapper">
        <div
          id="smooth-content"
          className="flex flex-col items-center pt-48 md:pt-64 px-6 pb-40 relative w-full"
        >
          <main className="w-full flex flex-col items-center relative z-10">
            <header id="intro" className="w-full max-w-[500px] pb-12 pt-16">
              <div className="relative w-10 h-10 rounded-xl overflow-hidden mb-6 bg-muted/40 border border-border flex items-center justify-center">
                {caseStudy.logoSrc ? (
                  <Image
                    src={caseStudy.logoSrc}
                    alt={caseStudy.logoAlt ?? `${caseStudy.title} logo`}
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <span
                    className={`text-[11px] font-semibold tracking-wide ${
                      caseStudy.logoClassName ?? "text-foreground"
                    }`}
                  >
                    {caseStudy.logoText ?? caseStudy.title.slice(0, 3).toUpperCase()}
                  </span>
                )}
              </div>

              <h1 className="text-[2rem] font-semibold leading-tight tracking-[-0.02em] text-foreground mb-3">
                {caseStudy.title}
              </h1>
              <p className="text-muted-foreground text-base leading-relaxed max-w-lg">
                {caseStudy.description}
              </p>

              <div className="flex flex-wrap gap-x-10 gap-y-4 mt-8">
                {caseStudy.meta.map(({ label, value }) => (
                  <div key={label}>
                    <div className="mb-1.5">
                      <Badge variant={badgeVariant}>
                        {label}
                      </Badge>
                    </div>
                    <p className="text-foreground text-sm pl-0.5">{value}</p>
                  </div>
                ))}
              </div>
            </header>

            <div className="w-full max-w-[760px] mb-20">
              <div className="relative rounded-2xl overflow-hidden shadow-sm border border-border aspect-video w-full bg-muted/20">
                <Image src={caseStudy.heroSrc} alt={caseStudy.heroAlt} fill className="object-cover" priority />
              </div>
            </div>

            <div className="w-full max-w-[500px]">
              <div className="flex flex-col gap-20 pb-24">
                {caseStudy.sections.map((section) => (
                  <section key={section.id} id={section.id}>
                    <div className="mb-3">
                      <Badge 
                        variant={badgeVariant} 
                      >
                        {section.label}
                      </Badge>
                    </div>
                    <h2 className="text-xl font-semibold text-foreground leading-snug mb-5">
                      {section.heading}
                    </h2>

                    <div className="flex flex-col gap-4">
                      {section.body.map((paragraph) => (
                        <p key={paragraph} className="text-muted-foreground text-base leading-relaxed">
                          {paragraph}
                        </p>
                      ))}
                    </div>

                    {section.bullets && (
                      <ul className="mt-4 flex flex-col gap-2 pl-5">
                        {section.bullets.map((bullet) => (
                          <li
                            key={bullet}
                            className="text-muted-foreground text-base leading-relaxed list-disc"
                          >
                            {bullet}
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>
                ))}
              </div>

              <div className="border-t border-border py-14">
                <p className="text-[11px] text-muted-foreground/80 tracking-widest font-medium mb-5">
                  Next
                </p>
                <TransitionLink
                  href={caseStudy.nextProject.href}
                  label={caseStudy.nextProject.label}
                  className="group inline-block"
                >
                  {caseStudy.nextProject.eyebrow && (
                    <p className="text-muted-foreground text-sm mb-1">{caseStudy.nextProject.eyebrow}</p>
                  )}
                  <h3 className="text-xl font-semibold text-foreground group-hover:text-muted-foreground transition-colors">
                    {caseStudy.nextProject.title}
                  </h3>
                </TransitionLink>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}