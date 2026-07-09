# Updating this portfolio (CMS guide)

Content lives in this repo as JSON files under `content/`, managed through a
[Keystatic](https://keystatic.com) admin UI. **Every content change is a git commit — and
every commit pushed to `master` triggers a Vercel production deploy.** That's the whole
publishing model: save → commit → live.

## Editing on your computer (local mode)

1. `npm run dev`
2. Open **http://localhost:3000/keystatic**
3. Edit case studies or archive entries. Saving writes directly to the files in
   `content/` and drops uploaded images into `public/images/`.
4. When you're happy, commit and push:

   ```bash
   git add -A
   git commit -m "content: add new case study"
   git push
   ```

   Vercel picks up the push and deploys production automatically.

## Editing from anywhere (production /keystatic — one-time setup)

In production, the admin at **https://your-domain/keystatic** uses GitHub mode: you log in
with GitHub and every save becomes a commit to `ckbcodess/portfolio-v2` (which deploys).

One-time setup:

1. In `.env.local`, add `NEXT_PUBLIC_KEYSTATIC_STORAGE=github`, then run `npm run dev` and open
   http://localhost:3000/keystatic — Keystatic walks you through creating a GitHub App
   for the repo and writes its credentials into `.env`.
2. Copy these four values into **Vercel → Project → Settings → Environment Variables**:
   - `KEYSTATIC_GITHUB_CLIENT_ID`
   - `KEYSTATIC_GITHUB_CLIENT_SECRET`
   - `KEYSTATIC_SECRET`
   - `NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG`
3. Remove `NEXT_PUBLIC_KEYSTATIC_STORAGE=github` from `.env.local` (dev goes back to local mode).
4. Redeploy. `/keystatic` on the live site now works from any device you can log into
   GitHub from.

Only GitHub accounts with write access to the repo can edit, so the admin is safe to
leave enabled.

## What's editable

| Collection | Files | Shows up in |
| --- | --- | --- |
| **Case Studies** | `content/case-studies/*.json` | Homepage cards, `/work/<slug>` pages, archive drawer |
| **Archive** | `content/archive/*.json` | The Archive drawer (supplemental rows) |
| **Resume** (singleton) | `content/resume.json` | The `/resume` page — experience, skills, education, contact links, and the CV PDF served by the Download button (upload a new PDF here when your CV changes) |
| **Info Sheet** (singleton) | `content/info-sheet.json` | The Info panel (nav → Info) — bio paragraphs, experience story, "things I geek about" tags, and connect links |

Case study fields worth knowing:

- **URL slug** — becomes `/work/<slug>`. Don't change it after publishing unless you want
  the URL to change.
- **Display order** — lower numbers appear first on the homepage.
- **Sections** — each has an anchor id (used by the sidebar), a label, heading,
  paragraphs, optional bullets, an optional image and an optional video.
- **Next project** — pick another case study; its title and hero image are used
  automatically for the "read next" footer.
- **Lock + password** — turns on the password gate for that case study.

Images uploaded through the CMS land in `public/images/work/<slug>/` (case studies) and
`public/images/archive/<slug>/` (archive thumbnails).

## Other env vars

- `LASTFM_API_KEY` / `LASTFM_USERNAME` — used by `/api/now-playing` (the "listening to"
  widget in the Info sheet). The key now lives server-side only; set these in Vercel.
