import { SearchBar } from "@/components/search-bar";
import { CategoryFilter } from "@/components/category-filter";
import { CategoryGrid } from "@/components/category-grid";
import { ToolCard } from "@/components/tool-card";
import { UserShelf } from "@/components/user-shelf";
import { featuredTools, popularTools, categoryStats } from "@/lib/tools/registry";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

const heroMetrics = [
  { label: "Categories", value: `${categoryStats.length}` },
  { label: "Featured tools", value: `${featuredTools.length}` },
  { label: "Fast access", value: "Search-first" },
];

export default function HomePage() {
  return (
    <div className="container-shell space-y-12">
      <section className="space-y-8 rounded-[2rem] border border-slate-200/80 bg-white/90 p-6 shadow-soft backdrop-blur dark:border-slate-800 dark:bg-slate-950/80 sm:p-8">
        <div className="max-w-4xl space-y-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-slate-100/80 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-slate-500 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-400">
            <Sparkles className="h-3.5 w-3.5" />
            OmniTools
          </span>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-950 dark:text-slate-50 sm:text-5xl">
            A cleaner place to find the right utility.
          </h1>
          <p className="max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-400 sm:text-base">
            Search first, open the tool you need, and stay focused while you work.
          </p>
        </div>

        <div className="max-w-2xl space-y-3">
          <SearchBar placeholder="Search image, PDF, video, developer, text, and file tools" />
          <CategoryFilter />
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {heroMetrics.map((metric) => (
            <div key={metric.label} className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/60">
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{metric.label}</p>
              <p className="mt-1 text-lg font-semibold text-slate-950 dark:text-slate-50">{metric.value}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href="/categories" className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200">
            Browse categories <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/search" className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:hover:bg-slate-900">
            Search tools
          </Link>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="section-heading">Featured tools</h2>
          <p className="section-subtitle">The highest-leverage utilities, surfaced first.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {featuredTools.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="section-heading">Popular tools</h2>
          <p className="section-subtitle">Frequently used pages arranged for quick access.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {popularTools.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="section-heading">Quick access</h2>
          <p className="section-subtitle">Pick up where you left off with recent and saved tools.</p>
        </div>
        <UserShelf />
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="section-heading">All categories</h2>
          <p className="section-subtitle">Browse by task family instead of digging through a flat list.</p>
        </div>
        <CategoryGrid />
      </section>
    </div>
  );
}
