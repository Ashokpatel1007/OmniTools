import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ToolFaqItem } from "@/lib/tools/types";

export function FAQBlock({ items }: { items: ToolFaqItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Frequently asked questions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item) => (
          <div key={item.question} className="rounded-2xl border border-slate-200/80 p-4 dark:border-slate-800">
            <p className="font-medium text-slate-950 dark:text-slate-50">{item.question}</p>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{item.answer}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
