import CaseStudyPage from "@/components/CaseStudyPage";
import { theAllexCaseStudy } from "@/content/case-studies/the-allex";

export const metadata = {
  title: "Ransford Gyasi",
};

export default function TheAllexCaseStudyPage() {
  return <CaseStudyPage caseStudy={theAllexCaseStudy} />;
}
