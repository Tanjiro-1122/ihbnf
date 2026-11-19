# IHBNF study and vault handoff

## Local review

Run `npm ci` if dependencies are missing, then `npm run dev`. Open the study at `/` in a fresh browser profile for a clean playthrough. The static 3D bookshelf preview is available at `/lab/bookshelf`.

## Puzzle verification

1. Toggle the banker's lamp seven times. Progress advances when the switch engages. A cancelled pull adds no extra progress.
2. Turn the brass pocket compass five times. The rune awakens after the fifth successful turn.
3. Activate the rune, let the portrait swing open, and inspect the concealed safe.
4. Try an incorrect combination and verify the locked response. Use the portrait motto and the in-scene hint to solve the safe.
5. Enter the passage, verify the vault displays, and reload to confirm progress persists. Return to the study and use the rune shortcut.
6. Step back from the safe and check that the portrait closes. Activate the closed emblem to open the original IHBNF panel.

Progress lives under `ihbnf.study-vault.v1` in local storage. In development, `window.resetStudyVault()` resets the puzzle and reloads the study. The route gate is for discovery. Only material approved for public access belongs in vault assets or content.

## Maintenance

| Area | Location |
| --- | --- |
| Study composition, object hotspots, and lamp hook | `src/components/sections/LivingWorkspace.tsx` |
| Approved lamp sound and timing | `src/components/ui/BankersLampControl.tsx`, `public/media/audio/lamp-chain-approved.mp3` |
| Puzzle progress, portrait, safe, and sound | `src/components/vault/` |
| Vault route, exhibit content, and art | `src/app/vault/`, `src/content/vault.ts`, `public/media/vault/` |
| Current shelf, hardcover readers, and static lab | `src/components/books/`, `src/components/lab/bookshelf/`, `src/app/lab/bookshelf/`, `public/media/study/books/` |

## Open visual work

The books and bookshelf are unfinished visual work. The current shelf and reader interactions are the handoff baseline. Final appearance and model continuity during transitions are reserved for the separate 3D bookshelf system. The live resting stack uses WebGL and falls back to a CSS representation when WebGL cannot initialize.

The vault uses existing published covers and placeholders for material awaiting approval. Physical phone testing remains open. The two existing ESLint warnings are in `src/app/apple-icon.tsx`.
