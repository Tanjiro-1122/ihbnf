# Media guide

All replaceable media lives in `public/media`. Drop a file in, then point to it in `src/content`.

| What | Put the file in | Then edit |
| --- | --- | --- |
| IHBNF logo | `public/media/brand/` | `site.logo` in `src/content/site.ts` (the text logo is in `src/components/layout/Logo.tsx`) |
| Social preview image (optional) | `public/media/brand/og.png` | replace `src/app/opengraph-image.tsx` or add `openGraph.images` in `src/app/layout.tsx` |
| Javier's author photo | `public/media/author/` | `site.founder.photo` in `src/content/site.ts` |
| Why Henry book cover | `public/media/why-henry/cover.webp` | `media.cover` for `why-henry` in `src/content/projects.ts` |
| Why Henry promo video | `public/media/why-henry/trailer.mp4` (+ poster) | `media.trailer` for `why-henry` — it becomes the feature section background |
| Why Henry artwork | `public/media/why-henry/artwork.webp` | `media.artwork` for `why-henry` (current file is a stand-in) |
| Unfiltr screenshots | `public/media/unfiltr/` | `media.screenshots` for `unfiltr` |
| Unfiltr promo media | `public/media/unfiltr/` | `media.artwork` for `unfiltr` (replaces the abstract visual on its card and page) |
| Memoir artwork | `public/media/memoir/artwork.webp` | `media.artwork` for the memoir (current file is a stand-in) |
| Future projects | `public/media/projects/<slug>/` | add a new entry to `src/content/projects.ts` |

Tips: export images as WebP or AVIF around 1600–2400px wide. Next.js resizes them automatically.
