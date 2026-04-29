import { CaseStudyContent } from "./types";

export const theAllexCaseStudy: CaseStudyContent = {
  slug: "the-allex",
  title: "The Allex",
  metadataTitle: "The Allex - Ransford Gyasi",
  description: "Redesigning the POS experience and rewarding the people who run it.",
  logoSrc: "/cs-img-6.webp",
  logoAlt: "The Allex logo",
  heroSrc: "/allex-hero.webp",
  heroAlt: "The Allex hero",
  meta: [
    { label: "Role", value: "Founding Designer" },
    { label: "Team", value: "1 Designer (Me)" },
    { label: "Year", value: "Nov 2022 - Dec 2023" },
  ],
  sections: [
    {
      id: "the-mission",
      label: "The Mission",
      heading: "One brand house, two very different problems",
      body: [
        "Allex is a brand house built for small businesses - a parent identity housing two distinct products: a modern POS system and a website builder.",
        "My responsibility spanned everything visual and experiential, from the logo to the user flows, from the brand color to the checkout interaction. This is the story of how a product with two very different problems ended up with one very coherent identity.",
      ],
      labelClassName: "text-foreground",
      imageSrc: "/allex-hero.webp",
    },
    {
      id: "insight-pos",
      label: "Key Insight",
      heading: "POS systems were built for owners, not for the people working the floor",
      body: [
        "Most POS systems are clunky, rigid, and treat staff as inputs rather than stakeholders. Meanwhile, small business owners - especially in restaurants - are fighting two battles at once: running transactions efficiently and keeping customer-facing staff motivated.",
      ],
      bullets: [
        "Existing POS tools felt dated and restrictive - staff dreaded using them.",
        "There was no connection between how an employee performed and any form of recognition.",
      ],
      labelClassName: "text-[#f54900]",
    },
    {
      id: "insight-online",
      label: "Key Insight",
      heading: "Small businesses had no easy, affordable way to build an online presence",
      body: [
        "When Cyril, the founder of Allex, approached me to come on as the founding designer, he'd already had conversations with restaurant owners and small business operators. The signal was consistent: the gap between running a great business and having a credible digital footprint was too wide.",
      ],
      bullets: [
        "Small business owners had no easy, affordable way to establish a credible online presence.",
      ],
      labelClassName: "text-[#f54900]",
    },
    {
      id: "decision-platform",
      label: "Design Decision",
      heading: "Framing Allex as a platform, not just a tool",
      body: [
        "I framed Allex not as a single product but as a brand house - a parent identity with distinct sub-products under it. This distinction mattered because it shaped every design decision downstream: Allex needed to feel like a platform with authority, not just a tool with a logo.",
        "The two core products under the Allex umbrella were Allex POS - the transaction and staff management system - and Allex Website Builder - the online presence tool for small businesses.",
      ],
      labelClassName: "text-[#4535FF]",
    },
    {
      id: "decision-color",
      label: "Design Decision",
      heading: "Why red?",
      body: [
        "The brand color I chose was a bold, confident red. This was a deliberate, opinionated decision - not a safe one. The POS and SaaS landscape is dominated by blues, grays, and neutrals that all feel like they are trying to disappear. Red does not disappear.",
        "Red signals energy, urgency, and action - exactly the environment of a busy restaurant floor or retail counter. It also communicates appetite and warmth in the context of food and hospitality. For a product targeting restaurants, this was not accidental. The color does work before the product even loads.",
      ],
      labelClassName: "text-[#4535FF]",
    },
    {
      id: "solution-pos",
      label: "Solution",
      heading: "Allex POS: the employee-first transaction system",
      body: [
        "The POS shipped as two surfaces: a web admin panel for managers to oversee operations, and a mobile employee app for clock-ins, sales tracking, and performance with built-in incentives. Staff could see their own numbers. Recognition was built into the daily workflow.",
      ],
      labelClassName: "text-[#22c55e]",
    },
    {
      id: "solution-builder",
      label: "Solution",
      heading: "Allex Website Builder: an online presence in minutes",
      body: [
        "The website builder gave small businesses ready-to-customize templates that set up a professional site fast - complete with product pages and checkout. No developers needed.",
      ],
      labelClassName: "text-[#22c55e]",
    },
    {
      id: "learnings",
      label: "Key Learnings",
      heading: "A complete, cohesive system from zero",
      body: [
        "We delivered a unified brand and two distinct products that felt like they belonged together. As the founding designer, I took the project from early conversations to polished, branded products - setting the foundation for the whole TheAllex brand house.",
        "The biggest takeaway: naming the thing (\"brand house\") early gave every downstream decision a clear north star. When you define the frame, the details fill themselves in.",
      ],
      labelClassName: "text-muted-foreground",
    },
  ],
  nextProject: {
    href: "/work/gcb",
    label: "GCB App",
    eyebrow: "GCB App",
    title: "Mobile Banking App Case Study",
  },
  badgeVariant: "red",
};
