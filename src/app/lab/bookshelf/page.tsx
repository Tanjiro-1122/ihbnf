import type { Metadata } from "next";
import { BookshelfLab } from "@/components/lab/bookshelf/BookshelfLab";

export const metadata: Metadata = {
  title: "Bookshelf Lab",
  robots: { index: false, follow: false },
};

export default function BookshelfLabPage() {
  return <BookshelfLab />;
}
