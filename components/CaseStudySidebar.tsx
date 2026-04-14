"use client";

import { useEffect, useRef, useState } from "react";

interface SectionLink {
  id: string;
  label: string;
  targetIds?: string[];
}

export default function CaseStudySidebar({ links }: { links: SectionLink[] }) {
  const [activeId, setActiveId] = useState<string>("");
  const [isVisible, setIsVisible] = useState(false);
  const visibleSections = useRef(new Map<string, number>());

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 80) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            visibleSections.current.set(entry.target.id, entry.intersectionRatio);
          } else {
            visibleSections.current.delete(entry.target.id);
          }
        });

        if (visibleSections.current.size > 0) {
          let maxRatio = -1;
          let maxId = "";

          visibleSections.current.forEach((ratio, id) => {
            if (ratio > maxRatio) {
              maxRatio = ratio;
              maxId = id;
            }
          });

          if (maxId) {
            setActiveId(maxId);
          }
        }
      },
      {
        rootMargin: "-20% 0px -60% 0px",
        threshold: [0, 0.25, 0.5, 0.75, 1],
      }
    );

    links.forEach((link) => {
      const idsToObserve = link.targetIds || [link.id];
      idsToObserve.forEach((id) => {
        const element = document.getElementById(id);
        if (element) {
          observer.observe(element);
        }
      });
    });

    return () => observer.disconnect();
  }, [links]);

  const scrollToSection = (id: string) => {
    const target = document.getElementById(id);
    if (!target) {
      return;
    }

    const yOffset = 120;
    const top = target.getBoundingClientRect().top + window.scrollY - yOffset;
    window.scrollTo({ top, behavior: "smooth" });
    window.history.replaceState(null, "", `#${id}`);
  };

  return (
    <aside
      className={`fixed left-[40px] top-[120px] z-10 hidden w-48 shrink-0 flex-col gap-10 transition-all duration-700 ease-out md:flex ${
        isVisible ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      <nav className="flex flex-col gap-4">
        {links.map((link) => {
          const idsToCheck = link.targetIds || [link.id];
          const isActive = idsToCheck.includes(activeId);

          return (
            <a
              key={link.id}
              href={`#${link.id}`}
              onClick={(event) => {
                event.preventDefault();
                scrollToSection(link.id);
              }}
              className={`text-[17px] transition-all duration-200 ${
                isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {link.label}
            </a>
          );
        })}
      </nav>
    </aside>
  );
}
