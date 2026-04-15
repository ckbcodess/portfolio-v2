"use client";


import Image from "next/image";
import TransitionLink from "@/components/TransitionLink";
import TabsSection from "@/components/TabsSection";
import { useRef, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Volume2 } from "lucide-react";
import ThemeControls from "@/components/ThemeControls";


import { caseStudies } from "@/content/case-studies";

export default function Home() {
  const pageRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={pageRef} className="min-h-screen bg-background flex flex-col items-center py-12 px-6 selection:bg-primary selection:text-primary-foreground">
      <div className="w-full max-w-[600px]">
        <main className="w-full flex flex-col justify-start items-center gap-20">
            
            {/* Status Bar */}
            <header className="self-stretch inline-flex justify-between items-center opacity-80">
              <div className="flex justify-start items-center gap-4">
                <ThemeControls />
                <Volume2 size={14} className="text-foreground opacity-80" />
              </div>
              <div className="flex justify-start items-center gap-3">
                <div className="text-center justify-start text-foreground text-sm font-medium font-sans">
                  <Clock />
                </div>
              </div>
            </header>

            {/* Profile, Heading & Tabs Section */}
            <section className="self-stretch flex flex-col justify-start items-start gap-10">
              
              {/* Profile */}
              <div className="inline-flex justify-center items-center gap-3">
                <Image 
                  className="w-8 h-8 rounded-full" 
                  src="/avatar.webp" 
                  alt="Ransford Gyasi" 
                  width={32} 
                  height={32} 
                  priority
                />
                <div className="text-center justify-start text-muted-foreground text-sm font-medium font-sans leading-5">Ransford Gyasi</div>
              </div>

              {/* Headline & Tabs */}
              <div className="w-full">
                <TabsSection />
              </div>

              {/* Action Buttons */}
              <div className="inline-flex justify-start items-start gap-4">
                <button className="px-5 py-2.5 bg-foreground rounded-full flex justify-center items-center gap-1 transition-all hover:scale-[1.02] active:scale-[0.98] group cursor-pointer">
                  <div className="text-center justify-start text-background text-[14px] font-medium font-sans">Connect with me</div>
                </button>
                <button className="px-5 py-2.5 bg-foreground/5 dark:bg-foreground/10 hover:bg-foreground/10 dark:hover:bg-foreground/15 rounded-full flex justify-center items-center gap-1 border border-foreground/5 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
                  <div className="text-center justify-start text-foreground text-[14px] font-medium font-sans">Read Resume</div>
                </button>
              </div>

            </section>

            {/* Featured Work Card */}
            <div className="w-full">
              <TransitionLink
                href="/work/the-allex"
                label="The Allex"
                color="#f04945"
                className="self-stretch w-full aspect-[600/312] relative rounded-3xl overflow-hidden group block"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#ff5e57] to-[#ff3b30] flex items-center justify-center transition-transform duration-700 group-hover:scale-110">
                   <div className="flex items-center gap-2">
                     <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
                       <path d="M5 4v16l14-8L5 4z" fill="currentColor"/>
                     </svg>
                     <span className="text-white text-3xl font-medium tracking-tight">theallex</span>
                   </div>
                </div>
              </TransitionLink>
            </div>

            {/* Bottom Content Lists */}
            <div className="self-stretch flex flex-col justify-start items-start gap-14">
              
              {/* Case Studies */}
              <div className="self-stretch flex flex-col justify-start items-start gap-8">
                <div className="inline-flex justify-start items-center gap-3">
                  <div className="justify-center text-muted-foreground text-sm font-medium font-sans leading-4 tracking-tight">Case Studies</div>
                </div>
                <div className="flex flex-col justify-start items-start gap-6 md:gap-7 w-full">
                  {caseStudies.map((study) => (
                    <ProjectItem 
                      key={study.slug}
                      title={study.logoText || study.title} 
                      subtitle={study.sections[0].heading} 
                      slug={study.slug}
                      color={study.logoClassName?.includes('#') ? study.logoClassName.split('[')[1].split(']')[0] : undefined}
                    />
                  ))}
                </div>
              </div>

              {/* Stack */}
              <div className="self-stretch flex flex-col justify-start items-start gap-8">
                <div className="justify-center text-muted-foreground text-sm font-medium font-sans leading-4 tracking-tight">Stack</div>
                <div className="flex flex-col justify-start items-start gap-6">
                  <ProjectItem title="Figma" subtitle="UI/UX Design" slug="" isStack />
                  <ProjectItem title="Next.js" subtitle="Frontend" slug="" isStack />
                  <ProjectItem title="GSAP" subtitle="Motion" slug="" isStack />
                </div>
              </div>

              {/* Connect */}
              <div className="self-stretch flex flex-col justify-start items-start gap-8">
                <div className="justify-center text-muted-foreground text-sm font-medium font-sans leading-4 tracking-tight">Connect</div>
                <div className="flex flex-col justify-start items-start gap-6">
                  <a href="https://linkedin.com" target="_blank" className="opacity-40 text-foreground text-sm font-normal font-sans hover:opacity-100 transition-opacity">LinkedIn</a>
                  <a href="https://twitter.com" target="_blank" className="opacity-40 text-foreground text-sm font-normal font-sans hover:opacity-100 transition-opacity">Twitter / X</a>
                  <a href="mailto:ransfordgyasi98@gmail.com" className="opacity-40 text-foreground text-sm font-normal font-sans hover:opacity-100 transition-opacity">Email</a>
                </div>
              </div>

            </div>

          </main>
        </div>
    </div>
  );
}

function ProjectItem({ 
  title, 
  subtitle, 
  slug, 
  color = "#ff4d4d", 
  isStack = false 
}: { 
  title: string; 
  subtitle: string; 
  slug: string; 
  color?: string;
  isStack?: boolean;
}) {
  const content = (
    <div className="group flex items-center gap-5 cursor-pointer w-full">
      <div 
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-500 group-hover:scale-105 group-hover:rotate-3 shadow-sm"
        style={{ backgroundColor: color }}
      >
        <span className="text-white text-[10px] font-bold uppercase tracking-widest opacity-90">{title.slice(0, 5)}</span>
      </div>
      <div className="flex flex-col justify-center items-start">
        <div className="text-foreground text-[17px] font-normal font-sans group-hover:translate-x-1 transition-transform duration-300">{title}</div>
        <div className="text-muted-foreground text-[14px] font-normal font-sans leading-tight mt-0.5 line-clamp-1">{subtitle}</div>
      </div>
    </div>
  );

  if (isStack || !slug) return content;

  return (
    <TransitionLink href={`/work/${slug}`} label={title} color={color} className="w-full">
      {content}
    </TransitionLink>
  );
}

function Clock() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const updateTime = () => setTime(new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }));
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);
  return <span>{time}</span>;
}