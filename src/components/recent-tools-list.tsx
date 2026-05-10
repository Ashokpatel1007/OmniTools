import Link from "next/link";
import { toolBySlug } from "@/lib/tools/registry";

export function RecentToolsList({ slugs }: { slugs: string[] }) {
  if (!slugs.length) {
    return <p className="text-sm text-slate-600 dark:text-slate-400">No recent tools yet.</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {slugs.map((slug) => {
        const tool = toolBySlug.get(slug);
        if (!tool) return null;
        return (
          <Link
            key={slug}
            href={`/${tool.category}/${tool.slug}`}
            className="rounded-full border border-slate-200/80 bg-white px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900"
          >
            {tool.title}
          </Link>
        );
      })}
    </div>
  );
}
