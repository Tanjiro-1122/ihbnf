import type { Metadata } from "next";
import { LivingWorkspace } from "@/components/sections/LivingWorkspace";
import { BrandStatement } from "@/components/sections/BrandStatement";
import { FeaturedProjects } from "@/components/sections/FeaturedProjects";
import { WhyHenryFeature } from "@/components/sections/WhyHenryFeature";
import { UnfiltrFeature } from "@/components/sections/UnfiltrFeature";
import { MemoirFeature } from "@/components/sections/MemoirFeature";
import { SportsWagerFeature } from "@/components/sections/SportsWagerFeature";
import { MoreBooksTeaser } from "@/components/sections/MoreBooksTeaser";
import { About } from "@/components/sections/About";
import { Philosophy } from "@/components/sections/Philosophy";
import { Connect } from "@/components/sections/Connect";
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
      <BrandStatement />
      <FeaturedProjects />
      <WhyHenryFeature />
      <UnfiltrFeature />
      <SportsWagerFeature />
      <MemoirFeature />
      <MoreBooksTeaser />
      <About />
      <Philosophy />
      <Connect />
    </>
  );
}
