import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";

export default function Page() {
  return (
    <div className="container-shell space-y-8">
      <PageHeader eyebrow="Contact" title="Contact OmniTools" description="Use this page for support, partnerships, or feature requests." />
      <Card>
        <CardContent className="p-6 text-sm leading-6 text-slate-600 dark:text-slate-400">
          Send feedback, request new tools, or ask about integrations.
        </CardContent>
      </Card>
    </div>
  );
}
