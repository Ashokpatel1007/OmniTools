import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function SponsorCard({ compact }: { compact?: boolean }) {
  return (
    <Card className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-950 dark:to-slate-900">
      <CardHeader className={compact ? "p-4 pb-2" : ""}>
        <CardTitle className={compact ? "text-base" : ""}>Support the project</CardTitle>
        <CardDescription>
          Help keep the suite fast, simple, and independent.
        </CardDescription>
      </CardHeader>
      <CardContent className={compact ? "p-4 pt-0" : ""}>
        <Link href="/donate" className="text-sm font-medium text-slate-950 underline-offset-4 hover:underline dark:text-slate-50">
          Open the support page
        </Link>
      </CardContent>
    </Card>
  );
}
