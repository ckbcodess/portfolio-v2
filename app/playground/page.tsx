"use client";

import { useRef, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Header from "@/components/Header";
import { SpecialText } from "@/components/special-text";
import { Marquee } from "@/components/marquee";

const FloatingNav = dynamic(() => import("@/components/FloatingNav"), {
  ssr: false,
});

const experiments = [
  {
    title: "Liquid Refraction",
    category: "Creative Coding",
    description: "An Apple-inspired refractive glass engine built with React and WebGL.",
    color: "bg-blue-500/10",
    accent: "text-blue-500"
  },
  {
    title: "Shader Music Visualizer",
    category: "GLSL / Audio",
    description: "Transforming sound frequencies into reactive fragment shaders.",
    color: "bg-purple-500/10",
    accent: "text-purple-500"
  },
  {
    title: "Elastic Drawer",
    category: "Interaction",
    description: "A physics-based bottom sheet component with spring dynamics.",
    color: "bg-orange-500/10",
    accent: "text-orange-500"
  },
  {
    title: "Bento Grids",
    category: "Layout",
    description: "Responsive and dynamic masonry layouts for modern portfolios.",
    color: "bg-emerald-500/10",
    accent: "text-emerald-500"
  },
  {
    title: "Kinetic Typography",
    category: "Motion",
    description: "Experimental text animations using GSAP and ScrollTrigger.",
    color: "bg-rose-500/10",
    accent: "text-rose-500"
  },
  {
    title: "Neuro-Adaptive UI",
    category: "Exeriment",
    description: "Interfaces that adapt based on user interaction patterns.",
    color: "bg-zinc-500/10",
    accent: "text-zinc-500"
  }
];

export default function PlaygroundPage() {
  const pageRef = useRef<HTMLDivElement>(null);
  const [canAnimate, setCanAnimate] = useState(false);

  useEffect(() => {
    if ((globalThis as any).appLoaded) {
      setCanAnimate(true);
    } else {
      const handler = () => setCanAnimate(true);
      window.addEventListener("apps-loaded", handler);
      return () => window.removeEventListener("apps-loaded", handler);
    }
  }, []);

  useGSAP(() => {
    if (!canAnimate) return;
    gsap.fromTo(
      ".playground-reveal",
      { y: 40, autoAlpha: 0 },
      {
        y: 0,
        autoAlpha: 1,
        duration: 1.2,
        stagger: 0.1,
        ease: "power4.out",
        delay: 0.1,
      }
    );
  }, { scope: pageRef, dependencies: [canAnimate] });

  return (
    <div ref={pageRef} className="min-h-screen bg-background selection:bg-foreground selection:text-background">
      <Header />
      
      <div id="smooth-wrapper">
        <div id="smooth-content">
          <main className="pt-24 md:pt-32 pb-40">
            <div className="px-6 max-w-[960px] mx-auto mb-16 md:mb-20 text-center">
              <div className="playground-reveal invisible mb-4">
                <SpecialText className="text-blue-500 font-mono font-medium">PLAYGROUND</SpecialText>
              </div>
              <h1 className="playground-reveal invisible text-4xl md:text-7xl font-semibold tracking-tight text-foreground mb-6">
                Experiments & Sketches.
              </h1>
              <p className="playground-reveal invisible text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                A collection of interactive prototypes, creative coding explorations, and design experiments that didn't make it to main projects.
              </p>
            </div>

            <div className="w-full mb-20">
              <Marquee pauseOnHover className="[--duration:40s]">
                {experiments.map((exp, i) => (
                  <div 
                    key={i} 
                    className="flex items-center gap-2 px-6 py-2 rounded-full border border-border bg-muted/30 mx-2"
                  >
                    <div className={`w-2 h-2 rounded-full bg-blue-500 animate-pulse`} />
                    <span className="text-sm font-medium whitespace-nowrap">{exp.title}</span>
                  </div>
                ))}
              </Marquee>
            </div>

            <div className="px-6 max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {experiments.map((exp, i) => (
                <div 
                  key={i}
                  className="playground-reveal invisible group relative p-8 rounded-[32px] border border-border bg-muted/20 hover:bg-muted/40 transition-all duration-500 flex flex-col gap-8 aspect-square"
                >
                  <div className="flex flex-col gap-2">
                    <span className={`text-xs font-mono uppercase tracking-widest ${exp.accent}`}>{exp.category}</span>
                    <h3 className="text-2xl font-medium text-foreground">{exp.title}</h3>
                  </div>
                  
                  <p className="text-muted-foreground leading-relaxed flex-grow">
                    {exp.description}
                  </p>
                  
                  <div className={`h-1/2 w-full rounded-2xl ${exp.color} overflow-hidden flex items-center justify-center relative`}>
                     {/* Placeholder for interactive preview icon/illus */}
                     <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-foreground to-transparent" />
                     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={`w-8 h-8 ${exp.accent} group-hover:scale-110 transition-transform duration-500`}>
                        <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
                     </svg>
                  </div>

                  <div className="absolute bottom-8 right-8 w-10 h-10 rounded-full border border-border flex items-center justify-center bg-background scale-0 group-hover:scale-100 transition-all duration-500 hover:bg-foreground hover:text-background cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="7" y1="17" x2="17" y2="7"></line>
                      <polyline points="7 7 17 7 17 17"></polyline>
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>

      <FloatingNav />
    </div>
  );
}
