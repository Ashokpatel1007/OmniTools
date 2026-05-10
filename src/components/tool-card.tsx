import Link from "next/link";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toolIcon } from "@/lib/icon-map";
import { slugToLabel } from "@/lib/utils";
import type { ToolEntry } from "@/lib/tools/types";
import { ArrowUpRight } from "lucide-react";

export function ToolCard({ tool }: { tool: ToolEntry }) {
  const Icon = toolIcon(tool.icon);
  return (
    <Link href={`/${tool.category}/${tool.slug}`} className="group block">
      <Card className="h-full transition duration-200 hover:-translate-y-0.5 hover:shadow-soft">
        <CardHeader>
          <div className="mb-4 flex items-center justify-between">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
              <Icon className="h-5 w-5" />
            </div>
            <ArrowUpRight className="h-4 w-4 text-slate-400 transition group-hover:text-slate-950 dark:text-slate-500 dark:group-hover:text-slate-50" />
          </div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
            {slugToLabel(tool.category)}
          </p>
          <CardTitle className="mt-3 text-base">{tool.title}</CardTitle>
          <CardDescription className="mt-2">{tool.shortDescription}</CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
}
