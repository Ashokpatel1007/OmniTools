import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";

export default function Page() {
  return (
    <div className="container-shell space-y-8">
      <PageHeader eyebrow="Terms" title="Terms of Use" description="Straightforward terms for a utility platform built around practical work." />
      <Card>
        <CardContent className="p-6 text-sm leading-6 text-slate-600 dark:text-slate-400">
          Use the tools responsibly, especially for file and media workflows that must respect copyright and legal restrictions.
        </CardContent>
      </Card>
    </div>
  );
}
