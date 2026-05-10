"use client";

import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { ToolCard } from "@/components/tool-card";
import { useFavorites } from "@/hooks/use-favorites";
import { toolBySlug } from "@/lib/tools/registry";

export default function FavoritesPage() {
  const { favorites } = useFavorites();
  const items = favorites.map((slug) => toolBySlug.get(slug)).filter(Boolean);

  return (
    <div className="container-shell space-y-8">
      <PageHeader eyebrow="Favorites" title="Pinned tools" description="Your saved tools appear here for quicker access." />
      {items.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {items.map((tool) => tool ? <ToolCard key={tool.slug} tool={tool} /> : null)}
        </div>
      ) : (
        <EmptyState title="No favorites yet" description="Open a tool page and tap save to pin it here." />
      )}
    </div>
  );
}
