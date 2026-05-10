import { Card, CardContent } from "@/components/ui/card";

export function ErrorState({ title, description }: { title: string; description?: string }) {
  return (
    <Card className="border-rose-200 bg-rose-50 dark:border-rose-900 dark:bg-rose-950/40">
      <CardContent className="py-8">
        <p className="font-medium text-rose-900 dark:text-rose-200">{title}</p>
        {description ? <p className="mt-2 text-sm text-rose-800 dark:text-rose-300">{description}</p> : null}
      </CardContent>
    </Card>
  );
}
