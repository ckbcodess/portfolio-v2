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
}

export interface CaseStudyNextProject {
  href: string;
  label: string;
  title: string;
  eyebrow?: string;
}

export interface CaseStudyContent {
  slug: string;
  title: string;
  metadataTitle?: string;
  description: string;
  logoSrc?: string;
  logoAlt?: string;
  logoText?: string;
  logoClassName?: string;
  heroSrc: string;
  heroAlt: string;
  meta: CaseStudyMetaItem[];
  sections: CaseStudySection[];
  nextProject: CaseStudyNextProject;
  badgeVariant?: string;
  isLocked?: boolean;
  password?: string;
}