import Link from "next/link";
import { categoryStats } from "@/lib/tools/registry";

export function CategoryFilter({ active }: { active?: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link href="/" className="rounded-full border border-slate-200/80 bg-white px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900">
        All
      </Link>
      {categoryStats.map((category) => (
        <Link
          key={category.slug}
          href={`/categories/${category.slug}`}
          className={
            active === category.slug
              ? "rounded-full bg-slate-950 px-3 py-1.5 text-sm font-medium text-white dark:bg-white dark:text-slate-950"
              : "rounded-full border border-slate-200/80 bg-white px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900"
          }
        >
          {category.title}
          <span className="ml-2 text-xs opacity-70">{category.count}</span>
        </Link>
      ))}
    </div>
  );
}
