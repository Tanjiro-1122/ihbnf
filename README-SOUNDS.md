# IHBNF website: all-in-one

Run it:

    npm install
    npm run dev        # http://localhost:3000
    npm run build && npm start   # production

(Needs internet on first build: the site loads Hanken Grotesk and Instrument Serif from Google Fonts.)

## What's new in this version
- Shelf books ("Why Henry?" and "The Dream of the Payoff"): pull-off-shelf sound, cover creak, page rustle on open;
  thump and shelf-settle on close. Code: src/components/sections/LivingWorkspace.tsx
- Lamp: crisper, louder mechanical click when the chain is pulled (public/media/audio/lamp-switch-click.wav,
  volume set in src/components/ui/BankersLampControl.tsx)
- New sound file: public/media/audio/book-pull.wav
- All sounds follow the Sound/Muted toggle in the top-right corner.
