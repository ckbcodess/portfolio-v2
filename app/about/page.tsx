"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { SpecialText } from "@/components/special-text";



export default function AboutPage() {
  const pageRef = useRef<HTMLDivElement>(null);
  const [canAnimate, setCanAnimate] = useState(false);

  useEffect(() => {
    // @ts-expect-error global appLoaded flag
    if (globalThis.appLoaded) {
      setTimeout(() => setCanAnimate(true), 0);
    } else {
      const handler = () => setCanAnimate(true);
      window.addEventListener("apps-loaded", handler);
      return () => window.removeEventListener("apps-loaded", handler);
    }
  }, []);

  useGSAP(() => {
    if (!canAnimate) return;
    gsap.fromTo(
      ".about-reveal",
      { y: 40, autoAlpha: 0 },
      {
        y: 0,
        autoAlpha: 1,
        duration: 0.6,
        stagger: 0.05,
        ease: "power4.out",
        delay: 0.05,
      }
    );
  }, { scope: pageRef, dependencies: [canAnimate] });

  return (
    <div ref={pageRef} className="min-h-screen bg-background selection:bg-foreground selection:text-background">
      <div id="smooth-wrapper">
        <div id="smooth-content">
          <main className="pt-32 md:pt-44 pb-40 px-[var(--page-px)] max-w-[960px]">
            <div className="flex flex-col gap-10 md:gap-12">
              {/* Profile Header */}
              <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start">
                <div className="about-reveal invisible shrink-0">
                  <div className="w-24 h-24 md:w-48 md:h-48 rounded-[24px] md:rounded-[32px] overflow-hidden bg-muted border border-border">
                    <Image 
                      src="/avatar.webp" 
                      alt="Ransford Gyasi" 
                      width={192}
                      height={192}
                      priority
                      className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                    />
                  </div>
                </div>
                
                <div className="flex flex-col gap-4 md:gap-6">
                  <div className="about-reveal invisible">
                    <SpecialText className="text-blue-500 mb-2 font-mono font-medium">About me</SpecialText>
                    <h1 className="text-3xl md:text-6xl font-normal tracking-tight text-foreground">
                      I build digital products that feel right.
                    </h1>
                  </div>
                  
                  <div className="about-reveal invisible max-w-2xl flex flex-col gap-4 md:gap-6">
                    <p className="text-lg md:text-2xl text-muted-foreground leading-relaxed">
                      I'm Ransford, a product designer and developer focused on crafting high-fidelity interfaces and interactive experiences. I believe the best products are a perfect blend of logic and emotion.
                    </p>
                    <p className="text-[1rem] text-muted-foreground/80 leading-relaxed">
                      Currently exploring the intersection of creative coding, motion design, and product engineering. I love pushing the boundaries of what's possible on the web, usually with a focus on performance and micro-interactions.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-12 md:mt-20">
                <div className="about-reveal invisible flex justify-between items-center mb-8 md:mb-10 border-b border-border pb-4">
                  <h2 className="text-foreground font-normal text-lg">Experience</h2>
                  <span className="text-muted-foreground text-sm">2018 — Present</span>
                </div>
                
                <div className="flex flex-col gap-10 md:gap-12">
                  {[
                    { company: "The Allex", role: "Product Designer", period: "2023 - Present", description: "Leading design and frontend development for an all-in-one productivity suite." },
                    { company: "Independent", role: "Freelance Designer & Dev", period: "2021 - 2023", description: "Helping startups ship high-quality MVPs and design systems." },
                    { company: "Creative Agency", role: "UI Designer", period: "2019 - 2021", description: "Crafting digital identities and websites for global brands." },
                  ].map((exp, i) => (
                    <div key={i} className="about-reveal invisible flex flex-col md:flex-row gap-2 md:gap-12 md:items-baseline">
                      <div className="md:w-48 shrink-0">
                        <span className="text-sm text-muted-foreground font-mono">{exp.period}</span>
                      </div>
                      <div className="flex flex-col gap-2">
                        <h3 className="text-xl font-normal text-foreground">{exp.role} — {exp.company}</h3>
                        <p className="text-muted-foreground max-w-xl">{exp.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skills/Stack */}
              <div className="mt-12 md:mt-20">
                <div className="about-reveal invisible flex justify-between items-center mb-8 md:mb-10 border-b border-border pb-4">
                  <h2 className="text-foreground font-normal text-lg">Toolkit</h2>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-10">
                  {[
                    { category: "Design", items: ["Figma", "Lottie", "After Effects", "Principle"] },
                    { category: "Frontend", items: ["Next.js", "React", "TypeScript", "Tailwind"] },
                    { category: "Motion", items: ["GSAP", "Framer Motion", "Three.js", "GLSL"] },
                    { category: "Backend", items: ["Node.js", "PostgreSQL", "Supabase", "Prisma"] },
                  ].map((cat, i) => (
                    <div key={i} className="about-reveal invisible flex flex-col gap-4">
                      <span className="text-sm font-mono text-blue-500 uppercase tracking-wider">{cat.category}</span>
                      <ul className="flex flex-col gap-2">
                        {cat.items.map((item) => (
                          <li key={item} className="text-foreground/80 hover:text-foreground transition-colors">{item}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>


    </div>
  );
}
