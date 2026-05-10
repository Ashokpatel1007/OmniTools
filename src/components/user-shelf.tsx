"use client";

import { useFavorites } from "@/hooks/use-favorites";
import { useRecentTools } from "@/hooks/use-recent-tools";
import { RecentToolsList } from "@/components/recent-tools-list";
import { toolBySlug } from "@/lib/tools/registry";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function UserShelf() {
  const { favorites } = useFavorites();
  const { recent } = useRecentTools();
  const favoriteTools = favorites.map((slug) => toolBySlug.get(slug)).filter(Boolean);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Recent tools</CardTitle>
        </CardHeader>
        <CardContent>
          <RecentToolsList slugs={recent} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Favorites</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {favoriteTools.length ? favoriteTools.map((tool) => (
              <Link key={tool!.slug} href={`/${tool!.category}/${tool!.slug}`} className="rounded-full border border-slate-200/80 bg-slate-100/80 px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300 dark:hover:bg-slate-800">
                {tool!.title}
              </Link>
            )) : <p className="text-sm text-slate-600 dark:text-slate-400">No favorites saved yet.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
