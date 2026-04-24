import { Metadata } from "next";
import { notFound } from "next/navigation";
import CaseStudyPage from "@/components/CaseStudyPage";
import { caseStudies, caseStudiesBySlug } from "@/content/case-studies";

interface WorkCaseStudyPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return caseStudies.map((caseStudy) => ({ slug: caseStudy.slug }));
}

export async function generateMetadata({ params }: WorkCaseStudyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const caseStudy = caseStudiesBySlug[slug];

  if (!caseStudy) {
    return { title: "Case Study Not Found" };
  }

  return {
    title: "Ransford Gyasi",
    description: caseStudy.description,
  };
}

export default async function WorkCaseStudyPage({ params }: WorkCaseStudyPageProps) {
  const { slug } = await params;
  const caseStudy = caseStudiesBySlug[slug];

  if (!caseStudy) {
    notFound();
  }

  return <CaseStudyPage caseStudy={caseStudy} />;
}
