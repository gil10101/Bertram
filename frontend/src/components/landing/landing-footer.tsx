import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="py-8 px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-4 text-[0.75rem] text-charcoal-300 border-t border-dust/50">
      <span>© 2026 Bertram</span>
      <div className="flex gap-8">
        <Link
          href="#"
          className="opacity-60 hover:opacity-100 transition-opacity"
        >
          Privacy
        </Link>
        <Link
          href="#"
          className="opacity-60 hover:opacity-100 transition-opacity"
        >
          Terms
        </Link>
        <Link
          href="#"
          className="opacity-60 hover:opacity-100 transition-opacity"
        >
          Twitter
        </Link>
        <Link
          href="#"
          className="opacity-60 hover:opacity-100 transition-opacity"
        >
          GitHub
        </Link>
      </div>
    </footer>
  );
}
