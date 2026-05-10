import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

const perks = [
  "No ads",
  "Priority processing",
  "Batch processing",
  "Higher file limits",
  "Saved history",
  "Favorites sync",
  "Advanced export options",
];

export default function PremiumPage() {
  return (
    <div className="container-shell space-y-8">
      <PageHeader
        eyebrow="Get Premium"
        title="Get Premium"
        description="Unlock higher limits, faster queues, and a few advanced workflow extras."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {perks.map((perk) => (
          <Card key={perk}>
            <CardHeader>
              <CardTitle className="text-base">{perk}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>
      <Card>
        <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-medium text-slate-950 dark:text-slate-50">Built for frequent users who want a little more room to work.</p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Keep the experience calm, fast, and sustainable.</p>
          </div>
          <Link href="/donate" className="inline-flex rounded-2xl bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200">Support the project</Link>
        </CardContent>
      </Card>
    </div>
  );
}
