"use client";

import React from "react";
import Image from "next/image";
import { ArrowUpRight, Download } from "lucide-react";
import { motion, Variants } from "motion/react";
import { MaskReveal } from "@/components/MaskReveal";
import { AnimatedDivider } from "@/components/AnimatedDivider";
import { useTransition } from "@/components/TransitionProvider";
import type { ResumeContent } from "@/lib/types";

interface ResumeClientProps {
  resume: ResumeContent;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground md:pt-0.5">
      {children}
    </h2>
  );
}

export default function ResumeClient({ resume }: ResumeClientProps) {
  const { canAnimate } = useTransition();

  const containerVariants: Variants = {
    hidden: { opacity: 1 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
        delayChildren: 0.05,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.45,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <div className="bg-background min-h-screen pt-24 sm:pt-28 md:pt-36 pb-20 w-full selection:bg-primary selection:text-primary-foreground flex flex-col items-center">
      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate={canAnimate ? "show" : "hidden"}
        className="w-full max-w-[960px] px-[var(--page-px)] flex flex-col"
      >
        {/* Download Resume Button */}
        <motion.div variants={itemVariants} className="flex justify-end mb-8 md:mb-12">
          {resume.pdf && (
            <a
              href={resume.pdf}
              download={`${resume.name.replace(/\s+/g, "-")}-CV.pdf`}
              data-cursor="pointer"
              className="inline-flex items-center gap-2 sm:gap-3 rounded-full bg-foreground/10 hover:bg-foreground/15 text-foreground dark:bg-[#161616] dark:hover:bg-[#222222] dark:text-white px-4 py-2 sm:px-6 sm:py-3 text-xs sm:text-sm md:text-base font-normal tracking-tight transition-all duration-200 active:scale-[0.96]"
            >
              <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-[19px] md:h-[19px] shrink-0" strokeWidth={2} />
              <span>Download Resume</span>
            </a>
          )}
        </motion.div>

        {/* Header Section */}
        <motion.header
          variants={itemVariants}
          className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 md:gap-8"
        >
          <div className="flex items-start gap-4">
            <Image
              src="/avatar.webp"
              alt={resume.name}
              width={160}
              height={160}
              quality={95}
              className="w-11 h-11 rounded-full mt-0.5 object-cover ring-1 ring-black/10 dark:ring-white/10"
              priority
            />
            <div className="flex flex-col gap-0.5">
              <h1 className="text-foreground text-lg sm:text-xl font-semibold tracking-tight">
                {resume.name}
              </h1>
              <p className="text-foreground/70 text-xs sm:text-sm font-normal">
                {resume.title}
              </p>
              {resume.location && (
                <p className="text-muted-foreground text-xs sm:text-sm font-normal">
                  {resume.location}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1 md:items-end">
            {resume.contacts.map((contact) =>
              contact.url ? (
                <a
                  key={contact.label}
                  href={contact.url}
                  target={contact.url.startsWith("http") ? "_blank" : undefined}
                  rel={contact.url.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="group inline-flex items-center gap-1 text-xs sm:text-sm text-foreground/60 hover:text-foreground transition-colors"
                >
                  {contact.label}
                  <ArrowUpRight
                    size={11}
                    className="opacity-40 group-hover:opacity-100 transition-opacity"
                  />
                </a>
              ) : (
                <span key={contact.label} className="text-xs sm:text-sm text-foreground/60">
                  {contact.label}
                </span>
              )
            )}
          </div>
        </motion.header>

        {/* Animated Divider */}
        <motion.div variants={itemVariants}>
          <AnimatedDivider delay={0.15} className="mt-8 md:mt-10 mb-10 md:mb-14" />
        </motion.div>

        <div className="flex flex-col gap-12 md:gap-16">
          {/* About */}
          {resume.summary && (
            <motion.section variants={itemVariants} className="grid grid-cols-1 md:grid-cols-[160px_1fr] gap-3 md:gap-8">
              <SectionLabel>About</SectionLabel>
              <p className="text-foreground/80 text-xs sm:text-sm leading-relaxed max-w-[620px]">
                {resume.summary}
              </p>
            </motion.section>
          )}

          {/* Experience */}
          {resume.experience.length > 0 && (
            <motion.section variants={itemVariants} className="grid grid-cols-1 md:grid-cols-[160px_1fr] gap-4 md:gap-8">
              <SectionLabel>Experience</SectionLabel>
              <div className="flex flex-col gap-10 md:gap-12">
                {resume.experience.map((job) => (
                  <motion.div
                    key={`${job.company}-${job.period}`}
                    variants={itemVariants}
                    className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-2.5 md:gap-8"
                  >
                    <div className="flex flex-col gap-0.5">
                      <h3 className="text-foreground text-xs sm:text-sm font-semibold">
                        {job.role}
                      </h3>
                      <p className="text-foreground/70 text-xs sm:text-sm">{job.company}</p>
                      {job.meta && (
                        <p className="text-muted-foreground text-xs sm:text-sm">{job.meta}</p>
                      )}
                      <p className="text-muted-foreground text-xs sm:text-sm">{job.period}</p>
                    </div>
                    <ul className="flex flex-col gap-2.5">
                      {job.bullets.map((bullet, i) => (
                        <li
                          key={i}
                          className="flex gap-2.5 text-xs sm:text-sm text-foreground/70 leading-relaxed max-w-[520px]"
                        >
                          <span className="text-muted-foreground/60 mt-px shrink-0">•</span>
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}

          {/* Skills */}
          {resume.skills.length > 0 && (
            <motion.section variants={itemVariants} className="grid grid-cols-1 md:grid-cols-[160px_1fr] gap-3 md:gap-8">
              <SectionLabel>Skills</SectionLabel>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                {resume.skills.map((skill) => (
                  <div key={skill.category} className="flex flex-col gap-0.5">
                    <h3 className="text-foreground text-xs sm:text-sm font-semibold">
                      {skill.category}
                    </h3>
                    <p className="text-foreground/70 text-xs sm:text-sm leading-relaxed">
                      {skill.items}
                    </p>
                  </div>
                ))}
              </div>
            </motion.section>
          )}

          {/* Achievements */}
          {resume.achievements.length > 0 && (
            <motion.section variants={itemVariants} className="grid grid-cols-1 md:grid-cols-[160px_1fr] gap-3 md:gap-8">
              <SectionLabel>Achievements</SectionLabel>
              <ul className="flex flex-col gap-2.5">
                {resume.achievements.map((achievement, i) => (
                  <li
                    key={i}
                    className="flex gap-2.5 text-xs sm:text-sm text-foreground/70 leading-relaxed max-w-[620px]"
                  >
                    <span className="text-muted-foreground/60 mt-px shrink-0">•</span>
                    <span>{achievement}</span>
                  </li>
                ))}
              </ul>
            </motion.section>
          )}

          {/* Education */}
          {resume.education.length > 0 && (
            <motion.section variants={itemVariants} className="grid grid-cols-1 md:grid-cols-[160px_1fr] gap-3 md:gap-8">
              <SectionLabel>Education</SectionLabel>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                {resume.education.map((item) => (
                  <div key={item.title} className="flex flex-col gap-0.5">
                    <h3 className="text-foreground text-xs sm:text-sm font-semibold">
                      {item.title}
                    </h3>
                    {item.detail && (
                      <p className="text-muted-foreground text-xs sm:text-sm">{item.detail}</p>
                    )}
                  </div>
                ))}
              </div>
            </motion.section>
          )}
        </div>

        {/* Footer */}
        {resume.footnote && (
          <motion.p variants={itemVariants} className="text-muted-foreground text-xs sm:text-sm text-center mt-16 md:mt-20">
            {resume.footnote}
          </motion.p>
        )}
        <motion.div variants={itemVariants} className="border-t border-foreground/10 mt-6 mb-5" />
        <motion.p variants={itemVariants} className="text-muted-foreground/60 text-[11px] sm:text-xs text-center">
          {resume.name} · rgyasi.vercel.app · ransfordgyasi98@gmail.com
        </motion.p>
      </motion.main>
    </div>
  );
}
