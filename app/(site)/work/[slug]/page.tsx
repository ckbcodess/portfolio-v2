import { Metadata } from "next";
import { notFound } from "next/navigation";
import CaseStudyPage from "@/components/CaseStudyPage";
import { getCaseStudies, getCaseStudy } from "@/lib/content";

interface WorkCaseStudyPageProps {
  params: Promise<{ slug: string }>;
}

// Only slugs that exist at build time are valid — content changes redeploy the site
export const dynamicParams = false;

export async function generateStaticParams() {
  const caseStudies = await getCaseStudies();
  return caseStudies.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: WorkCaseStudyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const caseStudy = await getCaseStudy(slug);

  if (!caseStudy) {
    return { title: "Case Study Not Found" };
  }

  return {
    title: caseStudy.metadataTitle ?? `${caseStudy.title} - Ransford Gyasi`,
    description: caseStudy.description,
  };
}

export default async function WorkCaseStudyPage({ params }: WorkCaseStudyPageProps) {
  const { slug } = await params;
  const isLiveBuild = process.env.NODE_ENV === "production";

  if (isLiveBuild && slug === "portfolio-v2") {
    notFound();
  }

  const caseStudy = await getCaseStudy(slug);

  if (!caseStudy || (isLiveBuild && caseStudy.isInProgress)) {
    notFound();
  }

  return <CaseStudyPage caseStudy={caseStudy} />;
}
