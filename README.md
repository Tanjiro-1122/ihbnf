# IHBNF

The website for **IHBNF — Idle Hands Bear No Fruit**, the creative home of Javier Huertas.

Built with Next.js (App Router), TypeScript and Tailwind CSS. No database, no API keys, fully static.

## Run locally

```bash
yarn install
yarn dev        # http://localhost:3000
yarn build      # production build
```

## Deploy on Vercel

1. Push this folder to the `ihbnf` GitHub repository.
2. Import the repo in Vercel. Framework preset: **Next.js**. No settings to change.
3. The current production URL is `https://ihbnf.vercel.app`. If a custom domain is connected later, set `NEXT_PUBLIC_SITE_URL` to that domain so canonical URLs, sitemap and social previews follow it.

## Where things live

```
src/
  app/                 routes, metadata, sitemap, robots, icons
    projects/[slug]/   one page per project, generated from content
    privacy/
  components/
    layout/            header, mobile menu, footer, logo
    sections/          homepage sections, in page order
    ui/                buttons, cards, reveal + parallax helpers
    visuals/           book cover, phone mockup, backgrounds
  content/
    site.ts            brand copy, nav, social links, email, Amazon link
    projects.ts        every book and app
public/media/          replaceable images and video (see MEDIA.md)
```

## "Ask IHBNF" assistant (optional, off by default)

A chat bubble that answers visitor questions using only the facts in `src/content/assistant.json`.
It is hidden unless you turn it on, and the site works fully without it.

To enable it on Vercel, add these environment variables and redeploy:

| Variable | Value |
| --- | --- |
| `NEXT_PUBLIC_ASK_IHBNF_ENABLED` | `true` |
| `ASK_AI_API_KEY` | your provider key (e.g. an OpenAI key) |
| `ASK_AI_MODEL` | a model name from that provider |
| `ASK_AI_BASE_URL` | optional, defaults to `https://api.openai.com/v1` (any OpenAI-compatible API works) |

The key stays on the server (`src/app/api/ask/route.ts`) and is never sent to the browser. See `.env.example`.

## Common updates

- **External links:** `src/content/site.ts` contains the direct Why Henry Amazon link, Unfiltr website, App Store, Google Play, and social URLs. Facebook is the only remaining URL that should be confirmed before treating it as final.
- **Add a book or app:** add an entry to `src/content/projects.ts`. It gets a card and its own page automatically.
- **Swap placeholder media:** see `MEDIA.md`.

Future sections (blog, events, press, shop, email signup) can be added as new routes under `src/app` and new entries in `src/content`.
