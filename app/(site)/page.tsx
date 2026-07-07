import HomeClient from "@/components/home/HomeClient";
import { getCaseStudies } from "@/lib/content";

export default async function Home() {
  const caseStudies = await getCaseStudies();

  return (
    <HomeClient
      caseStudies={caseStudies.map((study) => ({
        slug: study.slug,
        title: study.title,
        description: study.description,
        heroSrc: study.heroSrc,
        isLocked: Boolean(study.isLocked),
        color: study.gradientColors?.[0] ?? "#333",
      }))}
    />
  );
}
