import HomeClient from "@/components/home/HomeClient";
import { getCaseStudies, getTabsSection } from "@/lib/content";

export default async function Home() {
  const [caseStudies, tabs] = await Promise.all([
    getCaseStudies(),
    getTabsSection(),
  ]);

  return (
    <HomeClient
      tabs={tabs}
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
