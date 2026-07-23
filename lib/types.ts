export interface CaseStudyMetaItem {
  label: string;
  value: string;
}

export interface CaseStudySection {
  id: string;
  label: string;
  heading: string;
  body: string[];
  bullets?: string[];
  labelClassName?: string;
  imageSrc?: string;
  videoSrc?: string;
}

export interface CaseStudyNextProject {
  href: string;
  label: string;
  thumbnail?: string;
}

export interface CaseStudyContent {
  slug: string;
  title: string;
  metadataTitle?: string;
  description: string;
  heroSrc: string;
  heroAlt: string;
  meta: CaseStudyMetaItem[];
  sections: CaseStudySection[];
  nextProject?: CaseStudyNextProject;
  gradientColors?: [string, string, string]; // [top, middle, bottom]
  isLocked?: boolean;
  password?: string;
}

/** The subset of case study data the homepage cards need. */
export interface CaseStudyCard {
  slug: string;
  title: string;
  description: string;
  heroSrc: string;
  isLocked: boolean;
  color: string;
}

export interface TabItem {
  name: string;
  text: string;
  isScramble?: boolean;
}

export interface TabsSectionContent {
  tabs: TabItem[];
}

export interface InfoSheetContent {
  info: string[];
  lastUpdated?: string;
  experience: string[];
  geekTags: string[];
  connectLinks: { label: string; url: string }[];
}

export interface ResumeExperience {
  role: string;
  company: string;
  meta?: string;
  period: string;
  bullets: string[];
}

export interface ResumeContent {
  name: string;
  title: string;
  location?: string;
  summary?: string;
  contacts: { label: string; url?: string }[];
  experience: ResumeExperience[];
  skills: { category: string; items: string }[];
  achievements: string[];
  education: { title: string; detail?: string }[];
  footnote?: string;
  pdf?: string;
}

/** A single row in the Archive drawer (case studies + supplemental entries). */
export interface ArchiveRow {
  title: string;
  role: string;
  year: string;
  tech?: string;
  /** Internal case-study route (/work/<slug>) — navigated with the page transition. */
  caseStudyHref?: string;
  /** Transition curtain color for case-study rows. */
  color?: string;
  /** External URL for supplemental archive entries. */
  externalLink?: string;
  /** Optional thumbnail image. */
  image?: string;
}
