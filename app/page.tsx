"use client";

import Image from "next/image";
import TransitionLink from "@/components/TransitionLink";
import TabsSection from "@/components/TabsSection";
import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useSound } from "@/components/SoundProvider";
import ThemeControls from "@/components/ThemeControls";
import FixedPreview from "@/components/FixedPreview";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import BalloonGame from "@/components/BalloonGame";
import { Volume2, VolumeX, Gamepad2 } from "lucide-react";
import { caseStudies } from "@/content/case-studies";

export default function Home() {
  const { isSoundEnabled, toggleSound } = useSound();
  const pageRef = useRef<HTMLDivElement>(null);
  const [activeImage, setActiveImage] = useState<string>(caseStudies[0].heroSrc);
  const [isPlayMode, setIsPlayMode] = useState(false);
  const [surprises, setSurprises] = useState<number[]>([]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0,
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 15 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.6, 
        ease: [0.16, 1, 0.3, 1] 
      } 
    }
  };

  return (
    <div ref={pageRef} className="bg-background min-h-screen pt-8 md:pt-16 pb-12 px-6 md:px-12 lg:px-[120px] xl:px-[160px] w-full selection:bg-primary selection:text-primary-foreground">
      <BalloonGame isActive={isPlayMode} onClose={() => setIsPlayMode(false)} />
      
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
          
          <div className="flex items-center gap-4">
            <Tooltip>
              <TooltipTrigger>
                <motion.div 
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleSound}
                  className="text-foreground/40 hover:text-foreground transition-colors flex items-center justify-center gap-2 min-h-[44px] px-2 -mx-2 md:min-h-0 md:px-0 md:-mx-0 cursor-pointer"
                  aria-label={isSoundEnabled ? "Disable sound" : "Enable sound"}
                  role="button"
                  tabIndex={0}
                >
                  {isSoundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
                  <span className="text-[10px] uppercase tracking-wider font-medium">{isSoundEnabled ? "On" : "Off"}</span>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent side="bottom" sideOffset={8}>
                {isSoundEnabled ? "Mute" : "Unmute"}
              </TooltipContent>
            </Tooltip>

            <div className="w-[1px] h-3 bg-border/20" />

            <Tooltip>
              <TooltipTrigger>
                <motion.div 
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsPlayMode(!isPlayMode)}
                  className={`flex items-center justify-center gap-2 min-h-[44px] px-2 -mx-2 md:min-h-0 md:px-0 md:-mx-0 cursor-pointer transition-colors duration-300 ${isPlayMode ? 'text-foreground' : 'text-foreground/40 hover:text-foreground'}`}
                  aria-label={isPlayMode ? "Exit Play Mode" : "Enter Play Mode"}
                  role="button"
                  tabIndex={0}
                >
                  <div className="relative">
                    <Gamepad2 size={14} />
                    <AnimatePresence>
                      {isPlayMode && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-green-400"
                        />
                      )}
                    </AnimatePresence>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider font-medium">{isPlayMode ? "Exit" : "Play"}</span>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent side="bottom" sideOffset={8}>
                {isPlayMode ? "Back to portfolio" : "Pop some balloons"}
              </TooltipContent>
            </Tooltip>
          </div>
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
          className="flex flex-col w-full max-w-[540px] justify-start items-start gap-[180px]"
        >

            {/* Profile, Heading & Tabs Section */}
            <motion.section variants={item} className="self-stretch flex flex-col justify-start items-start gap-10">
              {/* Profile */}
              <div className="flex flex-col items-center">
                <motion.div
                  variants={item}
                  className="inline-flex justify-center items-center gap-3 group px-3 py-1.5 rounded-full hover:bg-foreground/[0.03] transition-colors cursor-pointer relative"
                  onClick={() => {
                    const sounds = ["/sounds/pop-1.wav", "/sounds/pop-2.wav", "/sounds/pop-3.wav"];
                    const audio = new Audio(sounds[Math.floor(Math.random() * sounds.length)]);
                    audio.volume = 0.4;
                    audio.play().catch(() => {});
                    
                    const id = Date.now();
                    setSurprises(prev => [...prev, id]);
                    setTimeout(() => setSurprises(prev => prev.filter(s => s !== id)), 1000);
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Tooltip>
                    <TooltipTrigger className="bg-transparent border-none p-0 cursor-pointer">
                      <motion.div
                        className="relative"
                        animate={surprises.length > 0 ? { rotate: 360 } : { rotate: 0 }}
                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <Image
                          className="w-8 h-8 rounded-full shadow-sm group-hover:shadow-md transition-shadow"
                          src="/avatar.webp"
                          alt="Ransford Gyasi"
                          width={32}
                          height={32}
                          priority
                        />
                        
                        {/* Surprise Particles */}
                        <AnimatePresence>
                          {surprises.map(id => (
                            <div key={id} className="absolute inset-0 pointer-events-none">
                              {[...Array(8)].map((_, i) => (
                                <motion.div
                                  key={i}
                                  initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
                                  animate={{ 
                                    scale: [0, 1.5, 0], 
                                    x: (Math.random() - 0.5) * 80, 
                                    y: -40 - Math.random() * 60,
                                    opacity: 0 
                                  }}
                                  transition={{ duration: 0.8, ease: "easeOut" }}
                                  className="absolute w-2 h-2 rounded-full"
                                  style={{ 
                                    backgroundColor: ['#ff4d4d', '#4d79ff', '#4dff88', '#ffcc4d'][i % 4],
                                    left: '50%',
                                    top: '50%'
                                  }}
                                />
                              ))}
                            </div>
                          ))}
                        </AnimatePresence>
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-[10px] font-medium tracking-tight">
                      {surprises.length > 0 ? "You found me! ✨" : "Hey, I'm Ransford"}
                    </TooltipContent>
                  </Tooltip>
                  <p className="text-center justify-start text-muted-foreground text-base font-medium font-sans leading-5 group-hover:text-foreground transition-colors">
                    Ransford Gyasi
                  </p>
                </motion.div>
              </div>

              {/* Headline & Tabs */}
              <motion.div variants={item} className="w-full">
                <TabsSection />
              </motion.div>

              {/* Action Buttons */}
              <motion.nav variants={item} className="inline-flex justify-start items-start gap-4">
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
              </motion.nav>
            </motion.section>
 
            {/* Bottom Content Lists - Significant vertical rhythm increase */}
            <motion.div variants={item} className="self-stretch flex flex-col justify-start items-start gap-16 md:gap-24 pb-20 md:pb-32">

              {/* Case Studies */}
              <motion.section variants={item} className="self-stretch flex flex-col justify-start items-start gap-8">
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
              </motion.section>

              {/* Stack */}
              <motion.section variants={item} className="self-stretch flex flex-col justify-start items-start gap-8 w-full">
                <h2 className="justify-center text-muted-foreground text-sm font-medium font-sans leading-4 tracking-tight uppercase">Stack</h2>
                <motion.div variants={container} className="flex flex-col justify-start items-start gap-6 w-full">
                  <motion.div variants={item} className="w-full"><ProjectItem title="Figma" subtitle="UI/UX Design" slug="" isStack /></motion.div>
                  <motion.div variants={item} className="w-full"><ProjectItem title="Next.js" subtitle="Frontend" slug="" isStack /></motion.div>
                  <motion.div variants={item} className="w-full"><ProjectItem title="GSAP" subtitle="Motion" slug="" isStack /></motion.div>
                </motion.div>
              </motion.section>

              {/* Connect */}
              <motion.section variants={item} className="self-stretch flex flex-col justify-start items-start gap-8 w-full">
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
              </motion.section>
            </motion.div>

          </motion.main>
        
        {/* Right Column Placeholder - Keeps content on the left */}
        <div className="hidden lg:block lg:w-[600px]" />
      </div>

      {/* Fixed Preview - Pinned to bottom-right */}
      <FixedPreview activeImage={activeImage} />
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