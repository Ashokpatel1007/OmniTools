"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Crown, Menu, Search, Sparkles, X } from "lucide-react";
import { navItems, siteConfig } from "@/lib/site";
import { ThemeToggle } from "@/components/theme-toggle";
import { useState } from "react";

const desktopNav = navItems.filter((item) => item.href !== "/donate");

export function Navigation() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-950/75">
      <div className="container-shell flex min-h-16 items-center justify-between gap-3 py-3">
        <Link
          href="/"
          className="flex items-center gap-3 font-semibold tracking-tight text-slate-950 dark:text-slate-50"
        >
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-soft dark:bg-white dark:text-slate-950">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="hidden sm:block">{siteConfig.name}</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {desktopNav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href as "/" | "/categories" | "/favorites" | "/recent" | "/search"}
                className={
                  active
                    ? "rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white shadow-soft dark:bg-white dark:text-slate-950"
                    : "rounded-full px-4 py-2 text-sm text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-slate-50"
                }
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden md:block">
            <ThemeToggle />
          </div>

          <Link
            href="/premium"
            className="hidden items-center gap-2 rounded-2xl bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200 md:inline-flex"
          >
            <Crown className="h-4 w-4" />
            Get Premium
          </Link>

          <Link
            href="/premium"
            aria-label="Get Premium"
            className="inline-flex items-center justify-center rounded-2xl bg-slate-950 p-2 text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200 md:hidden"
          >
            <Crown className="h-4 w-4" />
          </Link>

          <button
            className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white p-2 text-slate-950 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:hover:bg-slate-900 lg:hidden"
            aria-label="Menu"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute right-3 top-3 w-[min(92vw,360px)] rounded-[2rem] border border-slate-200 bg-white p-4 shadow-medium dark:border-slate-800 dark:bg-slate-950"
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              transition={{ duration: 0.18 }}
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-950 dark:text-slate-50">Menu</span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900"
                  aria-label="Close menu"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href as "/" | "/categories" | "/favorites" | "/recent" | "/search" | "/donate"}
                    onClick={() => setMobileOpen(false)}
                    className={
                      pathname === item.href
                        ? "block rounded-2xl bg-slate-950 px-4 py-3 text-sm font-medium text-white dark:bg-white dark:text-slate-950"
                        : "block rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900"
                    }
                  >
                    {item.label}
                  </Link>
                ))}

                <div className="pt-2">
                  <ThemeToggle />
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
