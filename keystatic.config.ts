import { config, fields, collection } from "@keystatic/core";

// Local mode in dev (writes straight to files on disk).
// GitHub mode in production (each save commits to the repo, which triggers a Vercel deploy).
// Set NEXT_PUBLIC_KEYSTATIC_STORAGE=github in .env.local to run the one-time GitHub App
// setup from dev (must be NEXT_PUBLIC_ so the admin UI bundle sees it too).
const useGitHubStorage =
  process.env.NODE_ENV !== "development" ||
  process.env.NEXT_PUBLIC_KEYSTATIC_STORAGE === "github";

const storage = useGitHubStorage
  ? ({ kind: "github", repo: "ckbcodess/portfolio-v2" } as const)
  : ({ kind: "local" } as const);

export default config({
  storage,
  ui: {
    brand: { name: "Ransford's Portfolio" },
  },
  collections: {
    caseStudies: collection({
      label: "Case Studies",
      slugField: "title",
      path: "content/case-studies/*",
      format: { data: "json" },
      schema: {
        title: fields.slug({
          name: {
            label: "Title",
            description: "Project name shown on cards and the case study page",
            validation: { isRequired: true },
          },
          slug: {
            label: "URL slug",
            description: "Becomes the page URL: /work/<slug>",
          },
        }),
        order: fields.integer({
          label: "Display order",
          description: "Lower numbers appear first on the homepage",
          defaultValue: 99,
          validation: { isRequired: true },
        }),
        description: fields.text({
          label: "Short description",
          description: "One-liner shown on the homepage card and under the case study title",
          multiline: true,
          validation: { isRequired: true },
        }),
        metadataTitle: fields.text({
          label: "Browser tab title",
          description: "Optional. Defaults to the project title",
        }),
        heroSrc: fields.image({
          label: "Hero image",
          directory: "public/images/work",
          publicPath: "/images/work/",
          validation: { isRequired: true },
        }),
        heroAlt: fields.text({
          label: "Hero image alt text",
        }),
        meta: fields.array(
          fields.object({
            label: fields.text({ label: "Label", validation: { isRequired: true } }),
            value: fields.text({ label: "Value", validation: { isRequired: true } }),
          }),
          {
            label: "Meta (Role / Team / Year)",
            itemLabel: (props) => `${props.fields.label.value}: ${props.fields.value.value}`,
          }
        ),
        sections: fields.array(
          fields.object({
            id: fields.text({
              label: "Anchor id",
              description: "Unique id used for the sidebar links (e.g. overview, process, result)",
              validation: { isRequired: true },
            }),
            label: fields.text({
              label: "Sidebar label",
              validation: { isRequired: true },
            }),
            heading: fields.text({
              label: "Heading",
              validation: { isRequired: true },
            }),
            body: fields.array(
              fields.text({ label: "Paragraph", multiline: true }),
              {
                label: "Paragraphs",
                itemLabel: (props) => props.value.slice(0, 80) || "(empty)",
              }
            ),
            bullets: fields.array(fields.text({ label: "Bullet" }), {
              label: "Bullet points",
              itemLabel: (props) => props.value.slice(0, 80) || "(empty)",
            }),
            labelClassName: fields.select({
              label: "Label color",
              options: [
                { label: "Default", value: "text-foreground" },
                { label: "Orange", value: "text-[#f54900]" },
                { label: "Green", value: "text-[#22c55e]" },
                { label: "Muted", value: "text-muted-foreground" },
              ],
              defaultValue: "text-foreground",
            }),
            imageSrc: fields.image({
              label: "Section image (optional)",
              directory: "public/images/work",
              publicPath: "/images/work/",
            }),
            videoSrc: fields.file({
              label: "Section video (optional)",
              directory: "public/videos",
              publicPath: "/videos/",
            }),
          }),
          {
            label: "Sections",
            itemLabel: (props) => props.fields.heading.value || props.fields.label.value,
          }
        ),
        nextProject: fields.relationship({
          label: "Next project",
          description: "Shown at the bottom of the page as the next case study to read",
          collection: "caseStudies",
        }),
        gradientColors: fields.object(
          {
            top: fields.text({ label: "Top", description: "Hex color, e.g. #360000", validation: { isRequired: true } }),
            middle: fields.text({ label: "Middle", description: "Hex color", validation: { isRequired: true } }),
            bottom: fields.text({ label: "Bottom", description: "Hex color", validation: { isRequired: true } }),
          },
          {
            label: "Background gradient",
            description: "The three colors of the case study hero background",
          }
        ),
        isLocked: fields.checkbox({
          label: "Password-protect this case study",
          defaultValue: false,
        }),
        password: fields.text({
          label: "Password",
          description: "Only used when the case study is locked",
        }),
      },
    }),
    archive: collection({
      label: "Archive",
      slugField: "title",
      path: "content/archive/*",
      format: { data: "json" },
      schema: {
        title: fields.slug({
          name: { label: "Project name", validation: { isRequired: true } },
        }),
        role: fields.text({
          label: "Role",
          description: "e.g. UI Engineering, Frontend Dev",
          validation: { isRequired: true },
        }),
        year: fields.text({
          label: "Year",
          description: "e.g. 2026",
          validation: { isRequired: true },
        }),
        tech: fields.text({
          label: "Tech / medium",
          description: "Optional, e.g. React, WebGL",
        }),
        link: fields.url({
          label: "External link",
          description: "Optional. If set, the row links out to this URL",
        }),
        image: fields.image({
          label: "Thumbnail (optional)",
          directory: "public/images/archive",
          publicPath: "/images/archive/",
        }),
      },
    }),
  },
});
