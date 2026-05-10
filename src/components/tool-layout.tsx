import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { FavoriteButton } from "@/components/favorite-button";
import { RelatedTools } from "@/components/related-tools";
import { ToolWorkbench } from "@/components/tool/tool-workbench";
import type { ToolEntry } from "@/lib/tools/types";
import { slugToLabel } from "@/lib/utils";

export function ToolLayout({ tool }: { tool: ToolEntry }) {
  return (
    <div className="container-shell space-y-8">
      <div className="flex flex-col gap-4 rounded-[2rem] border border-slate-200/80 bg-white/90 p-6 shadow-soft backdrop-blur dark:border-slate-800 dark:bg-slate-950/80 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-slate-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
            {slugToLabel(tool.category)}
          </span>

          <div className="flex items-center gap-2">
            <FavoriteButton slug={tool.slug} />
            <Link href={`/${tool.category}`} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-950 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:hover:bg-slate-900">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </div>
        </div>

        <div className="max-w-3xl space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-slate-50 sm:text-4xl">
            {tool.title}
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400 sm:text-base">
            {tool.shortDescription}
          </p>
        </div>
      </div>

      <ToolWorkbench tool={tool} />

      <div className="space-y-4">
        <h2 className="section-heading">Related tools</h2>
        <RelatedTools tool={tool} />
      </div>
    </div>
  );
}
