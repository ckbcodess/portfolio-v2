# Case Study: My Portfolio

Building my personal portfolio using Next.js 16, Tailwind v4, and Antigravity as an AI pair designer. The goal was to create something that feels responsive, tactile, and alive, combining interactive 3D elements, custom cursor interactions, ambient background shaders, and dynamic audio feedback into a clean single-page layout.

---

## Overview

I wanted My Portfolio to feel like a real living space, not just another static list of links and project grids. When someone visits, I want them to actually feel the interface react to them as they move around, view case studies, check out the archive, or open up the resume sheet.

Instead of writing down a rigid plan up front, I worked directly with Antigravity to build and tweak things iteratively right inside the code. We tried out ideas in real time, testing out animations, cursor behaviors, and layout tweaks as we went along so the design system naturally grew out of what felt right while using it.

---

## How it was built and refined

### 1. Starting out and spotting what was missing
We started by getting the core pieces running fast: basic custom cursor states, the header navigation, ambient backgrounds, and main project cards. But once I spent some time testing it out on different screen sizes, a few things stood out:

* **Mobile layout bugs**: The desktop layout looked great, but on smaller phones (around 375px), things like the header and overlay drawers started crowding the viewport or getting clipped, so we needed a proper two-row mobile setup.
* **Visual consistency**: A few hover states and gray tones were slightly off across different components, so it needed a proper color pass so the whole page felt cohesive.
* **Making it feel tactile**: Visuals alone weren't enough. Adding subtle audio clicks and custom cursor states when hovering over buttons or project cards made the site feel way more responsive and fun to interact with.

### 2. Tuning the design system
We went back through the whole codebase together to polish the interaction details:

* **Refractive Nav & Theme System**: Rebuilt the navigation header with glassmorphic blur effects, smooth transition links, and clean dark/light mode toggles.
* **3D Visual Highlights**: Added an interactive 3D blob canvas and dynamic section badges so the page has a distinct visual character without distracting from the actual work.
* **Context-Aware Cursor**: Built a custom cursor that changes how it looks and behaves depending on whether you're hovering over text, external links, media, or action buttons.
* **Drawer & Modal Surfaces**: Created smooth slide-over sheets for project deep dives, the archive gallery, and the resume, so visitors can explore details without losing their place on the main page.
* **Motion details**: Added subtle animated dividers, text scrambling on hover, and smooth scrolling to keep everything feeling polished.

---

## What I learned

Building this iteratively with Antigravity made it so much easier to take rough ideas and turn them into finished React components fast. Being able to test micro-interactions, adjust spacing, and see how things felt in real time helped me build a portfolio that actually matches how I like to design and build things.

Because everything is broken down into clean reusable pieces (theme context, audio providers, shared UI components, and modal drawers), it's going to be really easy to keep adding new case studies and experiments down the road.
