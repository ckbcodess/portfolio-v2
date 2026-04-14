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
                <button className="px-4 py-2 bg-foreground rounded-[248px] flex justify-center items-center gap-1 transition-transform hover:scale-105 active:scale-95 group">
                  <div className="text-center justify-start text-background text-sm font-medium font-sans">Connect with me</div>
                </button>
                <button className="px-4 py-2 bg-foreground/10 hover:bg-foreground/15 rounded-[248px] flex justify-center items-center gap-1 border border-foreground/10 transition-transform hover:scale-105 active:scale-95">
                  <div className="text-center justify-start text-foreground text-sm font-medium font-sans">Ransford Gyasi</div>
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
                  <div className="justify-center text-zinc-400 text-sm font-medium font-sans leading-4">Case Studies</div>
                </div>
                <div className="flex flex-col justify-start items-start gap-6">
                  <ProjectItem title="Allex" subtitle="App Design" />
                  <ProjectItem title="Allex" subtitle="App Design" />
                </div>
              </div>

              {/* Stack */}
              <div className="self-stretch flex flex-col justify-start items-start gap-8">
                <div className="justify-center text-zinc-400 text-sm font-medium font-sans leading-4">Stack</div>
                <div className="flex flex-col justify-start items-start gap-6">
                  <ProjectItem title="Allex" subtitle="App Design" />
                  <ProjectItem title="Allex" subtitle="App Design" />
                  <ProjectItem title="Allex" subtitle="App Design" />
                </div>
              </div>

              {/* Connect */}
              <div className="self-stretch flex flex-col justify-start items-start gap-8">
                <div className="justify-center text-zinc-400 text-sm font-medium font-sans leading-4">Connect</div>
                <div className="flex flex-col justify-start items-start gap-6">
                  <div className="opacity-30 text-center justify-start text-foreground text-sm font-normal font-sans cursor-pointer hover:opacity-100 transition-opacity">Recruiters</div>
                  <div className="opacity-30 text-center justify-start text-foreground text-sm font-normal font-sans cursor-pointer hover:opacity-100 transition-opacity">Recruiters</div>
                  <div className="opacity-30 text-center justify-start text-foreground text-sm font-normal font-sans cursor-pointer hover:opacity-100 transition-opacity">Recruiters</div>
                </div>
              </div>

            </div>

          </main>
        </div>
    </div>
  );
}

function ProjectItem({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="inline-flex justify-end items-center gap-5 group cursor-pointer">
      <div className="w-10 h-10 bg-[#ff4d4d] rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
        <span className="text-white text-[10px] font-medium opacity-80">allex</span>
      </div>
      <div className="inline-flex flex-col justify-center items-start">
        <div className="text-center justify-start text-foreground text-xl font-normal font-sans group-hover:text-foreground/80 transition-colors">{title}</div>
        <div className="opacity-60 text-center justify-start text-foreground text-sm font-normal font-sans">{subtitle}</div>
      </div>
    </div>
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