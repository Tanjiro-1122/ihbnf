import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How the IHBNF website handles your information.",
  alternates: { canonical: "/privacy" },
};

const sections = [
  {
    h: "What this site collects",
    p: "This website doesn't have user accounts, a newsletter, or advertising trackers, and it doesn't set advertising cookies. Our hosting provider may process standard request information such as IP address, browser details, and timestamps for security, reliability, and delivery of the site.",
  },
  {
    h: "Ask IHBNF",
    p: "The Ask IHBNF assistant is optional and may be disabled. When it is enabled and you choose to send a message, the recent conversation you provide is sent to the configured AI service so it can generate a response. Don't include passwords, financial information, health information, or other sensitive personal information in those messages.",
  },
  {
    h: "Links to other sites",
    p: "Pages here link to services including Amazon, the Unfiltr by Javier website, Apple App Store, Google Play, YouTube, Instagram, TikTok, Threads, Bluesky, Pinterest, and Facebook. Those services have their own privacy policies, which apply once you leave this site.",
  },
  {
    h: "Apps",
    p: "Unfiltr by Javier is a separate product with its own privacy policy, available on the Unfiltr website and in the app stores.",
  },
  {
    h: "Email",
    p: "If you email IHBNF, your message and address are used to read and respond to your inquiry and are processed through the email services used by IHBNF. IHBNF does not sell your email address.",
  },
  {
    h: "Changes",
    p: "If the site adds features that change how visitor information is handled, this page will be updated to reflect them.",
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
