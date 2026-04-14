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

- **Next.js 16** with the App Router (`app/` directory)
- **React 19**
- **TypeScript** (strict mode)
- **Tailwind CSS v4** — configured via `postcss.config.mjs`; uses `@import "tailwindcss"` in CSS (no `tailwind.config.*` file)
- **Geist** font loaded via `next/font/google` and exposed as CSS variables (`--font-geist-sans`, `--font-geist-mono`)

## Architecture

This is a single-route Next.js App Router project. The entry points are:

- `app/layout.tsx` — root layout; sets up fonts, global metadata, and applies font CSS variables to `<body>`
- `app/page.tsx` — the only page (renders at `/`)
- `app/globals.css` — global styles; defines `--background`/`--foreground` CSS variables with dark mode via `prefers-color-scheme`

Path alias `@/*` resolves to the repo root (e.g., `@/app/...`, `@/components/...`).

New pages go under `app/` following Next.js App Router conventions. Shared components should be placed in a `components/` directory at the root when created.
