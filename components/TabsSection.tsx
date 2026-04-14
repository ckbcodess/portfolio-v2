"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SplitText } from "@/components/split-text";
import { SpecialText } from "@/components/special-text";

const tabsData = [
  {
    name: "For all",
    text: "I'm a designer who cares about two things: grids, aesthetics, and helping people.",
  },
  {
    name: "Recruiters",
    text: "I've spent 3 years proving you don't have to choose between speed and craft.",
  },
  {
    name: "Product Designers",
    text: "I'm the person on the team who actually reads the design system AND breaks it when the work calls for it.",
  },
  {
    name: "UX Research",
    text: "I ask 'why' before I open Figma. Research isn't a phase, it's the foundation.",
  },
  {
    name: "Vibe Cooders",
    text: "I prompted my way into a full portfolio in 48 hours... and I will do it again. :)",
  },
  {
    name: "Artists",
    text: "Eight years of digital art before product design. The craft never left, it just found new problems to solve.",
  },
];

export default function TabsSection() {
  const [active, setActive] = useState(0);

  const handleTabClick = (i: number) => {
    setActive(i);
  };

  return (
    <div className="self-stretch flex flex-col justify-start items-start gap-8">
      <div className="min-h-[100px] md:min-h-[140px] flex items-center justify-start w-full relative">
        <h1
          className="self-stretch justify-start text-foreground text-[1.5rem] md:text-[2.6rem] font-normal font-sans leading-[1.05] tracking-tight text-left"
        >
          {tabsData[active].name === "Vibe Cooders" ? (
            <span
              style={{ display: "flex", flexWrap: "wrap", justifyContent: "flex-start" }}
              className="inline-flex flex-wrap"
            >
              {tabsData[active].text.split(" ").map((word, index) => (
                <span
                  key={index}
                  className="inline-block"
                  style={{ marginRight: "0.3em" }}
                >
                  <SpecialText className="!h-auto !leading-[1.1] text-inherit">
                    {word}
                  </SpecialText>
                </span>
              ))}
            </span>
          ) : (
            <SplitText text={tabsData[active].text} splitBy="words" stagger={0} />
          )}
        </h1>
      </div>

      <div className="flex justify-between items-center w-full">
        {tabsData.map((tab, i) => (
          <button
            key={tab.name}
            onClick={() => handleTabClick(i)}
            data-cursor="pointer"
            className={`text-center justify-start text-foreground text-[1.05rem] font-normal font-sans leading-5 transition-all duration-300 ${active === i
              ? "opacity-100"
              : "opacity-30 hover:opacity-100"
              }`}
          >
            {tab.name}
          </button>
        ))}
      </div>
    </div>
  );
}

