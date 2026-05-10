import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SeoContentBlock({ title, body }: { title: string; body: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">{body}</p>
      </CardContent>
    </Card>
  );
}
