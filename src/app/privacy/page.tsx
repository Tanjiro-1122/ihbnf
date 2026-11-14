import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How the IHBNF website handles your information.",
  alternates: { canonical: "/privacy" },
};

const sections = [
  {
    h: "What this site collects",
    p: "This website doesn't have accounts, forms, or a newsletter yet, and it doesn't set advertising or tracking cookies. Our hosting provider may keep standard server logs (such as IP address and browser type) for security and reliability.",
  },
  {
    h: "Links to other sites",
    p: "Pages here link to Amazon, the Unfiltr by Javier website, and social platforms like YouTube, Instagram, TikTok, Threads, Bluesky, Pinterest and Facebook. Those services have their own privacy policies, which apply once you leave this site.",
  },
  {
    h: "Apps",
    p: "Unfiltr by Javier is a separate product with its own privacy policy, available on the Unfiltr website and in the app stores.",
  },
  {
    h: "Email",
    p: "If you email IHBNF, your message and address are used only to reply to you. They aren't sold or shared.",
  },
  {
    h: "Changes",
    p: "If the site adds features like an email signup, this page will be updated before they go live.",
  },
];

export default function PrivacyPage() {
  return (
    <section data-testid="privacy-page" className="shell max-w-3xl pb-28 pt-36 sm:pt-44">
      <p className="eyebrow">Legal</p>
      <h1 className="mt-5 font-display text-[clamp(2.8rem,7vw,5rem)] leading-none">Privacy</h1>
      <p className="mt-6 text-lg text-mute">Plain-language summary of how this website treats your information.</p>
      <div className="mt-14 space-y-10">
        {sections.map((s) => (
          <div key={s.h}>
            <h2 className="text-xl font-medium text-bone">{s.h}</h2>
            <p className="mt-3 text-lg leading-relaxed text-bone/80">{s.p}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
