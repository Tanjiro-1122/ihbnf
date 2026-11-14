import type { MediaAsset } from "./types";

// Brand-wide settings. Edit this file to update copy, links and media used across the site.
export const site = {
  name: "IHBNF",
  motto: "Idle Hands Bear No Fruit.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://ihbnf.com",
  title: "IHBNF — Idle Hands Bear No Fruit",
  description:
    "IHBNF (Idle Hands Bear No Fruit) is the creative home of author and builder Javier Huertas: The Unwritten Journey — Book One: Why Henry?, the Unfiltr by Javier AI companion app, and the memoir The Dream of the Payoff of Working Hard.",
  keywords: [
    "IHBNF",
    "Idle Hands Bear No Fruit",
    "Javier Huertas",
    "The Unwritten Journey",
    "Why Henry",
    "Why Henry book",
    "Unfiltr by Javier",
    "Unfiltr app",
    "YA fantasy books",
    "young adult fantasy",
    "independent author",
    "AI companion app",
  ],
  founder: {
    name: "Javier Huertas",
    roles: ["Author", "Creator", "Builder"],
    // Replace with the real portrait: put the file in /public/media/author and fill this in.
    photo: null as MediaAsset | null,
  },
  // Replace with the real logo file in /public/media/brand when it's ready.
  logo: null as MediaAsset | null,
  // Split on purpose so the address never appears as plain text in the page source.
  email: { user: "ihbnfllc", domain: "gmail.com" },
};

export const links = {
  // TODO: replace with the exact Amazon product URL.
  amazonWhyHenry:
    "https://www.amazon.com/s?k=The+Unwritten+Journey+Why+Henry+Javier+Huertas",
  unfiltrSite: "https://unfiltrbyjavier.com",
};

export type NavItem = { id: string; label: string };

export const nav: NavItem[] = [
  { id: "home", label: "Home" },
  { id: "work", label: "Projects" },
  { id: "books", label: "Books" },
  { id: "apps", label: "Apps" },
  { id: "about", label: "About" },
  { id: "connect", label: "Connect" },
];

export type SocialKey =
  | "youtube"
  | "threads"
  | "bluesky"
  | "pinterest"
  | "instagram"
  | "facebook"
  | "tiktok";

export type Social = { key: SocialKey; label: string; handle: string; href: string };

export const socials: Social[] = [
  { key: "youtube", label: "YouTube", handle: "@IHBNF", href: "https://www.youtube.com/@IHBNF" },
  { key: "instagram", label: "Instagram", handle: "@unfiltrbyjavier", href: "https://www.instagram.com/unfiltrbyjavier/" },
  { key: "tiktok", label: "TikTok", handle: "@unfiltrbyjavier", href: "https://www.tiktok.com/@unfiltrbyjavier" },
  { key: "threads", label: "Threads", handle: "@unfiltrbyjavier", href: "https://www.threads.net/@unfiltrbyjavier" },
  { key: "bluesky", label: "Bluesky", handle: "@ihbnf.bsky.social", href: "https://bsky.app/profile/ihbnf.bsky.social" },
  { key: "pinterest", label: "Pinterest", handle: "ihbnfllc", href: "https://www.pinterest.com/ihbnfllc/" },
  // TODO: confirm the exact Facebook page URL.
  { key: "facebook", label: "Facebook", handle: "Unfiltr by Javier", href: "https://www.facebook.com/unfiltrbyjavier" },
];
