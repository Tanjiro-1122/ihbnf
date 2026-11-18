import type { Metadata } from "next";
import { MagicalBookLab } from "@/components/lab/MagicalBookLab";

export const metadata: Metadata = {
  title: "Magical Floating Book Demonstration — Why Henry?",
  description:
    "Isolated 3D WebGL demonstration of The Unwritten Journey — Book One: Why Henry? being lifted by invisible magic, floating through the study, opening with bending pages, and returning to the bookshelf.",
};

export default function BookLevitationLabPage() {
  return <MagicalBookLab />;
}
