import Link from "next/link";
import { categoryStats } from "@/lib/tools/registry";
import { categoryIcon } from "@/lib/icon-map";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowUpRight } from "lucide-react";

export function CategoryGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {categoryStats.map((category) => {
        const Icon = categoryIcon(category.slug);
        return (
          <Link href={`/categories/${category.slug}`} key={category.slug} className="group">
            <Card className="h-full transition duration-200 hover:-translate-y-0.5 hover:shadow-soft">
              <CardHeader>
                <div className="mb-4 flex items-center justify-between">
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                    <Icon className="h-5 w-5" />
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-slate-400 transition group-hover:text-slate-950 dark:text-slate-500 dark:group-hover:text-slate-50" />
                </div>
                <CardTitle className="text-base">{category.title}</CardTitle>
                <CardDescription className="mt-1">{category.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-500 dark:text-slate-400">{category.count} tools</p>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
