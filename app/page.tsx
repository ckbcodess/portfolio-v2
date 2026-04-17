"use client";


import Image from "next/image";
import TransitionLink from "@/components/TransitionLink";
import TabsSection from "@/components/TabsSection";
import { useRef, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { motion, AnimatePresence } from "motion/react";
import { createPortal } from "react-dom";
import { useSound } from "@/components/SoundProvider";
import { Volume2, VolumeX } from "lucide-react";
import ThemeControls from "@/components/ThemeControls";


import { caseStudies } from "@/content/case-studies";

export default function Home() {
  const { isSoundEnabled, toggleSound } = useSound();
  const pageRef = useRef<HTMLDivElement>(null);
  const [activeImage, setActiveImage] = useState<string>(caseStudies[0].heroSrc);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const showreelImages = [
    "/allex-card.png",
    "/allex-hero.webp",
    "/img-61.webp",
    "/gcb-card.webp"
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.8, 
        ease: [0.16, 1, 0.3, 1] 
      } 
    }
  };

  return (
    <div ref={pageRef} className="bg-background min-h-screen pt-8 md:pt-16 pb-12 px-6 md:px-12 lg:px-[120px] xl:px-[160px] w-full selection:bg-primary selection:text-primary-foreground">
      
      {/* Status Bar - Refined alignment */}
      <motion.header 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full flex justify-between items-center gap-4 mb-16 lg:mb-40"
      >
        <div className="flex justify-start items-center gap-4 md:gap-6">
          <ThemeControls />
          <div className="w-[1px] h-3 bg-border/20" />
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={toggleSound}
            className="text-foreground/40 hover:text-foreground transition-colors flex items-center justify-center gap-2 min-h-[44px] px-2 -mx-2 md:min-h-0 md:px-0 md:-mx-0"
            aria-label={isSoundEnabled ? "Disable sound" : "Enable sound"}
          >
            {isSoundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
            <span className="text-[10px] uppercase tracking-wider font-medium">{isSoundEnabled ? "On" : "Off"}</span>
          </motion.button>
        </div>
        <div className="flex justify-start items-center">
          <span className="text-foreground/40 text-[11px] font-medium font-sans uppercase tracking-[0.1em]">
            <Clock />
          </span>
        </div>
      </motion.header>

      {/* Main Layout - 2-Column Split to keep content on the left */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-10 relative items-start">
        
        {/* Left Column (Content) */}
        <motion.main 
          variants={container}
          initial="hidden"
          animate="show"
          className="flex flex-col w-full max-w-[540px] justify-start items-start gap-20"
        >

            {/* Profile, Heading & Tabs Section */}
            <motion.section variants={item} className="self-stretch flex flex-col justify-start items-start gap-10">

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
                <p className="text-center justify-start text-muted-foreground text-base font-medium font-sans leading-5">Ransford Gyasi</p>
              </div>

              {/* Headline & Tabs */}
              <TabsSection />

              {/* Action Buttons */}
              <nav className="inline-flex justify-start items-start gap-4">
                <motion.button 
                  whileTap={{ scale: 0.96 }}
                  aria-label="Connect with Ransford"
                  className="px-6 py-3 md:px-5 md:py-2.5 bg-foreground rounded-full flex justify-center items-center gap-1 transition-all hover:scale-[1.02] active:scale-[0.98] group cursor-pointer"
                >
                  <span className="text-center justify-start text-background text-[14px] font-medium font-sans">Connect with me</span>
                </motion.button>
                <motion.button 
                  whileTap={{ scale: 0.96 }}
                  aria-label="View Resume"
                  className="px-6 py-3 md:px-5 md:py-2.5 bg-foreground/5 dark:bg-foreground/10 hover:bg-foreground/10 dark:hover:bg-foreground/15 rounded-full flex justify-center items-center gap-1 border border-foreground/5 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <span className="text-center justify-start text-foreground text-[14px] font-medium font-sans">Read Resume</span>
                </motion.button>
              </nav>

            </motion.section>
 
            {/* Bottom Content Lists - Significant vertical rhythm increase */}
            <motion.div variants={item} className="self-stretch flex flex-col justify-start items-start gap-16 md:gap-24 pb-20 md:pb-32">

              {/* Case Studies */}
              <section className="self-stretch flex flex-col justify-start items-start gap-8">
                <div className="inline-flex justify-start items-center gap-3">
                  <h2 className="justify-center text-muted-foreground text-sm font-medium font-sans leading-4 tracking-tight uppercase">Case Studies</h2>
                </div>
                <motion.div variants={container} className="flex flex-col justify-start items-start gap-6 md:gap-7 w-full">
                  {caseStudies.map((study) => (
                    <motion.div 
                      key={study.slug} 
                      variants={item} 
                      className="w-full"
                      onMouseEnter={() => setActiveImage(study.heroSrc)}
                    >
                      <ProjectItem
                        title={study.logoText || study.title}
                        subtitle={study.sections[0].heading}
                        slug={study.slug}
                        color={study.logoClassName?.includes('#') ? study.logoClassName.split('[')[1].split(']')[0] : "#ff4d4d"}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              </section>

              {/* Stack */}
              <section className="self-stretch flex flex-col justify-start items-start gap-8">
                <h2 className="justify-center text-muted-foreground text-sm font-medium font-sans leading-4 tracking-tight uppercase">Stack</h2>
                <motion.div variants={container} className="flex flex-col justify-start items-start gap-6 w-full">
                  <motion.div variants={item} className="w-full"><ProjectItem title="Figma" subtitle="UI/UX Design" slug="" isStack /></motion.div>
                  <motion.div variants={item} className="w-full"><ProjectItem title="Next.js" subtitle="Frontend" slug="" isStack /></motion.div>
                  <motion.div variants={item} className="w-full"><ProjectItem title="GSAP" subtitle="Motion" slug="" isStack /></motion.div>
                </motion.div>
              </section>

              {/* Connect */}
              <section className="self-stretch flex flex-col justify-start items-start gap-8">
                <h2 className="justify-center text-muted-foreground text-sm font-medium font-sans leading-4 tracking-tight uppercase">Connect</h2>
                <motion.div variants={container} className="flex flex-col justify-start items-start gap-6 w-full">
                  <motion.div variants={item}>
                    <motion.a 
                      whileTap={{ scale: 0.98, x: 2 }}
                      aria-label="LinkedIn Profile"
                      href="https://linkedin.com" target="_blank" className="inline-block opacity-40 text-foreground text-sm font-normal font-sans hover:opacity-100 transition-opacity"
                    >LinkedIn</motion.a>
                  </motion.div>
                  <motion.div variants={item}>
                    <motion.a 
                      whileTap={{ scale: 0.98, x: 2 }}
                      aria-label="Twitter X Profile"
                      href="https://twitter.com" target="_blank" className="inline-block opacity-40 text-foreground text-sm font-normal font-sans hover:opacity-100 transition-opacity"
                    >Twitter / X</motion.a>
                  </motion.div>
                  <motion.div variants={item}>
                    <motion.a 
                      whileTap={{ scale: 0.98, x: 2 }}
                      aria-label="Email Me"
                      href="mailto:ransfordgyasi98@gmail.com" className="inline-block opacity-40 text-foreground text-sm font-normal font-sans hover:opacity-100 transition-opacity"
                    >Email</motion.a>
                  </motion.div>
                </motion.div>
              </section>
            </motion.div>

          </motion.main>
        
        {/* Right Column Placeholder - Keeps content on the left */}
        <div className="hidden lg:block lg:w-[600px]" />
      </div>

      {/* Fixed Preview - Teleported to body to escape SmoothScroll transforms */}
      {mounted && createPortal(
        <div className="hidden lg:block pointer-events-none">
          <div className="fixed top-0 right-[120px] w-[600px] h-screen flex flex-col justify-end pb-12 z-50">
            <div className="w-[600px] h-[338px] rounded overflow-hidden bg-neutral-900 pointer-events-auto relative shadow-2xl">
              <AnimatePresence mode="wait">
                {activeImage && (
                  <motion.div
                    key={activeImage}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, ease: "linear" }}
                    className="absolute inset-0"
                  >
                    <Image
                      src={activeImage}
                      alt="Case Study Preview"
                      fill
                      sizes="600px"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>,
        document.body
      )}
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
        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-all duration-500 group-hover:scale-105 group-hover:rotate-3 shadow-sm"
        style={{ backgroundColor: color }}
      >
        <span className="text-white text-[10px] font-bold uppercase tracking-widest opacity-90">{title.slice(0, 5)}</span>
      </div>
      <div className="flex flex-col justify-center items-start">
        <h3 className="text-foreground text-[17px] font-normal font-sans group-hover:translate-x-1 transition-transform duration-300">{title}</h3>
        <p className="text-muted-foreground text-[14px] font-normal font-sans leading-tight mt-0.5 line-clamp-1">{subtitle}</p>
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
  const [isoTime, setIsoTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' }));
      setIsoTime(now.toISOString());
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return <time dateTime={isoTime}>{time}</time>;
}