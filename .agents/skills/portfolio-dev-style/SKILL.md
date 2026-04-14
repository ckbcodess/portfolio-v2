---
name: portfolio-dev-style
description: "Custom development guidelines based on my personal portfolio codebase and preferred style of working. Use when generating, modifying, or refactoring code in the my-portfolio project."
---

# Portfolio Development Style & Codebase Standards

You are a frontend engineer working on my personal portfolio project. Your objective is to write and refactor code that seamlessly matches the established architectural patterns, styling methodologies, and coding conventions found in the existing `my-portfolio` codebase.

This skill outlines my **preferred style of working** and the **technical choices** embedded in the project. Always adhere strictly to these guidelines.

---

## 1. Tech Stack Overview

* **Framework:** Next.js 16 (App Router)
* **Library:** React 19
* **Language:** TypeScript
* **Styling:** Tailwind CSS v4 + Vanilla CSS Variables
* **Theming:** Custom implementation using `next-themes`
* **Typography:** `next/font/google` (`Google_Sans_Flex`)

---

## 2. Core Architectural Principles

### Native Over Packages
* Prefer native Web API implementations (`IntersectionObserver`, `window.addEventListener`) over heavy third-party libraries (e.g., avoid `framer-motion` or scroll libraries if basic CSS/JS can achieve the same effect).

### Component Structure & Client Components
* Default to React Server Components where possible, but use `"use client"` purposefully for any component needing interactivity, state (`useState`), or access to browser APIs (`useEffect`, `useRef`).
* Define clear, localized TypeScript `interface`s above the component definition (e.g., `interface HeaderProps { ... }`).
* Use the component single-file pattern. Avoid abstracting basic UI pieces into an overly fragmented folder structure unless it is reused globally across multiple distinct pages.
* Leverage `variant` props (e.g., `variant="default" | "case-study"`) to handle visual divergences in a single component rather than duplicating files.

---

## 3. Styling & Theming Methodology

### TailwindCSS v4 with Native CSS Theming
* DO NOT use hardcoded colors like `text-gray-900` or `bg-white` unless strictly overriding for specific aesthetic effects like `mix-blend-difference` sections.
* **Always use semantic theme variables** configured in Tailwind. The project defines custom variables in `globals.css`:
  * `--background` -> `bg-background`
  * `--foreground` -> `text-foreground`
  * `--muted` -> `bg-muted`
  * `--muted-foreground` -> `text-muted-foreground`
  * `--secondary-foreground` -> `text-secondary-foreground`
* Base fonts scale using the `:root` > `--base-font-size` approach with scaling elements (e.g. `text-[1rem]`, `text-[17px]`). Note how custom rem and px sizes are used.
* The project supports multiple themes (e.g., `"light"`, `"dark"`, `"green"`), managed via custom `.dark`, `.green` classes in root. Always write CSS that respects these contexts (use `var(--...)` or corresponding tailwind classes).

### Transitions & Animations
* Heavy use of pure CSS transitions through Tailwind.
* Standard animation classes preferred: `transition-all duration-300`, `duration-500`, or `duration-700 ease-out`.
* Use group classes (`group`, `group-hover:*`) and peer classes for interactive micro-animations (e.g. `transform group-hover:-translate-x-1 hover:opacity-100`).

---

## 4. Specific Codebase Patterns

### Navigation & Scroll Interactions
* Sticky/Fixed elements (like sidebars and headers) heavily rely on `window.scrollY` injected via `useEffect` to toggle state variables (e.g., `const [scrolled, setScrolled] = useState(false)`).
* `IntersectionObserver` is the preferred way to detect which section of a page the user is currently looking at (e.g. updating active anchor links).
* Navigation layers often utilize CSS features like `mix-blend-difference` alongside `pointer-events-none` with inner `pointer-events-auto` wrappers to manage fixed element overlap effectively.

### Typography
* `dmSans` is injected globally via `app/layout.tsx`.
* Favor `font-light`, `font-normal` over overly bold typography unless in major headings.
* The transition between themes must always be smooth—ensure `transition-colors duration-300` exists on `<body>` and interactive elements.

---

## 5. Development Workflow Rules

1. **Verify State Before Writing:** Always check context or existing files (`globals.css`, relative components) before assuming a layout variable exists.
2. **Stick to the Palette:** Use ONLY the designated semantic colors.
3. **Responsive by Default:** Use Tailwind's `md:`, `lg:` prefixes. Breakpoints are custom (`--breakpoint-md: 810px`, `--breakpoint-lg: 1100px`).
4. **Clean Code:** 
   * Destructure props natively (`export default function Header({ variant, title }: HeaderProps)`).
   * Group `useEffect` functionality intuitively and always clean up event listeners (`return () => window.removeEventListener(...)`).

## When to Use
Activate this skill whenever you are making changes to layout structures, creating new React components, handling routing, or updating the application styling within the `my-portfolio` project.
