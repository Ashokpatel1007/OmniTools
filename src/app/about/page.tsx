import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";

export default function Page() {
  return (
    <div className="container-shell space-y-8">
      <PageHeader eyebrow="About" title="About OmniTools" description="A focused utility suite with cleaner pages and simpler workflows." />
      <Card>
        <CardContent className="p-6 text-sm leading-6 text-slate-600 dark:text-slate-400">
          OmniTools groups practical micro-tools into a structure that is easier to scan, search, and extend.
        </CardContent>
      </Card>
    </div>
  );
}
