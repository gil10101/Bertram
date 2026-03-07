import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="flex flex-col items-center justify-between gap-4 border-t border-charcoal-400/20 px-6 py-8 text-[0.75rem] text-dust-500 md:flex-row md:px-12">
      <span>&copy; 2026 Bertram</span>
      <div className="flex gap-8">
        <Link
          href="#"
          className="text-dust-500 transition-colors hover:text-floral"
        >
          Privacy
        </Link>
        <Link
          href="#"
          className="text-dust-500 transition-colors hover:text-floral"
        >
          Terms
        </Link>
        <Link
          href="#"
          className="text-dust-500 transition-colors hover:text-floral"
        >
          Twitter
        </Link>
        <Link
          href="#"
          className="text-dust-500 transition-colors hover:text-floral"
        >
          GitHub
        </Link>
      </div>
    </footer>
  );
}
