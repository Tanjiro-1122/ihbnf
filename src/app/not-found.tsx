import Link from "next/link";
import { Arrow } from "@/components/ui/Icons";

export default function NotFound() {
  return (
    <section data-testid="not-found-page" className="shell flex min-h-[80svh] flex-col justify-center pt-24">
      <p className="eyebrow text-gold">404</p>
      <h1 className="mt-5 font-display text-[clamp(3rem,8vw,6rem)] leading-none">Nothing grew here.</h1>
      <p className="mt-6 max-w-md text-lg text-mute">The page you were looking for doesn&apos;t exist, or it moved.</p>
      <Link href="/" data-testid="not-found-home-btn" className="btn btn-primary mt-10 self-start">
        Back to IHBNF <Arrow />
      </Link>
    </section>
  );
}
