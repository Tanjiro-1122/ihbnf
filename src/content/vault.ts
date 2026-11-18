type VaultItem = {
  title: string;
  status: string;
  description?: string;
  image?: { src: string; alt: string; width: number; height: number };
};

type VaultSection = {
  id: string;
  title: string;
  items: VaultItem[];
};

// Add only material approved for public discovery. This file is shipped to browsers.
export const vaultContents: VaultSection[] = [
  {
    id: "upcoming-books",
    title: "Upcoming Books",
    items: [{ title: "A shelf reserved", status: "Coming soon", description: "Future covers and release details will appear here." }],
  },
  {
    id: "unwritten-journey",
    title: "The Unwritten Journey",
    items: [
      {
        title: "Why Henry?",
        status: "Book One · Published",
        image: { src: "/media/why-henry/cover-user.jpg", alt: "Approved cover of Why Henry?", width: 1600, height: 2400 },
      },
      { title: "Future installments", status: "Coming soon" },
    ],
  },
  {
    id: "other-writing",
    title: "Other Writing Projects",
    items: [
      {
        title: "The Dream of the Payoff",
        status: "Memoir · Published",
        image: { src: "/media/memoir/dream-payoff-cover.svg", alt: "Cover of The Dream of the Payoff", width: 320, height: 480 },
      },
      { title: "From the writing desk", status: "Coming soon" },
    ],
  },
  {
    id: "exclusive-artwork",
    title: "Exclusive Artwork",
    items: [{ title: "The portfolio drawers", status: "Coming soon" }],
  },
  {
    id: "author-notes",
    title: "Messages From the Author",
    items: [{ title: "Correspondence", status: "Coming soon" }],
  },
];
