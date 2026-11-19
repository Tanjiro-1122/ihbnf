export type VaultItem = {
  title: string;
  status: string;
  synopsis: string;
  image: { src: string; alt: string; width: number; height: number };
};

export type VaultSection = {
  id: string;
  title: string;
  description: string;
  items: VaultItem[];
};

// Only material from the author's previously established project concepts is
// presented as story fact. The upcoming works are marked as in development;
// this gallery does not imply they are published or offer unreleased manuscripts.
export const vaultContents: VaultSection[] = [
  {
    id: "hidden-manuscripts",
    title: "The Hidden Manuscripts",
    description: "Four doors into stories still taking shape. You found their covers before most visitors ever see them.",
    items: [
      {
        title: "The Lost",
        status: "The It Almost Wasn't Series · Book One · In development",
        image: {
          src: "/media/vault/the-lost-cover.webp",
          alt: "The Lost cover: a boy in a wet alley facing a crack of golden light",
          width: 300, height: 450,
        },
        synopsis: "Michael is an ordinary teenager until a strange fracture appears in an alley and the world stops behaving like it should. What waits beyond that impossible crack—and what could be lost by crossing it? Book One begins a mystery about another world and the line between what we know and what we only think we know.",
      },
      {
        title: "The Guardian",
        status: "The Terra Series · Book One · In development",
        image: {
          src: "/media/vault/the-guardian-cover.webp",
          alt: "The Guardian cover: an ancient mine entrance and a crowned lion emblem",
          width: 300, height: 450,
        },
        synopsis: "Long before the modern world, Amir, a former adviser to Solomon, discovers something impossible beneath Ophir. An ancient Guardian, a warning misunderstood, and those who choose to preserve that warning leave consequences that echo across centuries. A historical conspiracy with a science-fiction mystery beneath it.",
      },
      {
        title: "The Beacon",
        status: "The Terra Series · Book Two · In development",
        image: {
          src: "/media/vault/the-beacon-cover.webp",
          alt: "The Beacon cover: a glowing Earth suspended within a monumental interstellar council chamber",
          width: 300, height: 450,
        },
        synopsis: "A beacon awakens after humanity is assessed, bringing Earth's fate before a far older interstellar Council. A human must help make the case for a world full of contradictions—fear and courage, cruelty and compassion—while a decision about Earth's place in the wider universe hangs in the balance.",
      },
      {
        title: "Oh, Mara!",
        status: "The Unwritten Journey · Book Two · In development",
        image: {
          src: "/media/vault/oh-mara-cover.webp",
          alt: "Oh, Mara! cover: friends and family surrounding a hospital bedside beneath a blue magical sky",
          width: 300, height: 450,
        },
        synopsis: "The mystery from Why Henry? grows deeper. Azeron's fractured past, a desperate search for power, and loyalties tested under impossible pressure draw Henry, Dominick and those close to them toward a reckoning that reaches far beyond the world they thought they understood.",
      },
    ],
  },
  {
    id: "published-books",
    title: "The Books That Started It",
    description: "Two published books sit alongside the worlds still waiting to be written.",
    items: [
      {
        title: "Why Henry?",
        status: "The Unwritten Journey · Book One · Published",
        image: {
          src: "/media/why-henry/cover-user.jpg",
          alt: "Published cover of The Unwritten Journey — Book One: Why Henry?",
          width: 300, height: 450,
        },
        synopsis: "Two boys, an unexplained mystery, and a world where the questions are as dangerous as the answers. The Unwritten Journey begins with friendship, strange clues, and a discovery that changes what Henry and Dominick believe is possible.",
      },
      {
        title: "The Dream of the Payoff",
        status: "Memoir · Published",
        image: {
          src: "/media/memoir/dream-payoff-cover.svg",
          alt: "Published cover of The Dream of the Payoff",
          width: 300, height: 450,
        },
        synopsis: "A personal account of hard work, family, ambition, detours, and the stubborn hope that all the effort will one day pay off. This is the real story behind the drive to build something better.",
      },
    ],
  },
];

export const hiddenAuthorNote = {
  heading: "You actually found this place.",
  paragraphs: [
    "Well, look at that. You made it all the way through the study, figured out my little puzzle, and found the room I wasn't exactly advertising.",
    "These shelves hold some of the stories I've published and a few I'm still working on. They're different kinds of stories, but every one of them started with an idea I wanted to see through.",
    "Thanks for being curious enough to come looking. Most people will never know this place is here. Enjoy the sneak peek—and keep it between us for now.",
  ],
  signature: "— Javier",
};
