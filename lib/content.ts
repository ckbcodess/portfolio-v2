// Server-only content access. Reads the Keystatic-managed JSON files in
// content/ from the filesystem — import this from Server Components only.
import { cache } from "react";
import { createReader } from "@keystatic/core/reader";
import keystaticConfig from "@/keystatic.config";
import type { ArchiveRow, CaseStudyContent } from "@/lib/types";

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
