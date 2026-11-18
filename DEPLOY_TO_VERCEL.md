# IHBNF — Vercel deployment package

This ZIP contains the **complete Next.js application** (not a PDF or a single HTML preview). It is prepared for Vercel. Do not upload the preview HTML as a replacement for the project.

## Recommended deployment (GitHub → Vercel)

1. Extract `IHBNF_Vercel_Ready.zip` to a folder on your computer.
2. Open the folder that contains `package.json`, `src`, and `public`.
3. Commit its contents to your **IHBNF GitHub repository**, ideally on a testing branch first. Preserve the `src` and `public` folders together.
4. In Vercel, import that repository, or if already connected, deploy the branch.
5. Framework: **Next.js**. Root directory: **repository root** (the folder containing `package.json`). Install command: `npm ci` or Vercel default. Build command: `npm run build` or Vercel default.
6. Open the Vercel preview deployment to test the lamp, both books, links, phone and laptop before promoting it to Production.

Alternatively, with Vercel CLI installed, run `npx vercel` from the extracted folder and follow its prompts.

## What this revision changes

- Removes visual duplicates painted over the IHBNF wall frame, laptop screen and Unfiltr phone. The approved clean study plate already contains those images in the correct positions. The controls now highlight the artwork **in place** while keeping their click handlers and existing modal content.
- Leaves both physical shelf-book animations and the Banker's Lamp component and audio assets intact.
- Leaves the project routes, privacy page, optional Ask IHBNF assistant, and metadata intact.

## Notes on validation

The source was inspected for TypeScript syntax errors in the edited component (none found), checked for missing literal media files referenced in source (none in active code), and confirmed to include lamp, sound and book assets. **A production Next.js build and browser acceptance test have not been completed in this environment because `npm ci` could not finish.** Vercel's build results and a real-device preview must be checked before Production.

Do not put real passwords or private API keys in this package. The `Ask IHBNF` feature stays off unless you configure it separately.
