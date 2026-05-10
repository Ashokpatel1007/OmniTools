import { Card, CardContent } from "@/components/ui/card";

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <Card>
      <CardContent className="py-10 text-center">
        <p className="text-base font-medium text-slate-950 dark:text-slate-50">{title}</p>
        {description ? <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{description}</p> : null}
      </CardContent>
    </Card>
  );
}
