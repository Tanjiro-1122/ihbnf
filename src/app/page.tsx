import type { Metadata } from "next";
import { LivingWorkspace } from "@/components/sections/LivingWorkspace";
import { JsonLd } from "@/components/ui/JsonLd";
import { site, socials } from "@/content/site";

export const metadata: Metadata = { alternates: { canonical: "/" } };

const orgLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "IHBNF",
  alternateName: "Idle Hands Bear No Fruit",
  url: site.url,
  slogan: site.motto,
  founder: { "@type": "Person", name: site.founder.name, jobTitle: "Author" },
  sameAs: socials.map((s) => s.href),
};

export default function Home() {
  return (
    <>
      <JsonLd data={orgLd} />
      <LivingWorkspace />
    </>
  );
}
