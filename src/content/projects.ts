import type { Project } from "./types";
import { links } from "./site";

// Add new books, apps or other work here. Each entry automatically gets a card and a page at /projects/[slug].
export const projects: Project[] = [
  {
    slug: "why-henry",
    category: "book",
    theme: "henry",
    title: "The Unwritten Journey",
    subtitle: "Book One: Why Henry?",
    fullTitle: "The Unwritten Journey — Book One: Why Henry?",
    tagline: "Two friends. Six mysterious stone markers. One forgotten secret.",
    summary: "A young-adult fantasy adventure by Javier Huertas.",
    description: [
      "Every great adventure begins with a question.",
      "For Dominick and Henry, it starts with a discovery that seems ordinary. It turns into a mystery involving six mysterious stone markers, forgotten secrets, friendship, danger, and something much larger than either boy understands.",
      "The Unwritten Journey — Book One: Why Henry? is a young-adult fantasy adventure by Javier Huertas, available now on Amazon.",
    ],
    status: "available",
    statusLabel: "Available Now",
    details: [
      { label: "Series", value: "The Unwritten Journey · Book One" },
      { label: "Genre", value: "Young-adult fantasy" },
      { label: "Author", value: "Javier Huertas" },
      { label: "Where", value: "Amazon" },
    ],
    card: {
      kicker: "Book · Available now",
      title: "The Unwritten Journey",
      subtitle: "Book One: Why Henry?",
      description: "Two friends. Six mysterious stone markers. One forgotten secret.",
      cta: "Explore",
    },
    media: {
      artwork: {
        src: "/media/why-henry/approved-concept.svg",
        alt: "Approved promotional artwork for The Unwritten Journey — Book One: Why Henry?",
        width: 1400,
        height: 940,
      },
      cover: {
        src: "/media/why-henry/cover.webp",
        alt: "Cover of The Unwritten Journey — Book One: Why Henry? by Javier Huertas",
        width: 1024,
        height: 1536,
      },
      // trailer: { src: "/media/why-henry/trailer.mp4", poster: "/media/why-henry/trailer-poster.webp", title: "Why Henry? book trailer" },
    },
    links: [{ label: "Buy on Amazon", href: links.amazonWhyHenry, external: true, primary: true }],
    keywords: ["Why Henry", "The Unwritten Journey", "YA fantasy books", "Javier Huertas"],
  },
  {
    slug: "unfiltr",
    category: "app",
    theme: "unfiltr",
    title: "Unfiltr",
    subtitle: "by Javier",
    fullTitle: "Unfiltr by Javier",
    tagline: "Conversation that remembers.",
    summary: "An AI companion app for iOS and Android.",
    description: [
      "Unfiltr is an AI companion app for iOS and Android, built by Javier Huertas under IHBNF.",
      "It's built around AI companions and persistent memory, so a conversation can pick up where it left off instead of starting from zero every time.",
      "Alongside conversation, Unfiltr includes voice, immersive chat worlds, journaling, meditation, and experiences shaped around the person using it.",
    ],
    status: "live",
    statusLabel: "iOS & Android",
    details: [
      { label: "Type", value: "AI companion app" },
      { label: "Platforms", value: "iOS · Android" },
      { label: "Made by", value: "Javier Huertas" },
      { label: "Website", value: "unfiltrbyjavier.com" },
    ],
    features: [
      { title: "AI companions", text: "Companions to talk with, shaped around the way you like to talk." },
      { title: "Persistent memory", text: "Context carries from one conversation to the next." },
      { title: "Voice", text: "Speak out loud when typing isn't the right fit." },
      { title: "Immersive worlds", text: "Chat environments that set the tone of a conversation." },
      { title: "Journaling", text: "A private place to write things down and look back." },
      { title: "Meditation", text: "Guided moments to slow down and reset." },
    ],
    card: {
      kicker: "App · iOS & Android",
      title: "Unfiltr",
      subtitle: "by Javier",
      description: "AI companionship, memory, conversations and immersive experiences.",
      cta: "Discover",
    },
    media: {
      screenshots: [
        {
          src: "/media/unfiltr/kai-tropical-chat.jpg",
          alt: "Real Unfiltr chat screen with Kai in a tropical sunset world",
          width: 1179,
          height: 2556,
        },
        {
          src: "/media/unfiltr/zen-temple-journal.jpg",
          alt: "Real Unfiltr journal screen in the Zen Temple world",
          width: 1179,
          height: 2556,
        },
        {
          src: "/media/unfiltr/memory-timeline.png",
          alt: "Real Unfiltr Memory Timeline screen with Kai",
          width: 1179,
          height: 2556,
        },
      ],
    },
    links: [
      { label: "Visit Website", href: links.unfiltrSite, external: true, primary: true },
      { label: "Download on the App Store", href: links.unfiltrAppStore, external: true },
      { label: "Get it on Google Play", href: links.unfiltrGooglePlay, external: true },
    ],
    keywords: ["Unfiltr by Javier", "AI companion app", "Unfiltr"],
  },
  {
    slug: "the-dream-of-the-payoff-of-working-hard",
    category: "book",
    theme: "memoir",
    title: "The Dream of the Payoff of Working Hard",
    fullTitle: "The Dream of the Payoff of Working Hard",
    tagline: "A life built through work, sacrifice, family, mistakes, and persistence.",
    summary: "An autobiographical project by Javier Huertas.",
    description: [
      "The Dream of the Payoff of Working Hard is Javier Huertas's autobiographical project: the true story of an ordinary man whose life has been anything but ordinary.",
      "It covers growing up, family, relationships, fatherhood, work, sacrifice, financial struggles, and dreams that never went away.",
      "Underneath all of it is one question: when does all that hard work finally pay off?",
    ],
    status: "in-development",
    statusLabel: "In Development",
    details: [
      { label: "Type", value: "Memoir · Non-fiction" },
      { label: "Author", value: "Javier Huertas" },
      { label: "Status", value: "In development" },
    ],
    card: {
      kicker: "Memoir · In development",
      title: "The Dream of the Payoff of Working Hard",
      description: "A life built through work, sacrifice, family, mistakes, and persistence.",
      cta: "Learn More",
    },
    media: {
      artwork: {
        src: "/media/memoir/dream-payoff-cover.svg",
        alt: "Cover of The Dream of the Payoff by Javier Huertas",
        width: 320,
        height: 480,
      },
      cover: {
        src: "/media/memoir/dream-payoff-cover.svg",
        alt: "Cover of The Dream of the Payoff by Javier Huertas",
        width: 320,
        height: 480,
      },
    },
    links: [{ label: "Follow for updates", href: "/#connect" }],
    keywords: ["Javier Huertas memoir", "The Dream of the Payoff of Working Hard"],
  },
];

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);
