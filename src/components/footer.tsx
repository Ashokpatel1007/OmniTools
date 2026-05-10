import Link from "next/link";
import { siteConfig } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t border-slate-200/80 bg-white/70 backdrop-blur dark:border-slate-800/80 dark:bg-slate-950/70">
      <div className="container-shell py-8 sm:py-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {siteConfig.name} keeps utility pages simple, fast, and easy to scan.
          </p>
          <div className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400">
            <Link href="/about" className="transition hover:text-slate-950 dark:hover:text-slate-50">About</Link>
            <Link href="/privacy" className="transition hover:text-slate-950 dark:hover:text-slate-50">Privacy</Link>
            <Link href="/terms" className="transition hover:text-slate-950 dark:hover:text-slate-50">Terms</Link>
            <Link href="/contact" className="transition hover:text-slate-950 dark:hover:text-slate-50">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
