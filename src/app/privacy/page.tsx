import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";

export default function Page() {
  return (
    <div className="container-shell space-y-8">
      <PageHeader eyebrow="Privacy" title="Privacy Policy" description="How OmniTools handles browser-side workflows and account data." />
      <Card>
        <CardContent className="p-6 text-sm leading-6 text-slate-600 dark:text-slate-400">
          The product favors client-side processing where possible and stores account actions only when needed for sync, favorites, and recent history.
        </CardContent>
      </Card>
    </div>
  );
}
