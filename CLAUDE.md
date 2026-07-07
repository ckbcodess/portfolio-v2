# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server at http://localhost:3000
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Stack

- **Next.js 16** with the App Router (`app/` directory), React Compiler enabled
- **React 19**
- **TypeScript** (strict mode)
- **Tailwind CSS v4** — configured via `postcss.config.mjs`; uses `@import "tailwindcss"` in CSS (no `tailwind.config.*` file)
- **Keystatic** — git-based CMS; admin UI at `/keystatic`
- **Geist** font loaded via `next/font/google`, exposed as `--font-sans`
- Animation: motion (framer), GSAP, anime.js, three.js, Lenis smooth scroll

## Architecture

### Routes

- `app/layout.tsx` — root layout: html/body, fonts, global metadata only
- `app/(site)/layout.tsx` — site layout (server): loads archive rows from content, mounts the client provider stack (ThemeProvider → SoundProvider → TooltipProvider → TransitionProvider)
- `app/(site)/page.tsx` — homepage (server); passes case study cards to `components/home/HomeClient.tsx`
- `app/(site)/work/[slug]/page.tsx` — case study pages, SSG via `generateStaticParams` (`dynamicParams = false`)
- `app/(site)/about`, `app/(site)/playground` — secondary pages
- `app/keystatic/` + `app/api/keystatic/` — CMS admin UI and API (outside the `(site)` group so the provider stack doesn't wrap it)
- `app/api/now-playing` — server-side Last.fm proxy (keeps the API key out of the client bundle)
- `app/api/youtube-thumbnail` — album-art fallback lookup

### Content (CMS)

Content is data, not code. See `CONTENT.md` for the editor workflow.

- `keystatic.config.ts` — collection schemas (caseStudies, archive). Local storage in dev; GitHub storage (commits → Vercel deploy) in production
- `content/case-studies/*.json`, `content/archive/*.json` — the content itself
- `lib/content.ts` — **server-only** reader (`getCaseStudies`, `getCaseStudy`, `getArchiveRows`); maps raw entries to app types and resolves the `nextProject` relationship
- `lib/types.ts` — shared content types, safe to import from client components
- CMS image uploads land in `public/images/work/<slug>/` and `public/images/archive/<slug>/` — the path stored in JSON includes the slug segment

When changing a collection schema, keep existing JSON entries in sync and remember the Keystatic admin expects assets at `directory/<entry-slug>/<filename>`.

### Conventions

- Path alias `@/*` resolves to the repo root
- Client components get data via props from server components — never import `lib/content.ts` from a `"use client"` file
- Page transitions go through `TransitionProvider` (`useTransition().navigate`) / `TransitionLink`, not bare `next/link`
- Heavy client-only components (three.js blob, custom cursor, smooth scroll) are loaded with `next/dynamic` + `ssr: false`
