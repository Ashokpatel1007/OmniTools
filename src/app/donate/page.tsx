import { PageHeader } from "@/components/page-header";
import { SponsorCard } from "@/components/sponsor-card";
import { Card, CardContent } from "@/components/ui/card";

export default function DonatePage() {
  return (
    <div className="container-shell space-y-8">
      <PageHeader
        eyebrow="Support"
        title="Support the project"
        description="A small contribution helps keep the platform independent and well maintained."
      />
      <Card>
        <CardContent className="p-6 text-sm leading-6 text-slate-600 dark:text-slate-400">
          Contributions help fund better infrastructure, more tools, and a cleaner product.
        </CardContent>
      </Card>
      <SponsorCard />
    </div>
  );
}
