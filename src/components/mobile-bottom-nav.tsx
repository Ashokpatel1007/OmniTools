import Link from "next/link";
import { Heart, Home, Search, Sparkles } from "lucide-react";

const items = [
  { href: "/", label: "Home", icon: Home },
  { href: "/search", label: "Search", icon: Search },
  { href: "/favorites", label: "Favs", icon: Heart },
  { href: "/donate", label: "Support", icon: Sparkles },
];

export function MobileBottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white px-2 py-2 backdrop-blur dark:border-slate-800 dark:bg-slate-950 sm:hidden">
      <div className="grid grid-cols-4 gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href as "/" | "/search" | "/favorites" | "/donate"}
              className="flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] text-slate-600 dark:text-slate-400"
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
