import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ToolHowToStep } from "@/lib/tools/types";

export function HowToBlock({ items }: { items: ToolHowToStep[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>How to use this tool</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2">
        {items.map((item, index) => (
          <div key={item.title} className="rounded-2xl border border-slate-200/80 p-4 dark:border-slate-800">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Step {index + 1}</p>
            <p className="mt-1 font-medium text-slate-950 dark:text-slate-50">{item.title}</p>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{item.description}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
