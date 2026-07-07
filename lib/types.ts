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
