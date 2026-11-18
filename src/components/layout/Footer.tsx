"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mark } from "./Logo";
import { site } from "@/content/site";

const footerLinks = [
  { label: "Books", href: "/#books" },
  { label: "Apps", href: "/#apps" },
  { label: "About", href: "/#about" },
  { label: "Contact", href: "/#connect" },
  { label: "Privacy", href: "/privacy" },
];

export function Footer() {
  const pathname = usePathname();
  if (pathname === "/" || pathname.startsWith("/lab")) return null;

  return (
    <footer data-testid="site-footer" className="relative border-t border-bone/[0.08] bg-ink">
      <div className="shell grid gap-10 py-12 sm:py-16 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <div className="flex items-center gap-4">
            <Mark className="h-10 w-10 text-gold" />
            <span className="text-3xl font-semibold tracking-[0.3em] sm:text-4xl">IHBNF</span>
          </div>
          <p className="mt-5 font-display text-2xl italic text-bone/90 sm:text-3xl">{site.motto}</p>
          <p className="mt-3 text-mute">Created by {site.founder.name}.</p>
        </div>
        <nav aria-label="Footer" className="lg:col-span-5 lg:justify-self-end">
          <ul className="grid grid-cols-2 gap-x-10 gap-y-3 sm:grid-cols-3">
            {footerLinks.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  data-testid={`footer-link-${l.label.toLowerCase()}`}
                  className="inline-block py-1 text-mute transition-colors duration-300 hover:text-bone"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="shell flex flex-col gap-2 border-t border-bone/[0.06] py-6 text-sm text-mute sm:flex-row sm:justify-between">
        <p data-testid="footer-copyright">© {new Date().getFullYear()} IHBNF. All rights reserved.</p>
        <p>Made with intent, one project at a time.</p>
      </div>
    </footer>
  );
}
