"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { nav } from "@/content/site";
import { Logo } from "./Logo";
import { MobileMenu } from "./MobileMenu";

export function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("home");
  const [bar, setBar] = useState({ x: 0, w: 0, show: false });
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!isHome) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    nav.forEach((n) => {
      const el = document.getElementById(n.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [isHome]);

  useEffect(() => {
    const update = () => {
      const el = listRef.current?.querySelector<HTMLElement>(`[data-nav="${active}"]`);
      setBar(el && isHome ? { x: el.offsetLeft, w: el.offsetWidth, show: true } : (b) => ({ ...b, show: false }));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [active, isHome]);

  const solid = scrolled && !open;

  return (
    <>
      <header
        data-testid="site-header"
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,opacity,transform] duration-500 ${
          isHome && !scrolled && !open
            ? "pointer-events-none -translate-y-2 border-b border-transparent opacity-0"
            : solid
              ? "border-b border-bone/[0.07] bg-ink/70 opacity-100 backdrop-blur-xl"
              : "border-b border-transparent opacity-100"
        }`}
      >
        <div className="shell flex h-16 items-center justify-between sm:h-[4.5rem]">
          <Logo withMotto />
          <nav aria-label="Primary" className="hidden md:block">
            <ul ref={listRef} className="relative flex items-center gap-1">
              {nav.map((item) => (
                <li key={item.id}>
                  <Link
                    href={`/#${item.id}`}
                    data-nav={item.id}
                    data-testid={`nav-link-${item.id}`}
                    aria-current={isHome && active === item.id ? "true" : undefined}
                    className={`block rounded-full px-3.5 py-2 text-sm transition-colors duration-300 lg:px-4 ${
                      isHome && active === item.id ? "text-bone" : "text-mute hover:text-bone"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-0.5 left-0 h-px bg-gold transition-[transform,width,opacity] duration-500 ease-[var(--ease-out-expo)]"
                style={{ width: bar.w * 0.5, transform: `translateX(${bar.x + bar.w * 0.25}px)`, opacity: bar.show ? 1 : 0 }}
              />
            </ul>
          </nav>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            data-testid="mobile-menu-toggle"
            className="relative -mr-2 flex h-11 w-11 items-center justify-center rounded-full md:hidden"
          >
            <span className={`absolute h-px w-5 bg-bone transition-transform duration-500 ${open ? "rotate-45" : "-translate-y-[4px]"}`} />
            <span className={`absolute h-px w-5 bg-bone transition-transform duration-500 ${open ? "-rotate-45" : "translate-y-[4px]"}`} />
          </button>
        </div>
      </header>
      <MobileMenu open={open} onClose={() => setOpen(false)} active={isHome ? active : ""} />
    </>
  );
}
