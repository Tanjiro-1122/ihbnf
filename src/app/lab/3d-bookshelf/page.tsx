import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BookshelfInspector } from "@/components/bookshelf/BookshelfInspector";

export const metadata: Metadata = {
  title: "3D Bookshelf Lab",
  robots: { index: false, follow: false },
};

export default function BookshelfInspectorPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <BookshelfInspector />;
}
