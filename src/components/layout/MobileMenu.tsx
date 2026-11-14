"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { nav, site } from "@/content/site";

type Props = { open: boolean; onClose: () => void; active: string };

export function MobileMenu({ open, onClose, active }: Props) {
  const firstLink = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    firstLink.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const onResize = () => window.innerWidth >= 768 && onClose();
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [open, onClose]);

  return (
    <div
      id="mobile-menu"
      data-testid="mobile-menu"
      aria-hidden={!open}
      inert={!open}
      className={`fixed inset-0 z-40 flex flex-col bg-ink/95 backdrop-blur-2xl transition-opacity duration-500 md:hidden ${
        open ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <div aria-hidden="true" className="absolute -right-24 top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgb(201_164_92/0.16),transparent_70%)]" />
      <nav aria-label="Mobile" className="shell relative flex flex-1 flex-col justify-center pt-16">
        <ul className="space-y-1">
          {nav.map((item, i) => (
            <li
              key={item.id}
              className={`transition-[opacity,transform] duration-700 ease-[var(--ease-out-expo)] ${
                open ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
              }`}
              style={{ transitionDelay: open ? `${80 + i * 55}ms` : "0ms" }}
            >
              <Link
                ref={i === 0 ? firstLink : undefined}
                href={`/#${item.id}`}
                onClick={onClose}
                data-testid={`mobile-nav-link-${item.id}`}
                className="flex items-baseline gap-4 py-2 font-display text-[2.6rem] leading-tight text-bone"
              >
                <span className="font-sans text-xs tracking-[0.2em] text-mute">0{i + 1}</span>
                <span className={active === item.id ? "italic text-gold" : ""}>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <p className="shell pb-10 font-display text-lg italic text-mute">{site.motto}</p>
    </div>
  );
}
