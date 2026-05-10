import Link from "next/link";
import { toolBySlug } from "@/lib/tools/registry";
import type { ToolEntry } from "@/lib/tools/types";

export function RelatedTools({ tool }: { tool: ToolEntry }) {
  const items = tool.related
    .map((slug) => toolBySlug.get(slug))
    .filter(Boolean)
    .slice(0, 6);

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((entry) => (
        <Link
          key={entry!.slug}
          href={`/${entry!.category}/${entry!.slug}`}
          className="rounded-2xl border border-slate-200/80 bg-white p-4 text-sm transition hover:-translate-y-0.5 hover:shadow-soft dark:border-slate-800 dark:bg-slate-950/80 dark:hover:bg-slate-900"
        >
          <p className="font-medium text-slate-950 dark:text-slate-50">{entry!.title}</p>
          <p className="mt-1 text-slate-600 dark:text-slate-400">{entry!.shortDescription}</p>
        </Link>
      ))}
    </div>
  );
}
