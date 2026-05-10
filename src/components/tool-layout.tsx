import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FavoriteButton } from "@/components/favorite-button";
import { FAQBlock } from "@/components/faq-block";
import { HowToBlock } from "@/components/howto-block";
import { RelatedTools } from "@/components/related-tools";
import { ToolWorkbench } from "@/components/tool/tool-workbench";
import type { ToolEntry } from "@/lib/tools/types";
import { ArrowLeft } from "lucide-react";
import { slugToLabel } from "@/lib/utils";
import Link from "next/link";

export function ToolLayout({ tool }: { tool: ToolEntry }) {
  return (
    <div className="container-shell space-y-8">
      <Card className="overflow-hidden bg-gradient-to-br from-white to-slate-50 dark:from-slate-950 dark:to-slate-900">
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="inline-flex items-center rounded-full border border-slate-200/80 bg-white px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
              {slugToLabel(tool.category)}
            </span>
            <div className="flex items-center gap-2">
              <FavoriteButton slug={tool.slug} />
              <Link href={`/${tool.category}`} className="inline-flex">
                <span className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-950 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:hover:bg-slate-900">
                  <ArrowLeft className="h-4 w-4" />
                  Category
                </span>
              </Link>
            </div>
          </div>

          <div className="max-w-3xl">
            <CardTitle className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-slate-50 sm:text-4xl">
              {tool.title}
            </CardTitle>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-400 sm:text-base">
              {tool.shortDescription}
            </p>
          </div>
        </CardHeader>
      </Card>

      <ToolWorkbench tool={tool} />

      <div className="space-y-6">
        <HowToBlock items={tool.howTo} />
        <FAQBlock items={tool.faq} />
        <div className="space-y-4">
          <h2 className="section-heading">Related tools</h2>
          <RelatedTools tool={tool} />
        </div>
      </div>
    </div>
  );
}
