// Server-only content access. Reads the Keystatic-managed JSON files in
// content/ from the filesystem — import this from Server Components only.
import { cache } from "react";
import { createReader } from "@keystatic/core/reader";
import keystaticConfig from "@/keystatic.config";
import type {
  ArchiveRow,
  CaseStudyContent,
  InfoSheetContent,
  ResumeContent,
  TabItem,
} from "@/lib/types";

const reader = createReader(process.cwd(), keystaticConfig);

type CaseStudyEntry = NonNullable<
  Awaited<ReturnType<typeof reader.collections.caseStudies.read>>
>;

function toCaseStudy(
  slug: string,
  entry: CaseStudyEntry,
  bySlug: Map<string, CaseStudyEntry>
): CaseStudyContent {
  const next = entry.nextProject ? bySlug.get(entry.nextProject) : undefined;

  return {
    slug,
    title: entry.title,
    metadataTitle: entry.metadataTitle || undefined,
    description: entry.description,
    heroSrc: entry.heroSrc,
    heroAlt: entry.heroAlt || entry.title,
    meta: [...entry.meta],
    sections: entry.sections.map((section) => ({
      id: section.id,
      label: section.label,
      heading: section.heading,
      body: [...section.body],
      bullets: section.bullets.length > 0 ? [...section.bullets] : undefined,
      labelClassName: section.labelClassName,
      imageSrc: section.imageSrc ?? undefined,
      videoSrc: section.videoSrc ?? undefined,
    })),
    nextProject:
      entry.nextProject && next
        ? {
            href: `/work/${entry.nextProject}`,
            label: next.title,
            thumbnail: next.heroSrc,
          }
        : undefined,
    gradientColors: [
      entry.gradientColors.top,
      entry.gradientColors.middle,
      entry.gradientColors.bottom,
    ],
    isLocked: entry.isLocked,
    password: entry.password || undefined,
  };
}

/** All case studies, sorted by display order. Cached per request. */
export const getCaseStudies = cache(async (): Promise<CaseStudyContent[]> => {
  const entries = await reader.collections.caseStudies.all();
  const bySlug = new Map(entries.map((e) => [e.slug, e.entry]));
  return entries
    .slice()
    .sort((a, b) => a.entry.order - b.entry.order)
    .map(({ slug, entry }) => toCaseStudy(slug, entry, bySlug));
});

export async function getCaseStudy(slug: string): Promise<CaseStudyContent | undefined> {
  const all = await getCaseStudies();
  return all.find((caseStudy) => caseStudy.slug === slug);
}

export const getInfoSheet = cache(async (): Promise<InfoSheetContent> => {
  const entry = await reader.singletons.infoSheet.read();
  if (!entry) {
    return { info: [], experience: [], geekTags: [], connectLinks: [] };
  }

  return {
    info: [...entry.info],
    lastUpdated: entry.lastUpdated || undefined,
    experience: [...entry.experience],
    geekTags: [...entry.geekTags],
    connectLinks: [...entry.connectLinks],
  };
});

export const getResume = cache(async (): Promise<ResumeContent | null> => {
  const entry = await reader.singletons.resume.read();
  if (!entry) return null;

  return {
    name: entry.name,
    title: entry.title,
    location: entry.location || undefined,
    summary: entry.summary || undefined,
    contacts: entry.contacts.map((c) => ({ label: c.label, url: c.url || undefined })),
    experience: entry.experience.map((job) => ({
      role: job.role,
      company: job.company,
      meta: job.meta || undefined,
      period: job.period,
      bullets: [...job.bullets],
    })),
    skills: [...entry.skills],
    achievements: [...entry.achievements],
    education: entry.education.map((e) => ({ title: e.title, detail: e.detail || undefined })),
    footnote: entry.footnote || undefined,
    pdf: entry.pdf ?? undefined,
  };
});

/** Rows for the Archive drawer: case studies first, then supplemental entries (newest first). */
export const getArchiveRows = cache(async (): Promise<ArchiveRow[]> => {
  const [caseStudies, archiveEntries] = await Promise.all([
    getCaseStudies(),
    reader.collections.archive.all(),
  ]);

  const caseStudyRows: ArchiveRow[] = caseStudies.map((study) => ({
    title: study.title,
    role: study.meta.find((m) => m.label === "Role")?.value ?? "Product Designer",
    year: study.meta.find((m) => m.label === "Year")?.value ?? "",
    caseStudyHref: `/work/${study.slug}`,
    color: study.gradientColors?.[0] ?? "#333",
  }));

  const supplementalRows: ArchiveRow[] = archiveEntries
    .slice()
    .sort((a, b) => b.entry.year.localeCompare(a.entry.year))
    .map(({ entry }) => ({
      title: entry.title,
      role: entry.role,
      year: entry.year,
      tech: entry.tech || undefined,
      externalLink: entry.link || undefined,
      image: entry.image ?? undefined,
    }));

  return [...caseStudyRows, ...supplementalRows];
});

export const DEFAULT_TABS: TabItem[] = [
  {
    name: "For all",
    text: "I find the simple version that was hiding the whole time.",
    isScramble: false,
  },
  {
    name: "Recruiters",
    text: "I've spent three years proving that you don't ever have to choose between speed and craft.",
    isScramble: false,
  },
  {
    name: "Product Designers",
    text: "I know every rule in the system, and exactly when to break one.",
    isScramble: false,
  },
  {
    name: "Vibe Coders",
    text: "I prompted a full portfolio in 48 hours... and I'll do it again :)",
    isScramble: true,
  },
  {
    name: "Artists",
    text: "Eight years an artist before this. same craft, new problems.",
    isScramble: false,
  },
];

export const getTabsSection = cache(async (): Promise<TabItem[]> => {
  try {
    const entry = await reader.singletons.tabsSection.read();
    if (!entry || !entry.tabs || entry.tabs.length === 0) {
      return DEFAULT_TABS;
    }
    return entry.tabs.map((t) => ({
      name: t.name,
      text: t.text,
      isScramble: Boolean(t.isScramble),
    }));
  } catch (e) {
    return DEFAULT_TABS;
  }
});

