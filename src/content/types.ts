export type MediaAsset = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

export type VideoAsset = {
  src: string;
  poster?: string;
  title: string;
};

export type ProjectCategory = "book" | "app";
export type ProjectStatus = "available" | "live" | "in-development" | "coming-soon";
export type ProjectTheme = "henry" | "unfiltr" | "memoir";

export type ProjectLink = {
  label: string;
  href: string;
  external?: boolean;
  primary?: boolean;
};

export type Project = {
  slug: string;
  category: ProjectCategory;
  theme: ProjectTheme;
  title: string;
  subtitle?: string;
  fullTitle: string;
  tagline: string;
  summary: string;
  description: string[];
  status: ProjectStatus;
  statusLabel: string;
  details: { label: string; value: string }[];
  features?: { title: string; text: string }[];
  card: {
    kicker: string;
    title: string;
    subtitle?: string;
    description: string;
    cta: string;
  };
  media: {
    artwork?: MediaAsset;
    cover?: MediaAsset;
    trailer?: VideoAsset;
    screenshots?: MediaAsset[];
  };
  links: ProjectLink[];
  keywords: string[];
};
