import { getProject } from "@/content/projects";
import { shelfBooks } from "@/components/books/StudyHardcover";
import type { HardcoverDesign } from "./hardcover";

export type CatalogBook = {
  id: string;
  fullTitle: string;
  title: string;
  author: string;
  series?: string;
  cover: string;
  spine: { tone: string; edge: string; foil: string };
  dimensions: { height: number; width: number; thickness: number; board: number };
  status: string;
  href: string;
};

const memoir = getProject("the-dream-of-the-payoff")!;
const henry = getProject("why-henry")!;

// Measurements are millimeters. Use bottom-to-top order for each stack.
export const bookshelfCatalog: readonly CatalogBook[] = [
  {
    id: "dream-payoff",
    title: memoir.title,
    fullTitle: memoir.fullTitle,
    author: "Javier Huertas",
    cover: shelfBooks["dream-payoff"].cover,
    spine: { tone: "#401b18", edge: "#754333", foil: "#eaca90" },
    dimensions: { height: 232, width: 154, thickness: 31, board: 3.1 },
    status: memoir.statusLabel,
    href: "/projects/the-dream-of-the-payoff",
  },
  {
    id: "why-henry",
    title: "Why Henry?",
    fullTitle: henry.fullTitle,
    series: "THE UNWRITTEN JOURNEY  ·  BOOK ONE",
    author: "Javier Huertas",
    cover: shelfBooks["why-henry"].cover,
    spine: { tone: "#132235", edge: "#3f5261", foil: "#ebce98" },
    dimensions: { height: 225, width: 150, thickness: 27, board: 2.8 },
    status: henry.statusLabel,
    href: "/projects/why-henry",
  },
];

export type ShelfLayout = {
  maxBooksPerStack: number;
  maxStackHeight: number;
  stackGap: number;
};

export const bookshelfLayout: ShelfLayout = { maxBooksPerStack: 4, maxStackHeight: 135, stackGap: 46 };

export function arrangeBooks(entries: readonly CatalogBook[], layout: ShelfLayout) {
  const stacks: { entries: CatalogBook[]; width: number; height: number }[] = [];
  for (const book of entries) {
    let stack = stacks.at(-1);
    if (!stack || stack.entries.length >= layout.maxBooksPerStack ||
      stack.height + book.dimensions.thickness > layout.maxStackHeight) {
      stack = { entries: [], width: 0, height: 0 };
      stacks.push(stack);
    }
    stack.entries.push(book);
    stack.width = Math.max(stack.width, book.dimensions.height);
    stack.height += book.dimensions.thickness;
  }

  const totalWidth = stacks.reduce((width, stack) => width + stack.width, 0) +
    Math.max(0, stacks.length - 1) * layout.stackGap;
  let left = -totalWidth / 2;
  return stacks.map((stack) => {
    const center = left + stack.width / 2;
    left += stack.width + layout.stackGap;
    return { ...stack, center };
  });
}

export function hardcoverDesign(book: CatalogBook): HardcoverDesign {
  const { height, width, thickness, board } = book.dimensions;
  if (![height, width, thickness, board].every(value => Number.isFinite(value) && value > 0) ||
    height <= 8 || width <= 7 || thickness <= board * 2) {
    throw new Error(`Invalid hardcover dimensions for ${book.fullTitle}`);
  }
  return {
    title: book.title,
    author: book.author,
    series: book.series,
    ...book.spine,
    width: book.dimensions.height / 75,
    depth: book.dimensions.width / 75,
    thickness: book.dimensions.thickness / 75,
    boardThickness: book.dimensions.board / 75,
  };
}
