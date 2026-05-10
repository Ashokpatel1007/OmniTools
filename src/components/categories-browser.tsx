"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, ChevronDown, Search } from "lucide-react";
import { categorySeeds } from "@/lib/tools/categories";
import { categoryIcon } from "@/lib/icon-map";
import { getCategoryGroups } from "@/lib/tools/category-groups";
import { getToolsByCategory } from "@/lib/tools/registry";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function CategoriesBrowser() {
  const [active, setActive] = useState(categorySeeds[0]?.slug ?? "image");
  const [query, setQuery] = useState("");

  const categories = useMemo(() => categorySeeds, []);
  const tools = getToolsByCategory(active);
  const groups = getCategoryGroups(active);

  const filteredCategories = categories.filter((category) => {
    if (!query.trim()) return true;
    const haystack = `${category.title} ${category.description}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  });

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="space-y-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search categories"
            className="h-12 rounded-2xl pl-11 shadow-soft"
          />
        </div>

        <div className="space-y-2">
          {filteredCategories.map((category) => {
            const Icon = categoryIcon(category.slug);
            const activeClass = active === category.slug;
            return (
              <button
                key={category.slug}
                onClick={() => setActive(category.slug)}
                className={[
                  "flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition",
                  activeClass
                    ? "border-slate-950 bg-slate-950 text-white shadow-soft dark:border-white dark:bg-white dark:text-slate-950"
                    : "border-slate-200/80 bg-white/90 text-slate-700 hover:-translate-y-0.5 hover:shadow-soft dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-300 dark:hover:bg-slate-900",
                ].join(" ")}
              >
                <span className="flex items-center gap-3">
                  <span className={[
                    "inline-flex h-10 w-10 items-center justify-center rounded-2xl",
                    activeClass ? "bg-white/10" : "bg-slate-100 dark:bg-slate-900",
                  ].join(" ") }>
                    <Icon className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold">{category.title}</span>
                    <span className="block text-xs opacity-70">{getToolsByCategory(category.slug).length} tools</span>
                  </span>
                </span>
                <ChevronDown className={[
                  "h-4 w-4 transition",
                  activeClass ? "rotate-180" : "opacity-60",
                ].join(" ")} />
              </button>
            );
          })}
        </div>
      </aside>

      <section className="space-y-6">
        <Card className="overflow-hidden border border-slate-200/80 bg-white/85 shadow-soft backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
          <CardHeader className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-violet-200/80 bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700 dark:border-violet-900 dark:bg-violet-950/40 dark:text-violet-300">
                {tools.length} tools
              </span>
            </div>
            <CardTitle className="text-2xl">{categorySeeds.find((item) => item.slug === active)?.title}</CardTitle>
            <CardDescription className="max-w-3xl text-sm leading-6">
              Browse tool groups, then open the utility you need.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {tools.slice(0, 6).map((tool) => (
                <Link
                  key={tool.slug}
                  href={`/${tool.category}/${tool.slug}`}
                  className="group rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 transition hover:-translate-y-0.5 hover:shadow-soft dark:border-slate-800 dark:bg-slate-900/60"
                >
                  <p className="font-medium text-slate-950 dark:text-slate-50">{tool.title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">{tool.shortDescription}</p>
                  <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-violet-600 dark:text-violet-300">
                    Open <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <AnimatePresence mode="wait">
            {groups.map((group) => (
              <motion.div
                key={`${active}-${group.title}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
              >
                <Card className="h-full border border-slate-200/80 bg-white/90 shadow-soft dark:border-slate-800 dark:bg-slate-950/80">
                  <CardHeader>
                    <CardTitle className="text-base">{group.title}</CardTitle>
                    <CardDescription>{group.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {group.slugs.map((slug) => {
                        const tool = tools.find((entry) => entry.slug === slug);
                        if (!tool) return null;
                        return (
                          <Link
                            key={slug}
                            href={`/${tool.category}/${tool.slug}`}
                            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 transition hover:border-violet-300 hover:bg-violet-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:border-violet-700 dark:hover:bg-slate-900"
                          >
                            {tool.title}
                          </Link>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}
