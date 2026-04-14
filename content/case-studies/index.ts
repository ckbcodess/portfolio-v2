import { CaseStudyContent } from "./types";
import { gcbCaseStudy } from "./gcb";
import { theAllexCaseStudy } from "./the-allex";

export const caseStudies: CaseStudyContent[] = [theAllexCaseStudy, gcbCaseStudy];

export const caseStudiesBySlug = caseStudies.reduce((acc, caseStudy) => {
  acc[caseStudy.slug] = caseStudy;
  return acc;
}, {} as Record<string, CaseStudyContent>);