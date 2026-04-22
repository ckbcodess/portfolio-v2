import { CaseStudyContent } from "./types";

export const gcbCaseStudy: CaseStudyContent = {
  slug: "gcb",
  isLocked: true,
  title: "GCB App",
  metadataTitle: "GCB App - Ransford Gyasi",
  description: "Designing a mobile banking experience that feels clear, fast, and trustworthy.",
  logoText: "GCB",
  logoClassName: "text-[#0f3d7a]",
  heroSrc: "/gcb-card.webp",
  heroAlt: "GCB App dashboard view",
  meta: [
    { label: "Role", value: "Product Designer" },
    { label: "Team", value: "Design + Product + Engineering" },
    { label: "Year", value: "2024" },
  ],
  sections: [
    {
      id: "the-mission",
      label: "The Mission",
      heading: "Make everyday banking feel effortless",
      body: [
        "The goal was simple: reduce friction in everyday financial tasks like checking balances, moving money, and paying bills.",
        "The challenge was balancing modern product patterns with the trust expectations users have when money is involved.",
      ],
      labelClassName: "text-foreground",
    },
    {
      id: "insight-behavior",
      label: "Key Insight",
      heading: "Users wanted reassurance as much as speed",
      body: [
        "People were not only asking for faster flows. They also wanted clear feedback, strong visibility into transaction states, and fewer moments of uncertainty.",
      ],
      bullets: [
        "Users hesitated when confirmations were ambiguous.",
        "Navigation labels were familiar internally but unclear for first-time users.",
      ],
      labelClassName: "text-[#f54900]",
    },
    {
      id: "decision-information",
      label: "Design Decision",
      heading: "Prioritize information hierarchy before visual detail",
      body: [
        "I restructured the IA around core daily actions, then used visual design to reinforce confidence: clear labels, explicit statuses, and deliberate spacing for readability.",
        "This approach ensured the app felt predictable and easy to scan, even for less frequent digital banking users.",
      ],
      labelClassName: "text-[#4535FF]",
    },
    {
      id: "solution-flows",
      label: "Solution",
      heading: "Streamlined core flows with high-confidence feedback",
      body: [
        "Core journeys were redesigned around fewer decisions per step, persistent context, and immediate confirmations after critical actions.",
      ],
      bullets: [
        "Account overview surfaces high-value information first.",
        "Transfer and payment flows now reduce back-and-forth decisions.",
        "Confirmation states clearly communicate success and next actions.",
      ],
      labelClassName: "text-[#22c55e]",
    },
    {
      id: "learnings",
      label: "Key Learnings",
      heading: "Trust is a design outcome, not just a brand promise",
      body: [
        "Small interaction details changed user confidence significantly. Clear system responses and better hierarchy made the experience feel safer and more professional.",
        "The project reinforced a core principle in fintech design: speed matters, but clarity builds trust.",
      ],
      labelClassName: "text-muted-foreground",
    },
  ],
  nextProject: {
    href: "/work/the-allex",
    label: "The Allex",
    eyebrow: "The Allex",
    title: "Brand + Product System Case Study",
  },
};